import { NextRequest, NextResponse } from 'next/server'
import { generateApiToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Simple security check - require a master password
    const body = await request.json()
    const { masterPassword } = body
    
    // Use a simple master password (in production, use proper authentication)
    const expectedPassword = process.env.MASTER_PASSWORD || 'testhub-admin-2024'
    
    if (masterPassword !== expectedPassword) {
      return NextResponse.json(
        { error: 'Invalid master password' },
        { status: 401 }
      )
    }
    
    // Generate new API token
    const token = generateApiToken()
    
    return NextResponse.json({
      token,
      message: 'API token generated successfully',
      usage: {
        environment_variable: `TESTHUB_API_TOKEN=${token}`,
        authorization_header: `Authorization: Bearer ${token}`
      }
    })
    
  } catch (error) {
    console.error('Error generating API token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}