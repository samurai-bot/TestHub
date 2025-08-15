import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TestTube2, PlayCircle } from "lucide-react"
import Link from "next/link"

interface ProjectPageProps {
  params: { id: string }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Name</h1>
          <p className="text-muted-foreground">Project description would go here</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/projects/${params.id}/cases/new`}>
              <Plus className="h-4 w-4 mr-2" />
              New Test Case
            </Link>
          </Button>
          <Button variant="outline">
            <PlayCircle className="h-4 w-4 mr-2" />
            Run Tests
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              Test Cases
            </CardTitle>
            <CardDescription>Manage your test scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <TestTube2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No test cases yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create test cases to define your testing scenarios
              </p>
              <Button asChild size="sm">
                <Link href={`/projects/${params.id}/cases/new`}>
                  Add Test Case
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Test Runs
            </CardTitle>
            <CardDescription>Execution history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No test runs</h3>
              <p className="text-sm text-muted-foreground">
                Run your test cases to see results here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}