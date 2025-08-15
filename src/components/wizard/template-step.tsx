import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { testTemplates } from "@/lib/templates"
import { Eye } from "lucide-react"

interface TemplateStepProps {
  selectedTemplate: string
  onTemplateSelect: (template: string) => void
  onTemplatePrefill: (templateId: string) => void
}

export function TemplateStep({ selectedTemplate, onTemplateSelect, onTemplatePrefill }: TemplateStepProps) {
  const handleTemplateClick = (templateId: string) => {
    onTemplateSelect(templateId)
    onTemplatePrefill(templateId)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Choose a marketing template to get started with pre-configured test scenarios
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {testTemplates.map((template) => {
          const Icon = template.icon
          const isSelected = selectedTemplate === template.id
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                isSelected ? 'border-primary shadow-md bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleTemplateClick(template.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${template.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{template.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Example Text Preview */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Example Description:
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {template.exampleText}
                  </p>
                </div>

                {/* Default Environment */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Default Environment:</span>
                  <Badge variant="outline" className="text-xs">
                    {template.defaultDetails.environment}
                  </Badge>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Includes:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {selectedTemplate && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-sm">
              <div className="font-medium text-green-800 mb-1">
                ✓ Template Selected: {testTemplates.find(t => t.id === selectedTemplate)?.title}
              </div>
              <p className="text-green-700 text-xs">
                Step 2 and Step 3 have been pre-filled with template defaults. You can customize them as needed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}