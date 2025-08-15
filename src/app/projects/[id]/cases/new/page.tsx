"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { TemplateStep } from "@/components/wizard/template-step"
import { DescriptionStep } from "@/components/wizard/description-step"
import { DetailsStep } from "@/components/wizard/details-step"
import { getTemplateById } from "@/lib/templates"

interface NewTestCasePageProps {
  params: { id: string }
}

export interface WizardData {
  template: string
  description: string
  environment: string
  testData: {
    email: string
    promoCode: string
  }
  successCriteria: string[]
  questions: Array<{
    id: string
    text: string
    choices: string[]
    required: boolean
  }>
  questionAnswers: Record<string, string>
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

export default function NewTestCasePage({ params }: NewTestCasePageProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({
    template: "",
    description: "",
    environment: "",
    testData: {
      email: "",
      promoCode: ""
    },
    successCriteria: [],
    questions: [],
    questionAnswers: {}
  })

  const steps = [
    { number: 1, title: "Template", description: "Choose a template" },
    { number: 2, title: "Description", description: "Natural language description" },
    { number: 3, title: "Details", description: "Configure test details" }
  ]

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }))
  }

  const handleTemplatePrefill = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      updateWizardData({
        description: template.exampleText,
        environment: template.defaultDetails.environment,
        testData: template.defaultDetails.testData,
        successCriteria: template.defaultDetails.successCriteria,
        questions: [], // Clear any existing questions
        questionAnswers: {}
      })
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.template !== ""
      case 2:
        const hasDescription = wizardData.description.trim().length > 0
        const allQuestionsAnswered = wizardData.questions.every(q => 
          !q.required || wizardData.questionAnswers[q.id]
        )
        return hasDescription && allQuestionsAnswered
      case 3:
        return wizardData.environment !== ""
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TemplateStep 
            selectedTemplate={wizardData.template}
            onTemplateSelect={(template) => updateWizardData({ template })}
            onTemplatePrefill={handleTemplatePrefill}
          />
        )
      case 2:
        return (
          <DescriptionStep 
            description={wizardData.description}
            template={wizardData.template}
            details={{
              environment: wizardData.environment,
              testData: wizardData.testData,
              successCriteria: wizardData.successCriteria
            }}
            questions={wizardData.questions}
            questionAnswers={wizardData.questionAnswers}
            onDescriptionChange={(description) => updateWizardData({ description })}
            onQuestionsChange={(questions) => updateWizardData({ questions })}
            onQuestionAnswerChange={(id, answer) => 
              updateWizardData({ 
                questionAnswers: { ...wizardData.questionAnswers, [id]: answer }
              })
            }
            onPlanGenerated={(plan) => updateWizardData({ generatedPlan: plan })}
          />
        )
      case 3:
        return (
          <DetailsStep 
            data={{
              environment: wizardData.environment,
              testData: wizardData.testData,
              successCriteria: wizardData.successCriteria
            }}
            onDataChange={(data) => updateWizardData(data)}
            projectId={params.id}
            generatedPlan={wizardData.generatedPlan}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create Test Case</h1>
          <p className="text-muted-foreground">Follow the steps to create your test case</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between pt-6 mt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === steps.length ? (
              <Button disabled={!canProceed()}>
                Create Test Case
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}