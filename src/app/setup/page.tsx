"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Key, Shield, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const [masterPassword, setMasterPassword] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const { toast } = useToast()

  const generateWebhookSecret = () => {
    console.log('Generate webhook secret button clicked')
    alert('Button clicked - generating webhook secret')
    setWebhookLoading(true)
    
    try {
      // Generate a random 32-byte hex string
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        console.log('Using crypto.getRandomValues')
        const array = new Uint8Array(32)
        window.crypto.getRandomValues(array)
        const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
        console.log('Generated secret length:', secret.length)
        setWebhookSecret(secret)
        
        toast({
          title: "Webhook Secret Generated",
          description: "A secure webhook secret has been generated for you."
        })
      } else {
        console.log('Using fallback method')
        // Fallback for environments without crypto API
        const chars = 'abcdef0123456789'
        let secret = ''
        for (let i = 0; i < 64; i++) {
          secret += chars[Math.floor(Math.random() * chars.length)]
        }
        console.log('Generated fallback secret length:', secret.length)
        setWebhookSecret(secret)
        
        toast({
          title: "Webhook Secret Generated",
          description: "A secure webhook secret has been generated for you (using fallback method)."
        })
      }
    } catch (error) {
      console.error('Error generating webhook secret:', error)
      toast({
        title: "Error",
        description: "Failed to generate webhook secret. Please try again.",
        variant: "destructive"
      })
    } finally {
      setWebhookLoading(false)
    }
  }

  const generateApiToken = async () => {
    if (!masterPassword) {
      toast({
        title: "Master Password Required",
        description: "Please enter the master password to generate an API token.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ masterPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setApiToken(data.token)
        toast({
          title: "API Token Generated",
          description: "Your API token has been generated successfully."
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate API token",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate API token",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TestHub Setup</h1>
        <p className="text-muted-foreground">
          Generate the required tokens and secrets for deploying TestHub to production
        </p>
      </div>

      <div className="grid gap-6">
        {/* Webhook Secret Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Webhook Secret
            </CardTitle>
            <CardDescription>
              Generate a secure secret for GitHub webhook communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    console.log('TEST BUTTON CLICKED')
                    setTestMessage('Test button works! ' + new Date().toLocaleTimeString())
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Test Button
                </Button>
                {testMessage && <span className="text-sm text-green-600">{testMessage}</span>}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={generateWebhookSecret} 
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={webhookLoading}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {webhookLoading ? "Generating..." : "Generate Webhook Secret"}
                </Button>
                {webhookSecret && (
                  <Badge variant="secondary" className="ml-2">
                    Generated
                  </Badge>
                )}
                {webhookLoading && (
                  <Badge variant="outline" className="ml-2">
                    Working...
                  </Badge>
                )}
              </div>
            </div>
            
            {webhookSecret && (
              <div className="space-y-2">
                <Label>Generated Webhook Secret:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={webhookSecret} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(webhookSecret, 'Webhook Secret')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Use this value for both <code>WEBHOOK_SECRET</code> in Vercel and GitHub secrets
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Token Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Token
            </CardTitle>
            <CardDescription>
              Generate an API token for GitHub Actions to communicate with TestHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Master Password</Label>
              <Input 
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter master password (default: testhub-admin-2024)"
              />
              <div className="text-sm text-muted-foreground">
                Default password: <code>testhub-admin-2024</code>
              </div>
            </div>
            
            <Button 
              onClick={generateApiToken} 
              disabled={loading || !masterPassword}
            >
              {loading ? "Generating..." : "Generate API Token"}
            </Button>
            
            {apiToken && (
              <div className="space-y-2">
                <Label>Generated API Token:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={apiToken} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(apiToken, 'API Token')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Use this value for <code>TESTHUB_API_TOKEN</code> in both Vercel and GitHub secrets
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deployment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Deployment Instructions
            </CardTitle>
            <CardDescription>
              How to use these tokens in your deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">Vercel Environment Variables</Badge>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <div>DATABASE_URL=postgresql://your-db-url</div>
                  <div>WEBHOOK_SECRET={webhookSecret || 'your-webhook-secret'}</div>
                  <div>TESTHUB_API_TOKEN={apiToken || 'your-api-token'}</div>
                  <div>MASTER_PASSWORD=testhub-admin-2024</div>
                </div>
              </div>

              <div>
                <Badge variant="outline" className="mb-2">GitHub Repository Secrets</Badge>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <div>TESTHUB_API_URL=https://your-testhub.vercel.app</div>
                  <div>WEBHOOK_SECRET={webhookSecret || 'your-webhook-secret'}</div>
                  <div>TESTHUB_API_TOKEN={apiToken || 'your-api-token'}</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Copy the generated tokens above</li>
                <li>Add them to your Vercel environment variables</li>
                <li>Add them to your GitHub repository secrets</li>
                <li>Deploy to Vercel</li>
                <li>Test the GitHub Actions workflow</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}