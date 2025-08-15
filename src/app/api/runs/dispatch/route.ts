import { NextRequest, NextResponse } from 'next/server'
import { RunDispatchRequestSchema, RunDispatchResponseSchema } from '@/lib/schemas'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testCaseId, environment, testData } = RunDispatchRequestSchema.parse(body)

    // Get test case details
    const { prisma } = await import('@/lib/prisma')
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: { project: true }
    })

    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      )
    }

    // Create test run record
    const testRun = await prisma.testRun.create({
      data: {
        name: `${testCase.name} - ${new Date().toLocaleDateString()}`,
        status: 'pending',
        environment,
        projectId: testCase.projectId
      }
    })

    // Simulate GitHub Actions workflow dispatch
    const workflowDispatchResult = await dispatchGitHubWorkflow(testRun.id, testCase, environment, testData)

    const response = {
      runId: testRun.id,
      workflowUrl: workflowDispatchResult.workflowUrl,
      status: 'queued' as const
    }

    // Update test run with workflow URL
    await prisma.testRun.update({
      where: { id: testRun.id },
      data: { status: 'in_progress' }
    })

    return NextResponse.json(RunDispatchResponseSchema.parse(response))
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function dispatchGitHubWorkflow(runId: string, testCase: any, environment: string, testData: any) {
  // In a real implementation, this would call GitHub API:
  // 
  // const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `token ${process.env.GITHUB_TOKEN}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     ref: 'main',
  //     inputs: {
  //       test_case_id: testCase.id,
  //       environment,
  //       test_data: JSON.stringify(testData),
  //       run_id: runId
  //     }
  //   })
  // })

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
  
  return {
    workflowUrl: `https://github.com/samurai-bot/TestHub/actions/runs/${generateRunNumber()}`,
    status: 'dispatched'
  }
}

function generateRunNumber() {
  return Math.floor(Math.random() * 1000000) + 1000000
}