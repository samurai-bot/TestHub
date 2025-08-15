import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TestTube2, FileText, PlayCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your test projects and recent runs</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Projects
            </CardTitle>
            <CardDescription>Your test projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <TestTube2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first project to start organizing test cases
              </p>
              <Button asChild size="sm">
                <Link href="/projects/new">Create Project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Recent Runs
            </CardTitle>
            <CardDescription>Latest test executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No test runs</h3>
              <p className="text-sm text-muted-foreground">
                Test runs will appear here once you start testing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}