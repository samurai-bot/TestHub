import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, PlayCircle, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface TestCasePageProps {
  params: { caseId: string }
}

export default function TestCasePage({ params }: TestCasePageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/projects/1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">User Login Test</h1>
            <p className="text-muted-foreground">Test case details and execution history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button>
              <PlayCircle className="h-4 w-4 mr-2" />
              Run Test
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  Verify that users can successfully log in with valid credentials
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Priority</h4>
                <Badge variant="secondary">High</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Test Steps</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Navigate to the login page</li>
                  <li>Enter valid username</li>
                  <li>Enter valid password</li>
                  <li>Click the login button</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">Expected Result</h4>
                <p className="text-sm text-muted-foreground">
                  User should be successfully logged in and redirected to the dashboard
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>Recent test run results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No executions yet</h3>
                <p className="text-sm text-muted-foreground">
                  Run this test case to see execution history
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Runs</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Run</span>
                <span className="font-medium">Never</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}