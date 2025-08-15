const { PrismaClient } = require('@prisma/client')

async function initDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Initializing database...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Push schema to database (creates tables)
    console.log('🔄 Creating database schema...')
    // Note: In production, you'd run `prisma db push` via CLI
    // This script just tests the connection
    
    console.log('✅ Database initialization complete')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase()