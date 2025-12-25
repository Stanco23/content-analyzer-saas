/**
 * API Test Script for Content Analyzer SaaS
 * Tests all API endpoints for functionality and correctness
 *
 * Usage:
 *   npm run test:api                    # Run all tests (requires env vars)
 *   npm run test:api -- --list          # List all test suites
 *   npm run test:api -- --help          # Show help
 *
 * Required environment variables:
 *   CLERK_USER_ID       - A valid Clerk user ID (required for most tests)
 *   CLERK_SECRET_KEY    - Clerk secret key for generating test tokens
 *   API_BASE_URL        - Base URL for API (default: http://localhost:3000)
 *
 * Note: Endpoints require Clerk authentication. Without valid credentials,
 * only unauthenticated endpoints (like webhooks) can be tested.
 */

import { SignJWT } from 'jose';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const CLERK_USER_ID = process.env.CLERK_USER_ID || '';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' | 'test' = 'info') {
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[PASS]${colors.reset}`,
    error: `${colors.red}[FAIL]${colors.reset}`,
    warn: `${colors.yellow}[WARN]${colors.reset}`,
    test: `${colors.cyan}[TEST]${colors.reset}`,
  };
  console.log(`${prefix[type]} ${message}`);
}

function logSection(title: string) {
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function logUsage() {
  console.log(`
${colors.bold}Usage:${colors.reset}
  npm run test:api [options]

${colors.bold}Options:${colors.reset}
  --all           Run all tests (default)
  --analyze       Run only analyze tests
  --enhance       Run only enhance tests
  --list          Run only analyses list tests
  --sync          Run only subscription sync tests
  --trial         Run only trial tests
  --profile       Run only user profile tests
  --checkout      Run only checkout tests
  --portal        Run only customer portal tests
  --webhook       Run only webhook tests
  --help, -h      Show this help message

