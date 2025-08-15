import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for HMAC verification
    const body = await request.text()
    const signature = request.headers.get('X-Signature') || request.headers.get('x-hub-signature-256')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verify HMAC signature
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const expectedSignature = 'sha256=' + createHmac('sha256', webhookSecret)
      .update(body, 'utf8')
      .digest('hex')

    const providedSignature = signature.startsWith('sha256=') ? signature : `sha256=${signature}`
    
    if (!timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(providedSignature, 'utf8')
    )) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse JSON payload
    const payload = JSON.parse(body)
    
    // Handle different GitHub webhook events
    if (payload.action === 'completed' && payload.workflow_run) {
      await handleWorkflowRun(payload)
    } else if (payload.action === 'in_progress' && payload.workflow_run) {
      await handleWorkflowProgress(payload)
    } else if (payload.check_run) {
      await handleCheckRun(payload)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleWorkflowRun(payload: any) {
  const workflowRun = payload.workflow_run
  const runId = extractRunIdFromWorkflow(workflowRun)
  
  if (!runId) {
    console.log('No test run ID found in workflow')
    return
  }

  const status = mapWorkflowStatus(workflowRun.conclusion, workflowRun.status)
  const completedAt = workflowRun.status === 'completed' ? new Date() : null

  // Update test run
  const updatedRun = await prisma.testRun.update({
    where: { id: runId },
    data: {
      status,
      completedAt,
      commitSha: workflowRun.head_sha,
      commitMessage: workflowRun.head_commit?.message,
      workflowUrl: workflowRun.html_url,
      summary: generateSummary(status, workflowRun)
    }
  })

  // If we have artifacts or steps data in the payload, process them
  if (payload.artifacts) {
    await processArtifacts(runId, payload.artifacts)
  }

  if (payload.steps) {
    await processTestSteps(runId, payload.steps)
  }
}

async function handleWorkflowProgress(payload: any) {
  const workflowRun = payload.workflow_run
  const runId = extractRunIdFromWorkflow(workflowRun)
  
  if (!runId) return

  await prisma.testRun.update({
    where: { id: runId },
    data: {
      status: 'in_progress',
      workflowUrl: workflowRun.html_url
    }
  })
}

async function handleCheckRun(payload: any) {
  // Handle individual check run updates if needed
  const checkRun = payload.check_run
  const runId = extractRunIdFromCheck(checkRun)
  
  if (!runId) return

  // Process individual test step results
  if (checkRun.output?.annotations) {
    await processCheckAnnotations(runId, checkRun.output.annotations)
  }
}

function extractRunIdFromWorkflow(workflowRun: any): string | null {
  // Look for run ID in various places
  if (workflowRun.inputs?.run_id) {
    return workflowRun.inputs.run_id
  }
  
  // Check commit message or branch name
  const commitMessage = workflowRun.head_commit?.message || ''
  const runIdMatch = commitMessage.match(/run_id:(\w+)/)
  if (runIdMatch) {
    return runIdMatch[1]
  }

  return null
}

function extractRunIdFromCheck(checkRun: any): string | null {
  return checkRun.external_id || null
}

function mapWorkflowStatus(conclusion: string, status: string): string {
  if (status !== 'completed') {
    return status === 'in_progress' ? 'in_progress' : 'queued'
  }

  switch (conclusion) {
    case 'success':
      return 'completed'
    case 'failure':
      return 'failed'
    case 'cancelled':
      return 'cancelled'
    case 'timed_out':
      return 'timeout'
    default:
      return 'failed'
  }
}

function generateSummary(status: string, workflowRun: any): string {
  if (status === 'completed') {
    return 'All test steps completed successfully.'
  } else if (status === 'failed') {
    const duration = workflowRun.updated_at 
      ? Math.round((new Date(workflowRun.updated_at).getTime() - new Date(workflowRun.created_at).getTime()) / 1000)
      : 0
    return `Test failed after ${duration}s. Check the detailed steps below for specific failure points.`
  } else if (status === 'cancelled') {
    return 'Test run was cancelled before completion.'
  } else if (status === 'timeout') {
    return 'Test run exceeded the maximum execution time and was terminated.'
  }
  
  return 'Test run is in progress.'
}

async function processArtifacts(runId: string, artifacts: any[]) {
  // Update test run with main artifact URL
  if (artifacts.length > 0) {
    const mainArtifact = artifacts.find(a => a.name.includes('test-results')) || artifacts[0]
    
    await prisma.testRun.update({
      where: { id: runId },
      data: {
        artifactUrl: mainArtifact.archive_download_url
      }
    })
  }
}

async function processTestSteps(runId: string, steps: any[]) {
  // Create or update test steps
  for (const step of steps) {
    await prisma.testStep.upsert({
      where: {
        testRunId_name: {
          testRunId: runId,
          name: step.name
        }
      },
      update: {
        status: mapStepStatus(step.conclusion),
        actual: step.output?.summary,
        error: step.output?.text,
        duration: step.duration_ms,
        artifactUrl: step.artifact_url,
        screenshot: step.screenshot_url
      },
      create: {
        testRunId: runId,
        name: step.name,
        status: mapStepStatus(step.conclusion),
        action: step.action || step.name,
        expected: step.expected || 'Step should complete successfully',
        actual: step.output?.summary,
        error: step.output?.text,
        duration: step.duration_ms,
        artifactUrl: step.artifact_url,
        screenshot: step.screenshot_url
      }
    })
  }
}

async function processCheckAnnotations(runId: string, annotations: any[]) {
  // Process test failures from check annotations
  for (const annotation of annotations) {
    const stepName = annotation.title || `Line ${annotation.start_line}`
    
    await prisma.testStep.upsert({
      where: {
        testRunId_name: {
          testRunId: runId,
          name: stepName
        }
      },
      update: {
        status: annotation.annotation_level === 'failure' ? 'failed' : 'passed',
        error: annotation.message,
        actual: annotation.raw_details
      },
      create: {
        testRunId: runId,
        name: stepName,
        status: annotation.annotation_level === 'failure' ? 'failed' : 'passed',
        action: stepName,
        expected: 'No errors',
        error: annotation.message,
        actual: annotation.raw_details
      }
    })
  }
}

function mapStepStatus(conclusion: string): string {
  switch (conclusion) {
    case 'success':
      return 'passed'
    case 'failure':
      return 'failed'
    case 'skipped':
      return 'skipped'
    default:
      return 'pending'
  }
}