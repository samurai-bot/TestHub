"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, PlayCircle, CheckCircle, XCircle, Clock, FileText, ExternalLink, Copy, Share, Bug } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface TestRunPageProps {
  params: { id: string }
}

interface TestRun {
  id: string
  name: string
  status: string
  startedAt: string
  completedAt?: string
  environment?: string
  commitSha?: string
  commitMessage?: string
  workflowUrl?: string
  artifactUrl?: string
  summary?: string
  project: {
    name: string
  }
  testSteps: TestStep[]
}

interface TestStep {
  id: string
  name: string
  status: string
  action: string
  expected: string
  actual?: string
  error?: string
  duration?: number
  artifactUrl?: string
  screenshot?: string
}

export default function TestRunPage({ params }: TestRunPageProps) {
  const [testRun, setTestRun] = useState<TestRun | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTestRun()
  }, [params.id])

  const fetchTestRun = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTestRun: TestRun = {
        id: params.id,
        name: "User Signup Test - 2024-01-15",
        status: "failed",
        startedAt: "2024-01-15T10:30:00Z",
        completedAt: "2024-01-15T10:32:45Z",
        environment: "staging",
        commitSha: "abc123f",
        commitMessage: "Add email validation to signup form",
        workflowUrl: "https://github.com/samurai-bot/TestHub/actions/runs/123456",
        artifactUrl: "https://github.com/samurai-bot/TestHub/artifacts/789",
        summary: "Failed at step 'Apply promo code': expected price to drop from $99.00 to $79.20 but remained at $99.00. This suggests the promo code validation logic is not working correctly.",
        project: {
          name: "E-commerce App"
        },
        testSteps: [
          {
            id: "1",
            name: "Navigate to signup page",
            status: "passed",
            action: "Navigate to /signup",
            expected: "Signup form loads correctly",
            duration: 1200,
            artifactUrl: "https://github.com/artifacts/screenshot1.png"
          },
          {
            id: "2", 
            name: "Enter user details",
            status: "passed",
            action: "Fill email and password fields",
            expected: "Form accepts valid input",
            duration: 800
          },
          {
            id: "3",
            name: "Apply promo code",
            status: "failed",
            action: "Enter code SAVE20 and click apply",
            expected: "Price drops from $99.00 to $79.20",
            actual: "Price remained at $99.00",
            error: "AssertionError: expected '$79.20' but got '$99.00'",
            duration: 2100,
            artifactUrl: "https://github.com/artifacts/failure-screenshot.png",
            screenshot: "https://github.com/artifacts/promo-failure.png"
          },
          {
            id: "4",
            name: "Complete purchase",
            status: "skipped",
            action: "Click purchase button",
            expected: "Order confirmation displayed"
          }
        ]
      }
      setTestRun(mockTestRun)
    } catch (error) {
      console.error('Failed to fetch test run:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        )
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "skipped":
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return "—"
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
  }

  const copyShareLink = async () => {
    // Generate 24h signed URL (mock)
    const shareUrl = `${window.location.origin}/share/runs/${params.id}?token=abc123&expires=${Date.now() + 86400000}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Share link copied",
        description: "Link is valid for 24 hours"
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive"
      })
    }
  }

  const createJiraTicket = () => {
    toast({
      title: "Jira integration",
      description: "This would create a Jira ticket with test failure details"
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!testRun) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Test Run Not Found</h1>
          <p className="text-muted-foreground">The requested test run could not be found.</p>
        </div>
      </div>
    )
  }

  const duration = testRun.completedAt 
    ? Math.round((new Date(testRun.completedAt).getTime() - new Date(testRun.startedAt).getTime()) / 1000)
    : null

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{testRun.name}</h1>
            <p className="text-muted-foreground">{testRun.project.name} • {testRun.environment}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(testRun.status)}
            {testRun.workflowUrl && (
              <Button variant="outline" size="sm" asChild>
                <Link href={testRun.workflowUrl} target="_blank">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  GitHub
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {testRun.summary && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <p className="text-sm text-red-800">{testRun.summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {/* Run Details */}
          <Card>
            <CardHeader>
              <CardTitle>Run Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Started</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(testRun.startedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Duration</h4>
                  <p className="text-sm text-muted-foreground">
                    {duration ? `${duration}s` : "—"}
                  </p>
                </div>
                {testRun.commitSha && (
                  <div>
                    <h4 className="font-medium mb-1">Commit</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {testRun.commitSha}
                    </p>
                  </div>
                )}
                {testRun.commitMessage && (
                  <div>
                    <h4 className="font-medium mb-1">Message</h4>
                    <p className="text-sm text-muted-foreground">
                      {testRun.commitMessage}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Test Steps</CardTitle>
              <CardDescription>Detailed execution steps and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testRun.testSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      step.status === 'failed' ? 'bg-red-50 border-red-200' :
                      step.status === 'passed' ? 'bg-green-50 border-green-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStepIcon(step.status)}
                        <div className="flex-1">
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">{step.action}</div>
                          {step.error && (
                            <div className="text-sm text-red-600 mt-1 font-mono bg-red-100 p-2 rounded">
                              {step.error}
                            </div>
                          )}
                          {step.actual && step.status === 'failed' && (
                            <div className="text-sm mt-1">
                              <span className="text-muted-foreground">Expected:</span> {step.expected}<br />
                              <span className="text-muted-foreground">Actual:</span> {step.actual}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(step.duration)}
                        </span>
                        {step.artifactUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={step.artifactUrl} target="_blank">
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Steps</span>
                <span className="font-medium">{testRun.testSteps.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Passed
                </span>
                <span className="font-medium">
                  {testRun.testSteps.filter(s => s.status === 'passed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  Failed
                </span>
                <span className="font-medium">
                  {testRun.testSteps.filter(s => s.status === 'failed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  Skipped
                </span>
                <span className="font-medium">
                  {testRun.testSteps.filter(s => s.status === 'skipped').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={createJiraTicket}
              >
                <Bug className="h-4 w-4 mr-2" />
                Create Jira Ticket
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={copyShareLink}
              >
                <Share className="h-4 w-4 mr-2" />
                Share Report
              </Button>
              {testRun.artifactUrl && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={testRun.artifactUrl} target="_blank">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Artifacts
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}