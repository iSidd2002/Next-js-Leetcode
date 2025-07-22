#!/usr/bin/env node

/**
 * Test Login Cookie Handling
 * Tests that cookies are properly set and used after login
 */

const BASE_URL = 'http://localhost:3000';

async function testLoginWithCookies() {
  console.log('🍪 Testing Login Cookie Handling...\n');

  try {
    // Step 1: Reset rate limiting
    console.log('1. Resetting rate limiting...');
    const resetResponse = await fetch(`${BASE_URL}/api/debug/reset-rate-limit`, {
      method: 'POST'
    });
    
    if (resetResponse.ok) {
      console.log('✅ Rate limiting reset');
    } else {
      console.log('⚠️  Could not reset rate limiting');
    }

    // Step 2: Login and capture cookies
    console.log('\n2. Testing login with cookie capture...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.data.user.email}`);
      
      // Extract cookies from response
      const setCookieHeaders = loginResponse.headers.get('set-cookie');
      console.log(`   Set-Cookie headers: ${setCookieHeaders ? 'Present' : 'Missing'}`);
      
      if (setCookieHeaders) {
        console.log(`   Cookies: ${setCookieHeaders}`);
      }
      
      // Get all cookies from the response
      const cookies = [];
      const cookieHeader = loginResponse.headers.get('set-cookie');
      if (cookieHeader) {
        // Parse multiple cookies (they come as a single string in Node.js fetch)
        const cookieParts = cookieHeader.split(',').map(c => c.trim());
        cookieParts.forEach(cookie => {
          if (cookie.includes('=')) {
            const [name, ...valueParts] = cookie.split('=');
            const value = valueParts.join('=').split(';')[0];
            cookies.push(`${name.trim()}=${value.trim()}`);
          }
        });
      }
      
      console.log(`   Parsed cookies: ${cookies.length} found`);
      cookies.forEach((cookie, index) => {
        console.log(`     ${index + 1}. ${cookie}`);
      });

      // Step 3: Test authenticated request with cookies
      console.log('\n3. Testing authenticated request with cookies...');
      
      const cookieString = cookies.join('; ');
      console.log(`   Using cookie string: ${cookieString}`);
      
      const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Cookie': cookieString
        }
      });

      const profileData = await profileResponse.json();
      
      if (profileResponse.ok) {
        console.log('✅ Authenticated request successful');
        console.log(`   Profile: ${profileData.data.email}`);
      } else {
        console.log('❌ Authenticated request failed');
        console.log(`   Status: ${profileResponse.status}`);
        console.log(`   Error: ${profileData.error}`);
      }

      // Step 4: Test problems API with cookies
      console.log('\n4. Testing problems API with cookies...');
      
      const problemsResponse = await fetch(`${BASE_URL}/api/problems`, {
        headers: {
          'Cookie': cookieString
        }
      });

      const problemsData = await problemsResponse.json();
      
      if (problemsResponse.ok) {
        console.log('✅ Problems API request successful');
        console.log(`   Problems count: ${problemsData.data.length}`);
      } else {
        console.log('❌ Problems API request failed');
        console.log(`   Status: ${problemsResponse.status}`);
        console.log(`   Error: ${problemsData.error}`);
      }

    } else {
      console.log('❌ Login failed');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Error: ${loginData.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testBrowserCookieCompatibility() {
  console.log('\n🌐 Testing Browser Cookie Compatibility...\n');
  
  try {
    // Test the cookie settings by examining the Set-Cookie headers
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      
      if (setCookieHeader) {
        console.log('Cookie Settings Analysis:');
        console.log(`Raw Set-Cookie: ${setCookieHeader}`);
        
        // Check for important cookie attributes
        const hasHttpOnly = setCookieHeader.includes('HttpOnly');
        const hasSameSite = setCookieHeader.includes('SameSite');
        const sameSiteValue = setCookieHeader.match(/SameSite=([^;]+)/)?.[1];
        const hasSecure = setCookieHeader.includes('Secure');
        const hasPath = setCookieHeader.includes('Path=/');
        
        console.log(`✅ HttpOnly: ${hasHttpOnly}`);
        console.log(`✅ SameSite: ${hasSameSite} (${sameSiteValue || 'not set'})`);
        console.log(`✅ Secure: ${hasSecure} (${process.env.NODE_ENV === 'production' ? 'expected in prod' : 'not needed in dev'})`);
        console.log(`✅ Path: ${hasPath}`);
        
        if (sameSiteValue === 'Strict') {
          console.log('⚠️  SameSite=Strict might cause issues with some browsers/scenarios');
          console.log('   Consider using SameSite=Lax for better compatibility');
        } else if (sameSiteValue === 'Lax') {
          console.log('✅ SameSite=Lax provides good security with better compatibility');
        }
        
      } else {
        console.log('❌ No Set-Cookie header found');
      }
    }
    
  } catch (error) {
    console.error('❌ Browser compatibility test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Login Cookie Tests\n');
  console.log('=' .repeat(60));

  await testLoginWithCookies();
  await testBrowserCookieCompatibility();

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Cookie tests completed!');
}

// Run the tests
runTests();
