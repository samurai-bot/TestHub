#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  config[key] = value;
}

console.log('🔄 Parsing test results and reporting to TestHub...');

// Read and parse test results
function parseTestResults(resultsFile) {
  try {
    if (!fs.existsSync(resultsFile)) {
      console.log('⚠️  No results file found, checking for HTML report...');
      
      // Try to find HTML report and extract basic info
      const htmlReportPath = path.join(process.cwd(), 'playwright-report', 'index.html');
      if (fs.existsSync(htmlReportPath)) {
        console.log('✅ Found HTML report, extracting summary...');
        return extractFromHtmlReport(htmlReportPath);
      }
      
      return null;
    }

    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    return processJsonResults(results);
  } catch (error) {
    console.error('❌ Error parsing results:', error.message);
    return null;
  }
}

function processJsonResults(results) {
  const summary = {
    runId: config['run-id'],
    project: config.project,
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    steps: []
  };

  if (results.suites) {
    results.suites.forEach(suite => {
      suite.specs.forEach(spec => {
        spec.tests.forEach(test => {
          summary.totalTests++;
          const testResult = test.results[0];
          
          if (testResult.status === 'passed') {
            summary.passed++;
          } else if (testResult.status === 'failed') {
            summary.failed++;
          } else {
            summary.skipped++;
          }
          
          summary.duration += testResult.duration || 0;
          
          // Create test step
          summary.steps.push({
            name: `${spec.title} - ${test.title}`,
            status: testResult.status === 'passed' ? 'passed' : 'failed',
            action: test.title,
            expected: 'Test should pass',
            actual: testResult.status === 'failed' ? testResult.error?.message : 'Test passed',
            error: testResult.status === 'failed' ? testResult.error?.stack : null,
            duration: testResult.duration || 0,
            screenshot: testResult.attachments?.find(a => a.name === 'screenshot')?.path
          });
        });
      });
    });
  }

  return summary;
}

function extractFromHtmlReport(htmlPath) {
  // Basic extraction from HTML report
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Simple regex to extract test counts (this is a fallback)
  const passedMatch = htmlContent.match(/(\d+)\s*passed/i);
  const failedMatch = htmlContent.match(/(\d+)\s*failed/i);
  const skippedMatch = htmlContent.match(/(\d+)\s*skipped/i);
  
  return {
    runId: config['run-id'],
    project: config.project,
    totalTests: (parseInt(passedMatch?.[1] || 0)) + (parseInt(failedMatch?.[1] || 0)) + (parseInt(skippedMatch?.[1] || 0)),
    passed: parseInt(passedMatch?.[1] || 0),
    failed: parseInt(failedMatch?.[1] || 0),
    skipped: parseInt(skippedMatch?.[1] || 0),
    duration: 0,
    steps: [
      {
        name: `${config.project} Test Suite`,
        status: failedMatch && parseInt(failedMatch[1]) > 0 ? 'failed' : 'passed',
        action: 'Run automated test suite',
        expected: 'All tests should pass',
        duration: 0
      }
    ]
  };
}

// Send results to TestHub
async function sendToTestHub(summary) {
  if (!summary) {
    console.log('❌ No summary to send');
    return;
  }

  const apiUrl = config['api-url'];
  const webhookSecret = config['webhook-secret'];
  
  if (!apiUrl) {
    console.log('⚠️  No API URL provided, skipping TestHub reporting');
    return;
  }

  const payload = {
    action: 'completed',
    workflow_run: {
      id: process.env.GITHUB_RUN_ID,
      status: 'completed',
      conclusion: summary.failed > 0 ? 'failure' : 'success',
      html_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    },
    steps: summary.steps,
    artifacts: [
      {
        name: 'test-results',
        archive_download_url: `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      }
    ],
    summary: `${summary.project}: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`
  };

  try {
    const url = new URL(apiUrl + '/api/webhooks/github');
    const payloadString = JSON.stringify(payload);
    
    // Create signature if webhook secret is provided
    let signature = '';
    if (webhookSecret) {
      signature = 'sha256=' + crypto.createHmac('sha256', webhookSecret).update(payloadString).digest('hex');
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString),
        'User-Agent': 'GitHub-Actions-TestHub-Reporter/1.0'
      }
    };

    if (signature) {
      options.headers['X-Hub-Signature-256'] = signature;
    }

    console.log(`📡 Sending results to TestHub: ${apiUrl}`);
    console.log(`📊 Summary: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Successfully reported results to TestHub');
        } else {
          console.log(`⚠️  TestHub responded with status ${res.statusCode}: ${data}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error sending to TestHub:', error.message);
    });

    req.write(payloadString);
    req.end();

  } catch (error) {
    console.error('❌ Error preparing request to TestHub:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🧪 TestHub Results Reporter');
  console.log('Configuration:', {
    'results-file': config['results-file'],
    'run-id': config['run-id'],
    'project': config.project,
    'api-url': config['api-url'] ? '[CONFIGURED]' : '[NOT SET]'
  });

  const summary = parseTestResults(config['results-file']);
  
  if (summary) {
    console.log('📋 Test Summary:');
    console.log(`   Total: ${summary.totalTests}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Skipped: ${summary.skipped}`);
    console.log(`   Duration: ${summary.duration}ms`);
    
    await sendToTestHub(summary);
  } else {
    console.log('⚠️  No test results found to report');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});