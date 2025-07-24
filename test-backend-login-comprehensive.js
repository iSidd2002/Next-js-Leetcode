#!/usr/bin/env node

/**
 * Comprehensive Backend Login Test
 * Tests the complete backend authentication flow to identify issues
 */

const BASE_URL = 'http://localhost:3000';

async function testBackendLogin() {
  console.log('🔍 COMPREHENSIVE BACKEND LOGIN TEST\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Test if server is running
    console.log('1️⃣ Testing server connectivity...');
    try {
      const healthResponse = await fetch(`${BASE_URL}/api/health`);
      console.log(`✅ Server responding: ${healthResponse.status}`);
    } catch (error) {
      console.log(`❌ Server not responding: ${error.message}`);
      return;
    }

    // Step 2: Reset rate limiting
    console.log('\n2️⃣ Resetting rate limiting...');
    const resetResponse = await fetch(`${BASE_URL}/api/debug/reset-rate-limit`, {
      method: 'POST'
    });
    console.log(`Rate limit reset: ${resetResponse.ok ? 'SUCCESS' : 'FAILED'}`);

    // Step 3: Test login endpoint directly
    console.log('\n3️⃣ Testing login endpoint...');
    
    const loginPayload = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('Login payload:', JSON.stringify(loginPayload, null, 2));
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginPayload)
    });

    console.log(`Login response status: ${loginResponse.status}`);
    console.log(`Login response headers:`, Object.fromEntries(loginResponse.headers.entries()));

    const loginData = await loginResponse.json();
    console.log('Login response body:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log('❌ LOGIN FAILED');
      console.log(`Error: ${loginData.error}`);
      
      // Check if it's a user not found issue
      if (loginData.error === 'Invalid email or password') {
        console.log('\n🔍 Checking if user exists...');
        await testUserExists();
      }
      return;
    }

    console.log('✅ LOGIN SUCCESSFUL');
    
    // Step 4: Analyze response structure
    console.log('\n4️⃣ Analyzing login response...');
    const expectedFields = ['success', 'data'];
    const actualFields = Object.keys(loginData);
    
    console.log(`Expected fields: ${expectedFields.join(', ')}`);
    console.log(`Actual fields: ${actualFields.join(', ')}`);
    
    if (loginData.success && loginData.data) {
      console.log('✅ Response structure is correct');
      console.log(`User data:`, JSON.stringify(loginData.data, null, 2));
    } else {
      console.log('❌ Response structure is incorrect');
    }

    // Step 5: Test cookie extraction
    console.log('\n5️⃣ Testing cookie handling...');
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    
    if (setCookieHeader) {
      console.log('✅ Set-Cookie header present');
      console.log(`Cookies: ${setCookieHeader}`);
      
      // Parse cookies
      const cookies = parseCookies(setCookieHeader);
      console.log('Parsed cookies:', cookies);
      
      // Test immediate API call with cookies
      await testImmediateAPICall(cookies);
      
    } else {
      console.log('❌ No Set-Cookie header found');
    }

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function testUserExists() {
  console.log('🔍 Testing if test user exists in database...');
  
  try {
    // Try to register the user first
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      })
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Test user created successfully');
      console.log('User data:', JSON.stringify(registerData, null, 2));
    } else {
      console.log(`Registration response: ${registerResponse.status}`);
      console.log('Registration error:', registerData.error);
      
      if (registerData.error && registerData.error.includes('already exists')) {
        console.log('✅ Test user already exists');
      } else {
        console.log('❌ Failed to create test user');
      }
    }
  } catch (error) {
    console.error('❌ User existence test failed:', error.message);
  }
}

async function testImmediateAPICall(cookies) {
  console.log('\n6️⃣ Testing immediate API call with cookies...');
  
  try {
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    console.log(`Using cookie string: ${cookieString}`);
    
    const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Cookie': cookieString
      }
    });

    console.log(`Profile API status: ${profileResponse.status}`);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Immediate API call successful');
      console.log('Profile data:', JSON.stringify(profileData, null, 2));
    } else {
      const errorData = await profileResponse.json();
      console.log('❌ Immediate API call failed');
      console.log('Error:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ Immediate API call test failed:', error.message);
  }
}

function parseCookies(setCookieHeader) {
  const cookies = [];
  
  // Handle multiple cookies in Node.js fetch (they come as a single string)
  const cookieParts = setCookieHeader.split(',').map(c => c.trim());
  
  cookieParts.forEach(cookiePart => {
    if (cookiePart.includes('=')) {
      const [nameValue, ...attributes] = cookiePart.split(';');
      const [name, value] = nameValue.split('=');
      
      if (name && value) {
        cookies.push({
          name: name.trim(),
          value: value.trim(),
          attributes: attributes.map(attr => attr.trim())
        });
      }
    }
  });
  
  return cookies;
}

async function testDatabaseConnection() {
  console.log('\n7️⃣ Testing database connection...');
  
  try {
    // This would require a specific endpoint to test DB connection
    // For now, we'll test by trying to access a protected endpoint
    const testResponse = await fetch(`${BASE_URL}/api/problems`);
    
    if (testResponse.status === 401) {
      console.log('✅ Database connection working (got expected 401)');
    } else {
      console.log(`Database test response: ${testResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
  }
}

async function runComprehensiveTest() {
  console.log('🧪 Starting Comprehensive Backend Login Test\n');
  
  await testBackendLogin();
  await testDatabaseConnection();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Backend login test completed!');
  console.log('\nIf login is failing, check:');
  console.log('1. Database connection and user existence');
  console.log('2. Password hashing and verification');
  console.log('3. JWT token generation');
  console.log('4. Cookie configuration');
  console.log('5. CORS settings');
}

// Run the test
runComprehensiveTest();
