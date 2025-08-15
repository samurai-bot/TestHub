const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with Channel News Asia test cases...')

  // Create a project for Channel News Asia
  const project = await prisma.project.create({
    data: {
      name: 'Channel News Asia - Web Testing',
      description: 'Automated testing suite for channelnewsasia.com website functionality',
      userId: 'user-1' // Demo user ID
    }
  })

  console.log(`✅ Created project: ${project.name}`)

  // Test Case 1: Homepage Load and Navigation
  const testCase1 = await prisma.testCase.create({
    data: {
      name: 'Homepage Load and Main Navigation',
      description: 'Verify that the Channel News Asia homepage loads correctly and main navigation elements are functional',
      steps: JSON.stringify([
        {
          id: 1,
          action: 'Navigate to https://www.channelnewsasia.com',
          expected: 'Homepage loads successfully with all key elements visible'
        },
        {
          id: 2,
          action: 'Verify main navigation menu is present',
          expected: 'Navigation menu contains Singapore, Asia, World, Business, Sport sections'
        },
        {
          id: 3,
          action: 'Check that breaking news banner is visible',
          expected: 'Breaking news or top stories section is displayed prominently'
        },
        {
          id: 4,
          action: 'Verify footer navigation and social media links',
          expected: 'Footer contains contact information and social media icons'
        }
      ]),
      expected: 'Homepage loads within 3 seconds with all navigation elements functional',
      priority: 'high',
      status: 'active',
      template: 'navigation',
      projectId: project.id
    }
  })

  // Test Case 2: Search Functionality
  const testCase2 = await prisma.testCase.create({
    data: {
      name: 'Search Functionality Test',
      description: 'Test the search feature to ensure users can find relevant news articles',
      steps: JSON.stringify([
        {
          id: 1,
          action: 'Click on search icon/button in header',
          expected: 'Search input field becomes visible and active'
        },
        {
          id: 2,
          action: 'Enter search term "Singapore economy"',
          expected: 'Text is entered correctly in search field'
        },
        {
          id: 3,
          action: 'Press Enter or click search button',
          expected: 'Search results page loads with relevant articles'
        },
        {
          id: 4,
          action: 'Verify search results contain expected keywords',
          expected: 'Results show articles related to Singapore economy with highlighted keywords'
        }
      ]),
      expected: 'Search returns relevant results within 2 seconds',
      priority: 'high',
      status: 'active',
      template: 'search',
      projectId: project.id
    }
  })

  // Test Case 3: Article Reading Flow
  const testCase3 = await prisma.testCase.create({
    data: {
      name: 'Article Reading and Social Sharing',
      description: 'Test the complete article reading experience including social sharing features',
      steps: JSON.stringify([
        {
          id: 1,
          action: 'Click on a featured article from homepage',
          expected: 'Article page loads with full content, headline, and byline'
        },
        {
          id: 2,
          action: 'Scroll through article content',
          expected: 'Article text is readable, images load properly, and formatting is correct'
        },
        {
          id: 3,
          action: 'Locate social sharing buttons',
          expected: 'Facebook, Twitter, LinkedIn sharing options are visible'
        },
        {
          id: 4,
          action: 'Click on related articles section',
          expected: 'Related articles are displayed with thumbnails and headlines'
        },
        {
          id: 5,
          action: 'Test article commenting section if available',
          expected: 'Comment section loads or login prompt appears for commenting'
        }
      ]),
      expected: 'Article loads completely with all interactive elements working',
      priority: 'medium',
      status: 'active',
      template: 'content',
      projectId: project.id
    }
  })

  // Test Case 4: Mobile Responsiveness
  const testCase4 = await prisma.testCase.create({
    data: {
      name: 'Mobile Responsive Design Test',
      description: 'Verify that the website displays correctly on mobile devices and tablets',
      steps: JSON.stringify([
        {
          id: 1,
          action: 'Set browser viewport to mobile size (375x667)',
          expected: 'Page layout adapts to mobile screen size'
        },
        {
          id: 2,
          action: 'Test hamburger menu functionality',
          expected: 'Mobile menu icon opens/closes navigation drawer correctly'
        },
        {
          id: 3,
          action: 'Verify touch interactions work properly',
          expected: 'Tapping on articles, buttons, and links responds correctly'
        },
        {
          id: 4,
          action: 'Check that text is readable without horizontal scrolling',
          expected: 'All text content fits within mobile viewport width'
        },
        {
          id: 5,
          action: 'Test tablet view (768x1024)',
          expected: 'Layout adjusts appropriately for tablet screen size'
        }
      ]),
      expected: 'Website is fully functional and visually correct on mobile devices',
      priority: 'high',
      status: 'active',
      template: 'responsive',
      projectId: project.id
    }
  })

  // Test Case 5: Breaking News and Live Updates
  const testCase5 = await prisma.testCase.create({
    data: {
      name: 'Breaking News and Live Feed Test',
      description: 'Test breaking news notifications and live update functionality',
      steps: JSON.stringify([
        {
          id: 1,
          action: 'Check for breaking news banner on homepage',
          expected: 'Breaking news section is prominently displayed if available'
        },
        {
          id: 2,
          action: 'Navigate to "Live" or "Breaking" news section',
          expected: 'Live news feed loads with timestamps and recent updates'
        },
        {
          id: 3,
          action: 'Verify auto-refresh functionality for live updates',
          expected: 'Page updates automatically or shows refresh indicators'
        },
        {
          id: 4,
          action: 'Test notification preferences if available',
          expected: 'Users can subscribe to breaking news alerts'
        },
        {
          id: 5,
          action: 'Check live video streaming if present',
          expected: 'Live video player loads and streams without buffering issues'
        }
      ]),
      expected: 'Breaking news and live updates function properly with real-time data',
      priority: 'medium',
      status: 'active',
      template: 'live-content',
      projectId: project.id
    }
  })

  console.log(`✅ Created ${[testCase1, testCase2, testCase3, testCase4, testCase5].length} test cases`)

  // Create some sample test runs
  const testRun1 = await prisma.testRun.create({
    data: {
      name: 'Daily Smoke Test - Homepage',
      status: 'completed',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      environment: 'production',
      projectId: project.id,
      summary: 'All critical homepage functionality verified successfully'
    }
  })

  const testRun2 = await prisma.testRun.create({
    data: {
      name: 'Mobile Responsiveness Check',
      status: 'failed',
      startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      completedAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      environment: 'staging',
      projectId: project.id,
      summary: 'Mobile menu navigation issue detected on tablet view'
    }
  })

  const testRun3 = await prisma.testRun.create({
    data: {
      name: 'Search and Article Flow Test',
      status: 'in_progress',
      startedAt: new Date(),
      environment: 'production',
      projectId: project.id
    }
  })

  console.log(`✅ Created 3 sample test runs`)

  // Create some test steps for the completed run
  await prisma.testStep.create({
    data: {
      name: 'Homepage Load Verification',
      status: 'passed',
      action: 'Navigate to channelnewsasia.com and verify page load',
      expected: 'Page loads within 3 seconds',
      duration: 2100,
      testRunId: testRun1.id
    }
  })

  await prisma.testStep.create({
    data: {
      name: 'Navigation Menu Check',
      status: 'passed',
      action: 'Verify all main navigation links are present',
      expected: 'Singapore, Asia, World, Business, Sport sections visible',
      duration: 800,
      testRunId: testRun1.id
    }
  })

  await prisma.testStep.create({
    data: {
      name: 'Mobile Menu Test',
      status: 'failed',
      action: 'Test hamburger menu on tablet view',
      expected: 'Menu opens and closes properly',
      actual: 'Menu drawer does not close on tablet orientation change',
      error: 'Menu state persists incorrectly when switching orientations',
      duration: 3200,
      testRunId: testRun2.id
    }
  })

  console.log(`✅ Created sample test steps`)

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`   • Project: ${project.name}`)
  console.log(`   • Test Cases: 5 (Homepage, Search, Article Flow, Mobile, Breaking News)`)
  console.log(`   • Test Runs: 3 (1 passed, 1 failed, 1 in progress)`)
  console.log(`   • Test Steps: Example results for demonstration`)
  console.log('\n🚀 Your TestHub is now ready with real test data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })