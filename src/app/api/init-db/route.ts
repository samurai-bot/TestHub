import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Import Prisma dynamically to avoid build-time database connection
    const { prisma } = await import('@/lib/prisma')
    
    // Test database connection and ensure tables exist
    console.log('Testing database connection...')
    
    // Try to query a simple table - this will create it if it doesn't exist
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection successful')
      
      // Try to get projects count to test if tables exist
      const count = await prisma.project.count()
      console.log(`Found ${count} projects in database`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully',
        projectCount: count 
      })
    } catch (tableError: any) {
      console.log('Tables might not exist, this is expected on first run')
      
      return NextResponse.json({ 
        success: false, 
        message: 'Database connected but tables need to be created. Run `prisma db push` locally first.',
        error: tableError.message
      })
    }
    
  } catch (error: any) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Database initialization failed'
    }, { status: 500 })
  }
}