${colors.bold}Environment Variables:${colors.reset}
  CLERK_USER_ID       Clerk user ID (required for authenticated tests)
  CLERK_SECRET_KEY    Clerk secret key (for token generation)
  API_BASE_URL        API base URL (default: http://localhost:3000)

${colors.bold}Example:${colors.reset}
  CLERK_USER_ID=user_xxx CLERK_SECRET_KEY=sk_test_xxx npm run test:api -- --analyze
`);
}

async function createMockToken(userId: string): Promise<string> {
  if (!CLERK_SECRET_KEY) {
    // Return a mock token for testing
    return `test_token_${userId}`;
  }
  try {
    const secret = new TextEncoder().encode(CLERK_SECRET_KEY);
    return await new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);
  } catch {
    return `test_token_${userId}`;
  }
}

async function request(
  method: string,
  endpoint: string,
  options: {
    body?: object;
    headers?: Record<string, string>;
    expectedStatus?: number;
  } = {}
) {
  const { body, headers = {}, expectedStatus } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth header if we have a user ID
  if (CLERK_USER_ID) {
    const token = await createMockToken(CLERK_USER_ID);
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { raw: await response.text() };
    }

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: String(error) },
      ok: false,
    };
  }
}

// ============================================================
// TEST SUITES
// ============================================================

async function testAnalyzeEndpoint() {
  logSection('Content Analysis API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  // Test 1: Valid content analysis
  log('Submitting valid content for analysis...', 'test');
  const validContent = `
    Search engine optimization (SEO) is the practice of increasing the quantity and quality of traffic to your website through organic search engine results. A higher ranking when someone searches terms related to your business can significantly increase your business's profitability. SEO involves making strategic changes to your website's content and structure to make it more attractive to search engines like Google, Bing, and Yahoo. The goal is to appear on the first page of search results for relevant keywords and phrases that potential customers are searching for.
  `.trim();

  const analyzeResult = await request('POST', '/api/internal/analyze', {
    body: {
      content: validContent,
      title: 'Understanding SEO Fundamentals',
    },
    expectedStatus: 200,
  });

  if (analyzeResult.ok && analyzeResult.data.success) {
    log(`Analysis successful - Score: ${analyzeResult.data.data?.overallScore || 'N/A'}`, 'success');
    log(`Readability: ${analyzeResult.data.data?.readabilityScore || 'N/A'}`, 'info');
    log(`SEO: ${analyzeResult.data.data?.seoScore || 'N/A'}`, 'info');
    log(`Grammar: ${analyzeResult.data.data?.grammarScore || 'N/A'}`, 'info');
  } else if (analyzeResult.status === 401 || analyzeResult.status === 404) {
    log(`Authentication required (status: ${analyzeResult.status})`, 'warn');
  } else {
    log(`Analysis failed: ${JSON.stringify(analyzeResult.data)}`, 'error');
  }

  // Test 2: Content too short
  log('Testing validation - content too short...', 'test');
  const shortContent = await request('POST', '/api/internal/analyze', {
    body: {
      content: 'This is too short.',
      title: 'Short Content',
    },
    expectedStatus: 400,
  });

  if (shortContent.status === 400 && !shortContent.data.success) {
    log('Correctly rejected short content', 'success');
  } else if (shortContent.status === 401) {
    log('Authentication required', 'warn');
  } else {
    log('Unexpected response', 'warn');
  }

  return analyzeResult;
}

async function testEnhanceEndpoint() {
  logSection('Content Enhancement API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  // Test content
  const testContent = `
    Digital marketing helps businesses reach customers online. It includes social media, email marketing, search engine optimization, and paid advertising. Companies use these tools to build brand awareness and drive sales. The key to successful digital marketing is understanding your audience and creating content that resonates with them.
  `.trim();

  // Test 1: Enhance content with improve goal
  log('Enhancing content (improve goal)...', 'test');
  const enhanceResult = await request('POST', '/api/internal/enhance', {
    body: {
      content: testContent,
      title: 'Digital Marketing Basics',
      options: {
        goal: 'improve',
        tone: 'professional',
        reAnalyze: true,
      },
    },
    expectedStatus: 200,
  });

  if (enhanceResult.ok && enhanceResult.data.success) {
    log('Enhancement successful', 'success');
    log(`Original length: ${enhanceResult.data.data?.original_length}`, 'info');
    log(`Enhanced length: ${enhanceResult.data.data?.enhanced_length}`, 'info');
    log(`Improvement: ${enhanceResult.data.data?.improvement_percentage}%`, 'info');
    log(`Tokens used: ${enhanceResult.data.data?.tokens_used}`, 'info');
    if (enhanceResult.data.data?.analysis) {
      log('Re-analysis scores available', 'success');
    }
  } else if (enhanceResult.status === 401 || enhanceResult.status === 404) {
    log('Authentication required', 'warn');
  } else {
    log(`Enhancement failed: ${JSON.stringify(enhanceResult.data)}`, 'error');
  }

  // Test 2: Enhance with simplify goal
  log('Enhancing content (simplify goal)...', 'test');
  const simplifyResult = await request('POST', '/api/internal/enhance', {
    body: {
      content: testContent,
      title: 'Digital Marketing Basics',
      options: {
        goal: 'simplify',
        tone: 'casual',
        reAnalyze: false,
      },
    },
    expectedStatus: 200,
  });

  if (simplifyResult.ok) {
    log('Simplify enhancement successful', 'success');
  }

  // Test 3: Enhance with SEO goal
  log('Enhancing content (seo goal)...', 'test');
  const seoResult = await request('POST', '/api/internal/enhance', {
    body: {
      content: testContent,
      title: 'Digital Marketing Basics',
      options: {
        goal: 'seo',
        tone: 'professional',
        reAnalyze: true,
      },
    },
    expectedStatus: 200,
  });

  if (seoResult.ok) {
    log('SEO enhancement successful', 'success');
  }

  return enhanceResult;
}

async function testAnalysesList() {
  logSection('Analyses List API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  // Test 1: List all analyses
  log('Fetching list of analyses...', 'test');
  const listResult = await request('GET', '/api/internal/analyses/list?limit=10');

  if (listResult.ok && listResult.data.success) {
    const count = listResult.data.data?.length || 0;
    log(`Retrieved ${count} analyses`, 'success');
  } else if (listResult.status === 401 || listResult.status === 404) {
    log('Authentication required', 'warn');
  } else {
    log(`Failed to list analyses: ${JSON.stringify(listResult.data)}`, 'error');
  }

  // Test 2: List with limit
  log('Testing limit parameter...', 'test');
  const limitedResult = await request('GET', '/api/internal/analyses/list?limit=2');

  if (limitedResult.data?.data?.length <= 2) {
    log('Limit parameter works correctly', 'success');
  }

  // Test 3: Group by version
  log('Testing version grouping...', 'test');
  const groupedResult = await request('GET', '/api/internal/analyses/list?group=true');

  if (groupedResult.ok && groupedResult.data.grouped === true) {
    log('Version grouping enabled', 'success');
    const groupCount = groupedResult.data.data?.length || 0;
    log(`Found ${groupCount} version groups`, 'info');
  }

  return listResult;
}

async function testSubscriptionSync() {
  logSection('Subscription Sync API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  log('Syncing subscription from Polar...', 'test');
  const syncResult = await request('POST', '/api/polar/sync');

  if (syncResult.ok) {
    log('Sync endpoint accessible', 'success');
    log(`Current tier: ${syncResult.data.tier || 'N/A'}`, 'info');
    log(`Status: ${syncResult.data.status || 'N/A'}`, 'info');
  } else if (syncResult.data?.error?.code === 'NO_CUSTOMER') {
    log('No Polar customer found (expected for new users)', 'warn');
  } else if (syncResult.status === 401 || syncResult.status === 404) {
    log('Authentication required', 'warn');
  } else {
    log(`Sync failed: ${JSON.stringify(syncResult.data)}`, 'warn');
  }

  return syncResult;
}

async function testTrialEndpoint() {
  logSection('Free Trial API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  // Test 1: Check trial status
  log('Checking trial status...', 'test');
  const statusResult = await request('GET', '/api/polar/trial');

  if (statusResult.ok) {
    log('Trial status endpoint works', 'success');
    log(`Eligible for trial: ${statusResult.data.data?.isEligibleForTrial}`, 'info');
    log(`In trial: ${statusResult.data.data?.isInTrial}`, 'info');
  } else if (statusResult.status === 401 || statusResult.status === 404) {
    log('Authentication required', 'warn');
  }

  // Test 2: Start trial (only if eligible)
  if (statusResult.data?.data?.isEligibleForTrial) {
    log('Starting free trial...', 'test');
    const startResult = await request('POST', '/api/polar/trial');

    if (startResult.ok && startResult.data.success) {
      log('Trial started successfully', 'success');
      log(`Trial ends: ${startResult.data.data?.trialEndDate}`, 'info');
    } else {
      log(`Trial start failed: ${JSON.stringify(startResult.data)}`, 'error');
    }
  } else if (statusResult.ok) {
    log('User not eligible for trial (already has subscription)', 'warn');
  }

  return statusResult;
}

async function testUserProfile() {
  logSection('User Profile API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  log('Fetching user profile...', 'test');
  const profileResult = await request('GET', '/api/internal/user/profile');

  if (profileResult.ok && profileResult.data.success) {
    const user = profileResult.data.data;
    log('Profile fetched successfully', 'success');
    log(`Tier: ${user.subscriptionTier}`, 'info');
    log(`Status: ${user.subscriptionStatus}`, 'info');
    log(`Analyses used: ${user.monthlyAnalysesUsed}/${user.subscriptionLimit}`, 'info');
  } else if (profileResult.status === 401 || profileResult.status === 404) {
    log('Authentication required', 'warn');
  } else {
    log(`Profile fetch failed: ${JSON.stringify(profileResult.data)}`, 'error');
  }

  return profileResult;
}

async function testCheckout() {
  logSection('Checkout API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  const checkoutPlans = [
    { plan: 'pro_monthly', name: 'Pro Monthly' },
    { plan: 'pro_annual', name: 'Pro Annual' },
    { plan: 'business_monthly', name: 'Business Monthly' },
    { plan: 'business_annual', name: 'Business Annual' },
    { plan: 'api_starter', name: 'API Starter' },
    { plan: 'api_growth', name: 'API Growth' },
    { plan: 'api_enterprise', name: 'API Enterprise' },
  ];

  for (const { plan, name } of checkoutPlans) {
    log(`Creating checkout for ${name}...`, 'test');
    const checkoutResult = await request('POST', '/api/polar/checkout', {
      body: { plan },
      expectedStatus: 200,
    });

    if (checkoutResult.ok && checkoutResult.data.url) {
      log(`${name} checkout URL generated`, 'success');
    } else if (checkoutResult.data?.error?.code === 'ALREADY_SUBSCRIBED') {
      log(`${name}: Already subscribed`, 'warn');
    } else if (checkoutResult.status === 401 || checkoutResult.status === 404) {
      log('Authentication required', 'warn');
      break;
    } else {
      log(`${name}: Checkout unavailable - ${checkoutResult.data?.error?.message || 'Unknown'}`, 'warn');
    }
  }
}

async function testCustomerPortal() {
  logSection('Customer Portal API Tests');

  if (!CLERK_USER_ID) {
    log('SKIP: CLERK_USER_ID not set - authentication required', 'warn');
    return { skipped: true };
  }

  log('Requesting customer portal URL...', 'test');
  const portalResult = await request('POST', '/api/polar/portal');

  if (portalResult.ok && portalResult.data.url) {
    log('Customer portal URL generated', 'success');
  } else if (portalResult.data?.error?.code === 'NO_SUBSCRIPTION') {
    log('No active subscription to manage', 'warn');
  } else if (portalResult.data?.error?.code === 'NO_CUSTOMER') {
    log('No Polar customer found', 'warn');
  } else if (portalResult.status === 401 || portalResult.status === 404) {
    log('Authentication required', 'warn');
  } else {
    log(`Portal unavailable: ${JSON.stringify(portalResult.data)}`, 'warn');
  }

  return portalResult;
}

async function testWebhookEndpoint() {
  logSection('Webhook Endpoint Tests');

  // Webhooks require valid Svix signatures
  log('Testing webhook endpoint structure...', 'test');
  const webhookResult = await fetch(`${API_BASE_URL}/api/webhooks/polar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'test.event' }),
  });

  // 400 = signature validation failed (expected for invalid signature)
  // 401 = missing signature
  if (webhookResult.status === 400 || webhookResult.status === 401) {
    log('Webhook endpoint exists (rejected invalid signature)', 'success');
  } else if (webhookResult.status === 404) {
    log('Webhook endpoint not found - check route path', 'error');
  } else {
    log(`Webhook returned status: ${webhookResult.status}`, 'warn');
  }

  return { status: webhookResult.status };
}

