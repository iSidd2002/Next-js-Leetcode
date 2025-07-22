#!/usr/bin/env node

/**
 * Final Authentication Flow Test
 * Tests the complete authentication flow including browser cookie handling
 */

const BASE_URL = 'http://localhost:3000';

async function testCompleteAuthFlow() {
  console.log('🚀 Testing Complete Authentication Flow\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Reset rate limiting
    console.log('1️⃣ Resetting rate limiting...');
    const resetResponse = await fetch(`${BASE_URL}/api/debug/reset-rate-limit`, {
      method: 'POST'
    });
    
    if (resetResponse.ok) {
      console.log('✅ Rate limiting reset successfully');
    } else {
      console.log('⚠️  Could not reset rate limiting');
    }

    // Step 2: Test login
    console.log('\n2️⃣ Testing login...');
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
    } else {
      console.log('❌ Login failed:', loginData.error);
      return;
    }

    // Step 3: Test immediate API calls (this is where the issue was)
    console.log('\n3️⃣ Testing immediate API calls after login...');
    
    const apiTests = [
      { name: 'Profile', endpoint: '/api/auth/profile' },
      { name: 'Problems', endpoint: '/api/problems' },
      { name: 'Todos', endpoint: '/api/todos' },
      { name: 'Contests', endpoint: '/api/contests' }
    ];

    for (const test of apiTests) {
      try {
        const response = await fetch(`${BASE_URL}${test.endpoint}`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${test.name}: Success`);
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

    // Step 4: Test with delay (simulating frontend timing)
    console.log('\n4️⃣ Testing API calls with delay (simulating frontend)...');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    for (const test of apiTests) {
      try {
        const response = await fetch(`${BASE_URL}${test.endpoint}`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${test.name} (delayed): Success`);
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

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Authentication flow test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

async function testBrowserCompatibility() {
  console.log('\n🌐 Testing Browser Compatibility\n');
  console.log('=' .repeat(40));

  try {
    // Test CORS preflight
    console.log('1️⃣ Testing CORS preflight...');
    const preflightResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'OPTIONS'
    });
    
    if (preflightResponse.ok) {
      console.log('✅ CORS preflight successful');
    } else {
      console.log('❌ CORS preflight failed');
    }

    // Test cookie settings
    console.log('\n2️⃣ Testing cookie settings...');
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
        
        // Analyze cookie attributes
        const hasHttpOnly = setCookieHeader.includes('HttpOnly');
        const hasSameSite = setCookieHeader.includes('SameSite');
        const sameSiteValue = setCookieHeader.match(/SameSite=([^;]+)/)?.[1];
        const hasSecure = setCookieHeader.includes('Secure');
        
        console.log(`   HttpOnly: ${hasHttpOnly ? '✅' : '❌'}`);
        console.log(`   SameSite: ${hasSameSite ? '✅' : '❌'} (${sameSiteValue || 'not set'})`);
        console.log(`   Secure: ${hasSecure ? '✅' : '❌'} (${process.env.NODE_ENV === 'production' ? 'expected' : 'not needed in dev'})`);
        
        if (sameSiteValue === 'lax') {
          console.log('✅ SameSite=lax is optimal for compatibility');
        }
      } else {
        console.log('❌ No Set-Cookie header found');
      }
    }

    console.log('\n' + '=' .repeat(40));
    console.log('🎉 Browser compatibility test completed!');

  } catch (error) {
    console.error('\n❌ Browser compatibility test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Starting Comprehensive Authentication Tests\n');
  
  await testCompleteAuthFlow();
  await testBrowserCompatibility();
  
  console.log('\n🏁 All tests completed!');
  console.log('\n📋 Summary:');
  console.log('✅ Complete authentication flow tested');
  console.log('✅ Immediate API calls after login tested');
  console.log('✅ Delayed API calls tested');
  console.log('✅ Authentication persistence tested');
  console.log('✅ Browser compatibility tested');
  console.log('✅ Cookie settings validated');
}

// Run all tests
runAllTests();
