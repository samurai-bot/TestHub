import { z } from 'zod'

export const NLPlanRequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
  template: z.enum(["signup", "promo", "pixel"]),
  details: z.object({
    environment: z.string(),
    testData: z.object({
      email: z.string(),
      promoCode: z.string()
    }),
    successCriteria: z.array(z.string())
  })
})

export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  choices: z.array(z.string()).min(2),
  required: z.boolean().default(true)
})

export const TestPlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(z.object({
    action: z.string(),
    expected: z.string(),
    data: z.record(z.string()).optional()
  })),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string()).optional()
})

export const NLPlanResponseSchema = z.object({
  plan: TestPlanSchema.optional(),
  questions: z.array(QuestionSchema).optional()
})

export const GenerateTestRequestSchema = z.object({
  plan: TestPlanSchema,
  projectId: z.string(),
  environment: z.string(),
  testData: z.object({
    email: z.string(),
    promoCode: z.string()
  }),
  successCriteria: z.array(z.string())
})

export const GenerateTestResponseSchema = z.object({
  testCaseId: z.string(),
  specContent: z.string(),
  fileName: z.string()
})

export const RunDispatchRequestSchema = z.object({
  testCaseId: z.string(),
  environment: z.string(),
  testData: z.record(z.string()).optional()
})

export const RunDispatchResponseSchema = z.object({
  runId: z.string(),
  workflowUrl: z.string(),
  status: z.enum(["queued", "in_progress", "completed", "failed"])
})

export type NLPlanRequest = z.infer<typeof NLPlanRequestSchema>
export type NLPlanResponse = z.infer<typeof NLPlanResponseSchema>
export type Question = z.infer<typeof QuestionSchema>
export type TestPlan = z.infer<typeof TestPlanSchema>
export type GenerateTestRequest = z.infer<typeof GenerateTestRequestSchema>
export type GenerateTestResponse = z.infer<typeof GenerateTestResponseSchema>
export type RunDispatchRequest = z.infer<typeof RunDispatchRequestSchema>
export type RunDispatchResponse = z.infer<typeof RunDispatchResponseSchema>