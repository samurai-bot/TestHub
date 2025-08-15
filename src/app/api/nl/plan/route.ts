import { NextRequest, NextResponse } from 'next/server'
import { NLPlanRequestSchema, NLPlanResponseSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, template, details } = NLPlanRequestSchema.parse(body)

    // Mock NL processing logic - replace with actual LLM integration
    const response = generateMockResponse(text, template, details)

    return NextResponse.json(NLPlanResponseSchema.parse(response))
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

function generateMockResponse(text: string, template: string, details: any) {
  const wordCount = text.trim().split(/\s+/).length

  // If description is too short, ask clarifying questions
  if (wordCount < 15) {
    return {
      questions: [
        {
          id: 'user_type',
          text: 'What type of user will be performing this test?',
          choices: ['New user', 'Existing user', 'Admin user'],
          required: true
        },
        {
          id: 'device_type',
          text: 'What device should this test cover?',
          choices: ['Desktop only', 'Mobile only', 'Both desktop and mobile'],
          required: true
        }
      ]
    }
  }

  // Check for missing context based on template
  const questions = []
  
  if (template === 'signup' && !text.toLowerCase().includes('email')) {
    questions.push({
      id: 'email_verification',
      text: 'Should email verification be tested?',
      choices: ['Yes, test email verification', 'No, skip email verification'],
      required: true
    })
  }

  if (template === 'promo' && !details.testData.promoCode) {
    questions.push({
      id: 'promo_type',
      text: 'What type of promo code should be tested?',
      choices: ['Percentage discount', 'Fixed amount discount', 'Free shipping'],
      required: true
    })
  }

  if (template === 'pixel' && !text.toLowerCase().includes('event')) {
    questions.push({
      id: 'tracking_events',
      text: 'Which tracking events should be verified?',
      choices: ['Page view', 'Purchase', 'Add to cart', 'Sign up'],
      required: false
    })
  }

  if (questions.length > 0) {
    return { questions }
  }

  // Generate test plan
  const plan = generateTestPlan(text, template, details)
  return { plan }
}

function generateTestPlan(text: string, template: string, details: any) {
  const baseSteps = {
    signup: [
      { action: 'Navigate to signup page', expected: 'Signup form loads correctly' },
      { action: 'Enter valid email address', expected: 'Email field accepts valid format', data: { email: details.testData.email || 'test@example.com' } },
      { action: 'Enter secure password', expected: 'Password meets requirements' },
      { action: 'Submit signup form', expected: 'Account created successfully' },
      { action: 'Check email verification', expected: 'Verification email received' }
    ],
    promo: [
      { action: 'Add items to cart', expected: 'Items appear in shopping cart' },
      { action: 'Navigate to checkout', expected: 'Checkout page loads' },
      { action: 'Enter promo code', expected: 'Promo code field accepts input', data: { promoCode: details.testData.promoCode || 'SAVE20' } },
      { action: 'Apply promo code', expected: 'Discount applied to total' },
      { action: 'Complete purchase', expected: 'Order placed with discount' }
    ],
    pixel: [
      { action: 'Load target page', expected: 'Page loads with tracking code' },
      { action: 'Perform tracked action', expected: 'Action triggers pixel' },
      { action: 'Verify pixel data', expected: 'Correct data sent to analytics' },
      { action: 'Check UTM parameters', expected: 'UTM params captured correctly' }
    ]
  }

  return {
    title: `${template.charAt(0).toUpperCase() + template.slice(1)} Test Case`,
    description: text,
    steps: baseSteps[template as keyof typeof baseSteps] || [],
    priority: 'medium' as const,
    tags: [template, details.environment]
  }
}