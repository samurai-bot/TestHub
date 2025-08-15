"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Database, CheckCircle, FileCode, Play, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import Link from "next/link"

interface DetailsStepProps {
  data: {
    environment: string
    testData: {
      email: string
      promoCode: string
    }
    successCriteria: string[]
  }
  onDataChange: (data: Partial<{
    environment: string
    testData: {
      email: string
      promoCode: string
    }
    successCriteria: string[]
  }>) => void
  projectId: string
  generatedPlan?: {
    title: string
    description: string
    steps: Array<{
      action: string
      expected: string
      data?: Record<string, string>
    }>
    priority: string
    tags?: string[]
  }
}

const environments = [
  { value: "development", label: "Development", description: "Local development environment" },
  { value: "staging", label: "Staging", description: "Pre-production testing environment" },
  { value: "production", label: "Production", description: "Live production environment" }
]

const commonSuccessCriteria = [
  {
    id: "ui_loads",
    label: "UI elements load correctly",
    description: "All necessary UI components are visible and functional"
  },
  {
    id: "data_validates",
    label: "Data validation works",
    description: "Form validation and error handling work as expected"
  },
  {
    id: "success_message",
    label: "Success message displays",
    description: "User receives confirmation of successful action"
  },
  {
    id: "database_updated",
    label: "Database is updated",
    description: "Data is properly saved to the database"
  },
  {
    id: "email_sent",
    label: "Email notification sent",
    description: "Appropriate email notifications are triggered"
  },
  {
    id: "analytics_tracked",
    label: "Analytics event fired",
    description: "User action is tracked in analytics"
  },
  {
    id: "redirect_occurs",
    label: "User is redirected",
    description: "User is taken to the correct next page"
  },
  {
    id: "error_handling",
    label: "Error handling works",
    description: "Errors are caught and displayed appropriately"
  }
]

export function DetailsStep({ data, onDataChange, projectId, generatedPlan }: DetailsStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()
  const handleEnvironmentChange = (environment: string) => {
    onDataChange({ environment })
  }

  const handleTestDataChange = (field: string, value: string) => {
    onDataChange({
      testData: {
        ...data.testData,
        [field]: value
      }
    })
  }

  const handleSuccessCriteriaToggle = (criteriaId: string) => {
    const updatedCriteria = data.successCriteria.includes(criteriaId)
      ? data.successCriteria.filter(id => id !== criteriaId)
      : [...data.successCriteria, criteriaId]
    
    onDataChange({ successCriteria: updatedCriteria })
  }

  const generateTest = async () => {
    if (!generatedPlan) {
      toast({
        title: "No plan available",
        description: "Please generate a test plan in Step 2 first.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/cases/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: generatedPlan,
          projectId,
          environment: data.environment,
          testData: data.testData,
          successCriteria: data.successCriteria
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: "Test generated successfully",
          description: `Created ${result.fileName} with Playwright test code.`,
          action: (
            <ToastAction altText="View test case" asChild>
              <Link href={`/cases/${result.testCaseId}`}>
                View Test Case
              </Link>
            </ToastAction>
          )
        })
      } else {
        throw new Error(result.error || 'Failed to generate test')
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate test case.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const runTest = async () => {
    if (!generatedPlan) {
      toast({
        title: "No plan available",
        description: "Please generate a test plan in Step 2 first.",
        variant: "destructive"
      })
      return
    }

    setIsRunning(true)
    try {
      // First generate the test if it doesn't exist
      const generateResponse = await fetch('/api/cases/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: generatedPlan,
          projectId,
          environment: data.environment,
          testData: data.testData,
          successCriteria: data.successCriteria
        })
      })

      const generateResult = await generateResponse.json()
      
      if (!generateResponse.ok) {
        throw new Error(generateResult.error || 'Failed to generate test')
      }

      // Then dispatch the run
      const runResponse = await fetch('/api/runs/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testCaseId: generateResult.testCaseId,
          environment: data.environment,
          testData: data.testData
        })
      })

      const runResult = await runResponse.json()
      
      if (runResponse.ok) {
        toast({
          title: "Test run started",
          description: "Your test is now running in GitHub Actions.",
          action: (
            <ToastAction altText="View run" asChild>
              <Link href={`/runs/${runResult.runId}`}>
                <ExternalLink className="h-3 w-3 mr-1" />
                View Run
              </Link>
            </ToastAction>
          )
        })
      } else {
        throw new Error(runResult.error || 'Failed to start test run')
      }
    } catch (error) {
      toast({
        title: "Run failed",
        description: error instanceof Error ? error.message : "Failed to start test run.",
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Environment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Test Environment
          </CardTitle>
          <CardDescription>
            Choose where this test should be executed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={data.environment} onValueChange={handleEnvironmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.value} value={env.value}>
                  <div>
                    <div className="font-medium">{env.label}</div>
                    <div className="text-xs text-muted-foreground">{env.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Test Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Test Data
          </CardTitle>
          <CardDescription>
            Provide test data that will be used during execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-email">Test Email</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={data.testData.email}
                onChange={(e) => handleTestDataChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="promo-code">Promo Code</Label>
              <Input
                id="promo-code"
                placeholder="SAVE20"
                value={data.testData.promoCode}
                onChange={(e) => handleTestDataChange('promoCode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4" />
            Success Criteria
          </CardTitle>
          <CardDescription>
            Select what conditions must be met for this test to pass
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {commonSuccessCriteria.map((criteria) => (
              <div
                key={criteria.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={criteria.id}
                  checked={data.successCriteria.includes(criteria.id)}
                  onCheckedChange={() => handleSuccessCriteriaToggle(criteria.id)}
                />
                <div className="flex-1">
                  <label
                    htmlFor={criteria.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {criteria.label}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {criteria.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {data.successCriteria.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-2">
                Selected Success Criteria ({data.successCriteria.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {data.successCriteria.map((criteriaId) => {
                  const criteria = commonSuccessCriteria.find(c => c.id === criteriaId)
                  return (
                    <Badge key={criteriaId} variant="secondary" className="text-xs">
                      {criteria?.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {generatedPlan && (
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCode className="h-4 w-4" />
              Ready to Execute
            </CardTitle>
            <CardDescription>
              Generate the Playwright test file or run the test immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                onClick={generateTest}
                disabled={isGenerating || !data.environment}
                variant="outline"
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileCode className="h-4 w-4 mr-2" />
                    Generate Test
                  </>
                )}
              </Button>
              
              <Button 
                onClick={runTest}
                disabled={isRunning || !data.environment}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground mt-3">
              <strong>Generate Test:</strong> Creates a Playwright .spec.ts file and saves the test case.<br />
              <strong>Run Now:</strong> Generates the test and immediately triggers GitHub Actions workflow.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}