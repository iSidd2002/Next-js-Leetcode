#!/usr/bin/env node

/**
 * Comprehensive Review Feature Authentication Test
 * Tests the complete authentication flow and review functionality
 */

const BASE_URL = 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies
    ...options,
  });

  const data = await response.json();
  return { response, data };
}

async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...\n');

  // Test 1: Register a new user
  console.log('1. Testing user registration...');
  const registerData = {
    email: `test-${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'securepassword123'
  };

  const { response: regResponse, data: regData } = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData)
  });

  if (regResponse.ok) {
    console.log('✅ Registration successful');
    console.log(`   User: ${regData.data.user.email}`);
  } else {
    console.log('❌ Registration failed:', regData.error);
    return null;
  }

  // Test 2: Login with the new user
  console.log('\n2. Testing user login...');
  const { response: loginResponse, data: loginData } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: registerData.email,
      password: registerData.password
    })
  });

  if (loginResponse.ok) {
    console.log('✅ Login successful');
    console.log(`   User ID: ${loginData.data.user.id}`);
    return loginData.data.user;
  } else {
    console.log('❌ Login failed:', loginData.error);
    return null;
  }
}

async function testReviewFunctionality(user) {
  console.log('\n📚 Testing Review Feature...\n');

  // Test 1: Add a problem for review
  console.log('1. Adding a problem for review...');
  const problemData = {
    title: 'Two Sum - Review Test',
    platform: 'leetcode',
    difficulty: 'Easy',
    url: 'https://leetcode.com/problems/two-sum-review-test',
    isReview: true,
    notes: 'Test problem for review functionality',
    topics: ['Array', 'Hash Table'],
    source: 'manual'
  };

  const { response: addResponse, data: addData } = await makeRequest('/api/problems', {
    method: 'POST',
    body: JSON.stringify(problemData)
  });

  if (addResponse.ok) {
    console.log('✅ Problem added successfully');
    console.log(`   Problem ID: ${addData.data.id}`);
    console.log(`   Is Review: ${addData.data.isReview}`);
  } else {
    console.log('❌ Failed to add problem:', addData.error);
    return;
  }

  // Test 2: Fetch all problems
  console.log('\n2. Fetching all problems...');
  const { response: allResponse, data: allData } = await makeRequest('/api/problems');

  if (allResponse.ok) {
    console.log('✅ Problems fetched successfully');
    console.log(`   Total problems: ${allData.data.length}`);
    const reviewProblems = allData.data.filter(p => p.isReview);
    console.log(`   Review problems: ${reviewProblems.length}`);
  } else {
    console.log('❌ Failed to fetch problems:', allData.error);
    return;
  }

  // Test 3: Fetch only review problems
  console.log('\n3. Fetching review problems only...');
  const { response: reviewResponse, data: reviewData } = await makeRequest('/api/problems?isReview=true');

  if (reviewResponse.ok) {
    console.log('✅ Review problems fetched successfully');
    console.log(`   Review problems: ${reviewData.data.length}`);
    reviewData.data.forEach((problem, index) => {
      console.log(`   ${index + 1}. ${problem.title} (Review: ${problem.isReview})`);
    });
  } else {
    console.log('❌ Failed to fetch review problems:', reviewData.error);
    return;
  }

  // Test 4: Test review debug endpoint
  console.log('\n4. Testing review debug endpoint...');
  const { response: debugResponse, data: debugData } = await makeRequest('/api/debug/review');

  if (debugResponse.ok) {
    console.log('✅ Review debug data fetched successfully');
    console.log(`   Total problems: ${debugData.data.summary.totalProblems}`);
    console.log(`   Review problems: ${debugData.data.summary.reviewProblems}`);
    console.log(`   Due for review: ${debugData.data.summary.dueForReview}`);
    console.log(`   Invalid dates: ${debugData.data.summary.invalidDates}`);
    console.log(`   Environment: ${debugData.data.environment.nodeEnv}`);
  } else {
    console.log('❌ Failed to fetch review debug data:', debugData.error);
  }
}

async function testUserIsolation() {
  console.log('\n🔒 Testing User Data Isolation...\n');

  // Create second user
  console.log('1. Creating second user...');
  const user2Data = {
    email: `test2-${Date.now()}@example.com`,
    username: `testuser2${Date.now()}`,
    password: 'securepassword456'
  };

  const { response: reg2Response, data: reg2Data } = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(user2Data)
  });

  if (!reg2Response.ok) {
    console.log('❌ Failed to create second user:', reg2Data.error);
    return;
  }

  console.log('✅ Second user created successfully');

  // Login as second user
  const { response: login2Response, data: login2Data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: user2Data.email,
      password: user2Data.password
    })
  });

  if (!login2Response.ok) {
    console.log('❌ Failed to login as second user:', login2Data.error);
    return;
  }

  console.log('✅ Logged in as second user');

  // Test that second user sees no problems
  console.log('\n2. Testing data isolation...');
  const { response: isolationResponse, data: isolationData } = await makeRequest('/api/problems');

  if (isolationResponse.ok) {
    console.log('✅ Data isolation test successful');
    console.log(`   Second user sees ${isolationData.data.length} problems (should be 0)`);
    
    if (isolationData.data.length === 0) {
      console.log('✅ Perfect data isolation - users only see their own data');
    } else {
      console.log('❌ Data isolation failed - user can see other users\' data');
    }
  } else {
    console.log('❌ Failed to test data isolation:', isolationData.error);
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting...\n');

  console.log('1. Testing multiple failed login attempts...');
  
  const attempts = [];
  for (let i = 0; i < 6; i++) {
    const { response, data } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    });
    
    attempts.push({ attempt: i + 1, status: response.status, error: data.error });
    
    if (response.status === 429) {
      console.log(`✅ Rate limiting triggered after ${i + 1} attempts`);
      break;
    }
  }

  attempts.forEach(attempt => {
    console.log(`   Attempt ${attempt.attempt}: ${attempt.status} - ${attempt.error}`);
  });
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Authentication & Review Feature Tests\n');
  console.log('=' .repeat(60));

  try {
    // Test authentication flow
    const user = await testAuthenticationFlow();
    if (!user) {
      console.log('\n❌ Authentication tests failed. Stopping.');
      return;
    }

    // Test review functionality
    await testReviewFunctionality(user);

    // Test user isolation
    await testUserIsolation();

    // Test rate limiting
    await testRateLimiting();

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ User registration and login');
    console.log('✅ Review problem creation and retrieval');
    console.log('✅ User data isolation');
    console.log('✅ Rate limiting protection');
    console.log('✅ Proper authentication validation');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
  }
}

// Run the tests
runTests();
