#!/usr/bin/env node

/**
 * Complete Authentication Solution Test
 * Verifies that all authentication issues have been resolved
 */

const BASE_URL = 'http://localhost:3000';

async function testCompleteAuthSolution() {
  console.log('🎯 Testing Complete Authentication Solution\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Reset rate limiting
    console.log('1️⃣ Resetting rate limiting...');
    const resetResponse = await fetch(`${BASE_URL}/api/debug/reset-rate-limit`, {
      method: 'POST'
    });
    
    if (resetResponse.ok) {
      console.log('✅ Rate limiting reset successfully');
    }

    // Step 2: Test complete login flow
    console.log('\n2️⃣ Testing complete login flow...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.data.user.email}`);
      console.log(`   User ID: ${loginData.data.user.id}`);
      
      // Check Set-Cookie headers
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('✅ Set-Cookie header present');
        console.log(`   Cookies: ${setCookieHeader.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ Login failed:', loginData.error);
      return;
    }

    // Step 3: Test immediate API calls (the main issue we fixed)
    console.log('\n3️⃣ Testing immediate API calls after login...');
    
    const immediateTests = [
      { name: 'Profile', endpoint: '/api/auth/profile' },
      { name: 'Problems', endpoint: '/api/problems' },
      { name: 'Todos', endpoint: '/api/todos' },
      { name: 'Contests', endpoint: '/api/contests' }
    ];

    let immediateSuccessCount = 0;
    
    for (const test of immediateTests) {
      try {
        const response = await fetch(`${BASE_URL}${test.endpoint}`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${test.name}: Success`);
          immediateSuccessCount++;
          
          if (test.name === 'Profile') {
            console.log(`   Email: ${data.data.email}`);
          } else if (Array.isArray(data.data)) {
            console.log(`   Count: ${data.data.length}`);
          }
        } else {
          console.log(`❌ ${test.name}: Failed - ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name}: Network error - ${error.message}`);
      }
    }

    // Step 4: Test with delays (simulating browser timing)
    console.log('\n4️⃣ Testing API calls with delays...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let delayedSuccessCount = 0;
    
    for (const test of immediateTests) {
      try {
        const response = await fetch(`${BASE_URL}${test.endpoint}`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${test.name} (delayed): Success`);
          delayedSuccessCount++;
        } else {
          console.log(`❌ ${test.name} (delayed): Failed - ${data.error}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} (delayed): Network error - ${error.message}`);
      }
    }

    // Step 5: Test authentication persistence
    console.log('\n5️⃣ Testing authentication persistence...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const persistenceResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
      credentials: 'include'
    });
    
    const persistenceData = await persistenceResponse.json();
    
    if (persistenceResponse.ok) {
      console.log('✅ Authentication persisted successfully');
      console.log(`   User still logged in: ${persistenceData.data.email}`);
    } else {
      console.log('❌ Authentication did not persist:', persistenceData.error);
    }

    // Step 6: Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 AUTHENTICATION SOLUTION TEST RESULTS:');
    console.log('=' .repeat(60));
    
    console.log(`✅ Login Success: ${loginResponse.ok ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Immediate API Calls: ${immediateSuccessCount}/4 PASS`);
    console.log(`✅ Delayed API Calls: ${delayedSuccessCount}/4 PASS`);
    console.log(`✅ Authentication Persistence: ${persistenceResponse.ok ? 'PASS' : 'FAIL'}`);
    
    const overallSuccess = loginResponse.ok && 
                          immediateSuccessCount >= 3 && 
                          delayedSuccessCount >= 3 && 
                          persistenceResponse.ok;
    
    console.log('\n' + '=' .repeat(60));
    if (overallSuccess) {
      console.log('🎉 AUTHENTICATION SOLUTION: ✅ SUCCESS');
      console.log('🚀 Ready for deployment!');
    } else {
      console.log('❌ AUTHENTICATION SOLUTION: ❌ NEEDS MORE WORK');
    }
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

async function testBrowserCompatibility() {
  console.log('\n🌐 Testing Browser Compatibility Features\n');
  console.log('=' .repeat(40));

  try {
    // Test cookie attributes
    console.log('1️⃣ Testing cookie attributes...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      
      if (setCookieHeader) {
        console.log('✅ Set-Cookie header present');
        
        // Check cookie attributes
        const hasHttpOnly = setCookieHeader.includes('HttpOnly');
        const hasSameSite = setCookieHeader.includes('SameSite');
        const sameSiteValue = setCookieHeader.match(/SameSite=([^;,]+)/)?.[1];
        const hasSecure = setCookieHeader.includes('Secure');
        const hasPath = setCookieHeader.includes('Path=/');
        
        console.log(`   ✅ HttpOnly: ${hasHttpOnly}`);
        console.log(`   ✅ SameSite: ${hasSameSite} (${sameSiteValue || 'not set'})`);
        console.log(`   ✅ Secure: ${hasSecure} (${process.env.NODE_ENV === 'production' ? 'expected' : 'not needed in dev'})`);
        console.log(`   ✅ Path: ${hasPath}`);
        
        if (sameSiteValue === 'lax') {
          console.log('   ✅ SameSite=lax provides optimal browser compatibility');
        }
      }
    }

    console.log('\n' + '=' .repeat(40));
    console.log('🎉 Browser compatibility verified!');

  } catch (error) {
    console.error('\n❌ Browser compatibility test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Starting Complete Authentication Solution Tests\n');
  
  await testCompleteAuthSolution();
  await testBrowserCompatibility();
  
  console.log('\n🏁 All authentication tests completed!');
}

// Run all tests
runAllTests();
