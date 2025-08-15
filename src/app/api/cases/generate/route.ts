import { NextRequest, NextResponse } from 'next/server'
import { GenerateTestRequestSchema, GenerateTestResponseSchema } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, projectId, environment, testData, successCriteria } = GenerateTestRequestSchema.parse(body)

    // Generate Playwright spec content
    const specContent = generatePlaywrightSpec(plan, environment, testData, successCriteria)
    const fileName = `${plan.title.toLowerCase().replace(/\s+/g, '-')}.spec.ts`

    // Create test case in database
    const testCase = await prisma.testCase.create({
      data: {
        name: plan.title,
        description: plan.description,
        steps: JSON.stringify(plan.steps),
        expected: successCriteria.join(', '),
        priority: plan.priority,
        template: plan.tags?.find(tag => ['signup', 'promo', 'pixel', 'content'].includes(tag)),
        projectId,
        // Store spec content in a custom field or separate table in real implementation
      }
    })

    const response = {
      testCaseId: testCase.id,
      specContent,
      fileName
    }

    return NextResponse.json(GenerateTestResponseSchema.parse(response))
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

function generatePlaywrightSpec(plan: any, environment: string, testData: any, successCriteria: string[]) {
  const baseUrl = environment === 'production' ? 'https://app.example.com' : 
                  environment === 'staging' ? 'https://staging.example.com' : 
                  'http://localhost:3000'

  return `import { test, expect } from '@playwright/test';

test.describe('${plan.title}', () => {
  test('${plan.description}', async ({ page }) => {
    // Test configuration
    const baseURL = '${baseUrl}';
    const testData = ${JSON.stringify(testData, null, 4)};
    
    ${plan.steps.map((step: any, index: number) => `
    // Step ${index + 1}: ${step.action}
    ${generateStepCode(step, index)}
    
    // Verify: ${step.expected}
    ${generateVerificationCode(step, successCriteria)}
    `).join('\n')}
  });
});`
}

function generateStepCode(step: any, index: number) {
  const action = step.action.toLowerCase()
  
  if (action.includes('navigate')) {
    return `await page.goto(baseURL + '/signup');`
  } else if (action.includes('enter') && action.includes('email')) {
    return `await page.fill('[data-testid="email"]', testData.email);`
  } else if (action.includes('enter') && action.includes('password')) {
    return `await page.fill('[data-testid="password"]', 'SecurePass123!');`
  } else if (action.includes('promo') || action.includes('code')) {
    return `await page.fill('[data-testid="promo-code"]', testData.promoCode);`
  } else if (action.includes('click') || action.includes('submit')) {
    return `await page.click('[data-testid="submit-button"]');`
  } else if (action.includes('add') && action.includes('cart')) {
    return `await page.click('[data-testid="add-to-cart"]');`
  } else {
    return `// TODO: Implement step - ${step.action}
    await page.waitForTimeout(1000);`
  }
}

function generateVerificationCode(step: any, successCriteria: string[]) {
  const expected = step.expected.toLowerCase()
  
  if (expected.includes('load') || expected.includes('display')) {
    return `await expect(page.locator('[data-testid="main-content"]')).toBeVisible();`
  } else if (expected.includes('email') && expected.includes('sent')) {
    return `await expect(page.locator('[data-testid="success-message"]')).toContainText('email');`
  } else if (expected.includes('discount') || expected.includes('promo')) {
    return `await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();`
  } else if (expected.includes('redirect')) {
    return `await expect(page).toHaveURL(/dashboard/);`
  } else {
    return `await expect(page.locator('[data-testid="success-indicator"]')).toBeVisible();`
  }
}