async function testHealthEndpoint() {
  logSection('Health Check Tests');

  log('Checking health endpoint...', 'test');
  const healthResult = await request('GET', '/api/v1/health');

  if (healthResult.ok) {
    log('Health endpoint accessible', 'success');
  } else {
    log(`Health check status: ${healthResult.status}`, 'warn');
  }

  return healthResult;
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================

async function runAllTests() {
  console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║       Content Analyzer SaaS - API Test Suite                ║${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`${colors.blue}Base URL: ${API_BASE_URL}${colors.reset}`);
  console.log(`${colors.blue}User ID: ${CLERK_USER_ID ? CLERK_USER_ID.substring(0, 10) + '...' : 'Not set (auth required)'}${colors.reset}\n`);

  if (!CLERK_USER_ID || !CLERK_SECRET_KEY) {
    console.log(`${colors.yellow}⚠️  WARNING: CLERK_USER_ID or CLERK_SECRET_KEY not set${colors.reset}`);
    console.log(`${colors.yellow}   Most tests will be skipped due to authentication requirements.${colors.reset}`);
    console.log(`${colors.yellow}   Set these environment variables to run full tests.${colors.reset}\n`);
  }

  const results = {
    health: await testHealthEndpoint(),
    analyze: await testAnalyzeEndpoint(),
    enhance: await testEnhanceEndpoint(),
    list: await testAnalysesList(),
    sync: await testSubscriptionSync(),
    trial: await testTrialEndpoint(),
    profile: await testUserProfile(),
    checkout: await testCheckout(),
    portal: await testCustomerPortal(),
    webhook: await testWebhookEndpoint(),
  };

  // Summary
  logSection('Test Summary');
  console.log(`${colors.bold}Endpoint Test Results:${colors.reset}`);

  interface TestResult { name: string; success?: boolean; skipped: boolean }
  const testResults: TestResult[] = [
    { name: 'Health', success: (results.health as any)?.ok, skipped: false },
    { name: 'Analyze', success: (results.analyze as any)?.ok, skipped: (results.analyze as any)?.skipped || false },
    { name: 'Enhance', success: (results.enhance as any)?.ok, skipped: (results.enhance as any)?.skipped || false },
    { name: 'List', success: (results.list as any)?.ok, skipped: (results.list as any)?.skipped || false },
    { name: 'Sync', success: (results.sync as any)?.ok, skipped: (results.sync as any)?.skipped || false },
    { name: 'Trial', success: (results.trial as any)?.ok, skipped: (results.trial as any)?.skipped || false },
    { name: 'Profile', success: (results.profile as any)?.ok, skipped: (results.profile as any)?.skipped || false },
    { name: 'Checkout', success: (results.checkout as any)?.ok, skipped: (results.checkout as any)?.skipped || false },
    { name: 'Portal', success: (results.portal as any)?.ok, skipped: (results.portal as any)?.skipped || false },
    { name: 'Webhook', success: (results.webhook as any)?.status >= 400, skipped: false },
  ];

  let passed = 0;
  let skipped = 0;

  for (const { name, success, skipped: isSkipped } of testResults) {
    if (isSkipped) {
      console.log(`  ${colors.yellow}⊘${colors.reset} ${name} (skipped - auth required)`);
      skipped++;
    } else {
      const status = success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(`  ${status} ${name}`);
      if (success) passed++;
    }
  }

  console.log(`\n${colors.bold}Passed: ${passed}/${testResults.length - skipped}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${skipped} (requires CLERK_USER_ID)${colors.reset}\n`);

  if (passed === testResults.length - skipped) {
    console.log(`${colors.green}${colors.bold}All tests passed!${colors.reset}`);
  }

  return results;
}

// CLI Argument Parsing
const args = process.argv.slice(2);

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    logUsage();
    return;
  }

  if (args.includes('--list')) {
    console.log(`\nAvailable test suites:`);
    console.log(`  - analyze  : Content analysis API`);
    console.log(`  - enhance  : Content enhancement API`);
    console.log(`  - list     : Analyses list API`);
    console.log(`  - sync     : Subscription sync`);
    console.log(`  - trial    : Free trial API`);
    console.log(`  - profile  : User profile API`);
    console.log(`  - checkout : Checkout API`);
    console.log(`  - portal   : Customer portal API`);
    console.log(`  - webhook  : Webhook endpoint`);
    console.log(`  - health   : Health check`);
    return;
  }

  const runSpecific = args.filter((a) => !a.startsWith('--'));

  try {
    if (runSpecific.length === 0) {
      await runAllTests();
    } else {
      // Run specific tests
      for (const testName of runSpecific) {
        switch (testName.toLowerCase()) {
          case 'health':
            await testHealthEndpoint();
            break;
          case 'analyze':
            await testAnalyzeEndpoint();
            break;
          case 'enhance':
            await testEnhanceEndpoint();
            break;
          case 'list':
            await testAnalysesList();
            break;
          case 'sync':
            await testSubscriptionSync();
            break;
          case 'trial':
            await testTrialEndpoint();
            break;
          case 'profile':
            await testUserProfile();
            break;
          case 'checkout':
            await testCheckout();
            break;
          case 'portal':
            await testCustomerPortal();
            break;
          case 'webhook':
            await testWebhookEndpoint();
            break;
          default:
            log(`Unknown test: ${testName}`, 'error');
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}Test suite error:${colors.reset}`, error);
    process.exit(1);
  }
}

main();
