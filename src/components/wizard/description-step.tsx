"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Type, Zap, HelpCircle } from "lucide-react"

interface DescriptionStepProps {
  description: string
  template: string
  details: {
    environment: string
    testData: {
      email: string
      promoCode: string
    }
    successCriteria: string[]
  }
  questions: Array<{
    id: string
    text: string
    choices: string[]
    required: boolean
  }>
  questionAnswers: Record<string, string>
  onDescriptionChange: (description: string) => void
  onQuestionsChange: (questions: any[]) => void
  onQuestionAnswerChange: (id: string, answer: string) => void
  onPlanGenerated: (plan: any) => void
}

const examples = [
  {
    title: "User Signup",
    text: "I want to test that a new user can successfully create an account by providing their email, choosing a secure password, and completing email verification. The user should receive a welcome email and be redirected to the onboarding flow."
  },
  {
    title: "Promo Code",
    text: "I need to verify that when a user enters the promo code 'SAVE20' at checkout, they receive a 20% discount on their order total, the code usage is tracked, and they cannot use the same code multiple times."
  },
  {
    title: "Pixel Tracking",
    text: "I want to ensure that when a user completes a purchase, the Facebook pixel fires correctly with the purchase event data, UTM parameters are captured and stored, and the conversion is tracked in our analytics dashboard."
  }
]

export function DescriptionStep({ 
  description, 
  template, 
  details, 
  questions, 
  questionAnswers, 
  onDescriptionChange, 
  onQuestionsChange, 
  onQuestionAnswerChange, 
  onPlanGenerated 
}: DescriptionStepProps) {
  const [tokenCount, setTokenCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  
  useEffect(() => {
    // Simple token counting (approximate)
    const tokens = description.trim().split(/\s+/).filter(word => word.length > 0)
    setTokenCount(tokens.length)
  }, [description])

  const generatePlan = async () => {
    if (!description.trim() || !template) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/nl/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: description,
          template,
          details
        })
      })

      const result = await response.json()
      
      if (result.questions && result.questions.length > 0) {
        onQuestionsChange(result.questions)
      } else if (result.plan) {
        onPlanGenerated(result.plan)
        onQuestionsChange([]) // Clear questions if plan generated
      }
    } catch (error) {
      console.error('Failed to generate plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getTokenColor = () => {
    if (tokenCount < 20) return "text-red-600"
    if (tokenCount < 50) return "text-yellow-600"
    return "text-green-600"
  }

  const getTokenStatus = () => {
    if (tokenCount < 20) return "Too short - add more details"
    if (tokenCount < 50) return "Good length"
    if (tokenCount < 100) return "Great detail"
    return "Very detailed"
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="text-sm font-medium mb-2 block">
            Describe your test scenario in natural language
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe what you want to test in plain English. Be specific about the steps, expected outcomes, and any special conditions..."
            className="min-h-[120px] resize-none"
            rows={6}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className={`font-medium ${getTokenColor()}`}>
              {tokenCount} words
            </span>
            <span className="text-muted-foreground">•</span>
            <span className={getTokenColor()}>
              {getTokenStatus()}
            </span>
          </div>
          
          <Button 
            onClick={generatePlan}
            disabled={isGenerating || !description.trim() || !template}
            size="sm"
            className="ml-4"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            Example Descriptions
          </CardTitle>
          <CardDescription>
            Click on any example to use it as a starting point
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {examples.map((example, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onDescriptionChange(example.text)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {example.title}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {example.text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Questions */}
      {questions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="h-4 w-4" />
              Clarify Your Test
            </CardTitle>
            <CardDescription>
              Answer these questions to generate a detailed test plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <div className="text-sm font-medium">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {question.choices.map((choice) => (
                    <Badge
                      key={choice}
                      variant={questionAnswers[question.id] === choice ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => onQuestionAnswerChange(question.id, choice)}
                    >
                      {choice}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            
            <Button 
              onClick={generatePlan}
              disabled={isGenerating || questions.some(q => q.required && !questionAnswers[q.id])}
              className="w-full mt-4"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Test Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {description.trim().length > 0 && questions.length === 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-sm">
              <div className="font-medium text-green-800 mb-1">Preview</div>
              <p className="text-green-700">
                {description.length > 200 
                  ? `${description.substring(0, 200)}...` 
                  : description
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}