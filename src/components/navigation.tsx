"use client"

import Link from "next/link"
import { TestTube2, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <TestTube2 className="h-6 w-6" />
              <span className="font-bold text-xl">TestHub</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link 
                href="/projects" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Projects
              </Link>
              <Link 
                href="/runs" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Test Runs
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}