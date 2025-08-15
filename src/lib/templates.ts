import { UserPlus, Gift, BarChart3, Eye } from "lucide-react"

export interface TestTemplate {
  id: string
  title: string
  description: string
  icon: any
  color: string
  exampleText: string
  defaultDetails: {
    environment: string
    testData: {
      email: string
      promoCode: string
    }
    successCriteria: string[]
  }
  features: string[]
}

export const testTemplates: TestTemplate[] = [
  {
    id: "signup",
    title: "User Signup",
    description: "Test user registration flow with email verification",
    icon: UserPlus,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    exampleText: "I want to test that a new user can successfully create an account by providing their email address, choosing a secure password that meets our requirements, and completing the email verification process. The user should receive a welcome email within 2 minutes and be automatically redirected to the onboarding flow upon verification.",
    defaultDetails: {
      environment: "staging",
      testData: {
        email: "test.user+signup@example.com",
        promoCode: ""
      },
      successCriteria: [
        "ui_loads",
        "data_validates", 
        "database_updated",
        "email_sent",
        "redirect_occurs"
      ]
    },
    features: ["Email validation", "Password requirements", "Confirmation flow", "Welcome email"]
  },
  {
    id: "promo",
    title: "Promo Code",
    description: "Validate promotional code application and discounts",
    icon: Gift,
    color: "bg-green-50 border-green-200 text-green-700",
    exampleText: "I need to verify that when a user enters the promo code 'SAVE20' at checkout, they receive exactly 20% off their order total. The system should validate the code is active, apply the discount correctly to the subtotal, update the final price display, and prevent the same code from being used multiple times by the same user.",
    defaultDetails: {
      environment: "staging",
      testData: {
        email: "test.user+promo@example.com",
        promoCode: "SAVE20"
      },
      successCriteria: [
        "ui_loads",
        "data_validates",
        "success_message",
        "database_updated"
      ]
    },
    features: ["Code validation", "Discount calculation", "Usage limits", "Error handling"]
  },
  {
    id: "pixel",
    title: "Pixel/UTM Tracking",
    description: "Verify tracking pixels and UTM parameter capture",
    icon: BarChart3,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    exampleText: "I want to ensure that when a user completes a purchase after arriving via a Facebook ad with UTM parameters, the Facebook pixel fires correctly with the purchase event data including order value and product details. The UTM parameters should be captured and stored in our database, and the conversion should appear in both Facebook Analytics and our internal dashboard within 5 minutes.",
    defaultDetails: {
      environment: "production",
      testData: {
        email: "test.user+tracking@example.com",
        promoCode: ""
      },
      successCriteria: [
        "ui_loads",
        "analytics_tracked",
        "database_updated"
      ]
    },
    features: ["Pixel firing", "UTM parameters", "Analytics data", "Cross-platform tracking"]
  },
  {
    id: "content",
    title: "Content Visibility",
    description: "Test content display and accessibility rules",
    icon: Eye,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    exampleText: "I want to test that premium content is properly hidden from free users and only becomes visible after they upgrade to a paid subscription. When a free user tries to access premium content, they should see a paywall with upgrade options. After successful payment, the same content should immediately become accessible without requiring a page refresh.",
    defaultDetails: {
      environment: "staging",
      testData: {
        email: "test.user+content@example.com",
        promoCode: "PREMIUM30"
      },
      successCriteria: [
        "ui_loads",
        "data_validates",
        "success_message",
        "redirect_occurs"
      ]
    },
    features: ["Access control", "Paywall display", "Subscription validation", "Dynamic content"]
  }
]

export function getTemplateById(id: string): TestTemplate | undefined {
  return testTemplates.find(template => template.id === id)
}

export function getTemplateDefaults(templateId: string) {
  const template = getTemplateById(templateId)
  return template?.defaultDetails || {
    environment: "staging",
    testData: {
      email: "",
      promoCode: ""
    },
    successCriteria: []
  }
}