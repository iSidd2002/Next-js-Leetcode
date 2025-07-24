
import ApiService from '../services/api';
import { POST as login } from '../app/api/auth/login/route';
import { NextRequest } from 'next/server';
import User from '../models/User';
import * as auth from '../lib/auth';
import * as mongodb from '../lib/mongodb';

// Mock the NextRequest
class MockNextRequest {
    _json: any;
    headers: Map<string, string>;

    constructor(body: any) {
        this._json = body;
        this.headers = new Map();
    }

    async json() {
        return this._json;
    }
}

test('login should return user data and set cookies', async () => {
    // Mock the request and response objects
    const request = new MockNextRequest({
        email: 'test@example.com',
        password: 'password123'
    }) as unknown as NextRequest;


    // Mock the User model and its methods
    const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword'
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(mongodb, 'connectDB').mockResolvedValue(Promise.resolve(undefined) as any);
    jest.spyOn(auth, 'comparePassword').mockResolvedValue(true);
    jest.spyOn(auth, 'generateToken').mockReturnValue('mockToken');


    // Execute the login function
    const response = await login(request);
    const data = await response.json();

    // Check if cookies are set
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('auth-token=mockToken');
    expect(cookies).toContain('user-id=mockUserId');
    
    // Check if user data is returned
    expect(data.success).toBe(true);
    expect(data.data.user.id).toBe('mockUserId');

    // Simulate the client-side check
    document.cookie = 'auth-token=mockToken';
    document.cookie = 'user-id=mockUserId';
    const isAuthenticated = ApiService.isAuthenticated();
    expect(isAuthenticated).toBe(true);
});

