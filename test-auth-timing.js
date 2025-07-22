#!/usr/bin/env node

/**
 * Authentication Timing Test
 * Tests the timing of authentication after login to identify the 1-second logout issue
 */

const BASE_URL = 'http://localhost:3000';

async function testAuthTiming() {
  console.log('⏱️  Testing Authentication Timing\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Reset rate limiting
    console.log('1️⃣ Resetting rate limiting...');
    await fetch(`${BASE_URL}/api/debug/reset-rate-limit`, { method: 'POST' });
    console.log('✅ Rate limiting reset');

    // Step 2: Login
    console.log('\n2️⃣ Performing login...');
    const loginStart = Date.now();
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginEnd = Date.now();
    const loginTime = loginEnd - loginStart;
    
    if (loginResponse.ok) {
      console.log(`✅ Login successful in ${loginTime}ms`);
    } else {
      console.log('❌ Login failed');
      return;
    }

    // Step 3: Test API calls at different intervals
    console.log('\n3️⃣ Testing API calls at different intervals...');
    
    const intervals = [0, 100, 200, 500, 1000, 2000, 3000];
    
    for (const interval of intervals) {
      console.log(`\n⏱️  Testing after ${interval}ms delay:`);
      
      if (interval > 0) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
      
      // Test profile API
      const profileStart = Date.now();
      const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
        credentials: 'include'
      });
      const profileEnd = Date.now();
      const profileTime = profileEnd - profileStart;
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log(`  ✅ Profile API: SUCCESS in ${profileTime}ms - ${profileData.data.email}`);
      } else {
        const errorData = await profileResponse.json();
        console.log(`  ❌ Profile API: FAILED in ${profileTime}ms - ${errorData.error}`);
      }
      
      // Test problems API
      const problemsStart = Date.now();
      const problemsResponse = await fetch(`${BASE_URL}/api/problems`, {
        credentials: 'include'
      });
      const problemsEnd = Date.now();
      const problemsTime = problemsEnd - problemsStart;
      
      if (problemsResponse.ok) {
        const problemsData = await problemsResponse.json();
        console.log(`  ✅ Problems API: SUCCESS in ${problemsTime}ms - ${problemsData.data.length} problems`);
      } else {
        const errorData = await problemsResponse.json();
        console.log(`  ❌ Problems API: FAILED in ${problemsTime}ms - ${errorData.error}`);
      }
    }

    // Step 4: Test continuous calls
    console.log('\n4️⃣ Testing continuous API calls...');
    
    for (let i = 1; i <= 10; i++) {
      const testStart = Date.now();
      const testResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
        credentials: 'include'
      });
      const testEnd = Date.now();
      const testTime = testEnd - testStart;
      
      if (testResponse.ok) {
        console.log(`  ✅ Call ${i}: SUCCESS in ${testTime}ms`);
      } else {
        const errorData = await testResponse.json();
        console.log(`  ❌ Call ${i}: FAILED in ${testTime}ms - ${errorData.error}`);
        break; // Stop on first failure
      }
      
      // Small delay between calls
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '=' .repeat(50));
    console.log('⏱️  Authentication timing test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

async function testCookiePersistence() {
  console.log('\n🍪 Testing Cookie Persistence\n');
  console.log('=' .repeat(30));

  try {
    // Login first
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed for cookie test');
      return;
    }

    console.log('✅ Login successful for cookie test');

    // Test persistence over time
    const testDurations = [1000, 5000, 10000]; // 1s, 5s, 10s
    
    for (const duration of testDurations) {
      console.log(`\n⏱️  Testing after ${duration/1000}s:`);
      
      await new Promise(resolve => setTimeout(resolve, duration));
      
      const testResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
        credentials: 'include'
      });
      
      if (testResponse.ok) {
        console.log(`  ✅ Authentication persisted after ${duration/1000}s`);
      } else {
        const errorData = await testResponse.json();
        console.log(`  ❌ Authentication lost after ${duration/1000}s - ${errorData.error}`);
        break;
      }
    }

  } catch (error) {
    console.error('\n❌ Cookie persistence test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Starting Authentication Timing Tests\n');
  
  await testAuthTiming();
  await testCookiePersistence();
  
  console.log('\n🏁 All timing tests completed!');
}

// Run all tests
runAllTests();
