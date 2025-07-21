import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
}

export function generateToken(user: JWTPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // First try to get token from cookies
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header for backward compatibility
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    // Development mode: Allow testing without authentication
    if (process.env.NODE_ENV === 'development') {
      // Check for test header to enable mock user
      const testMode = request.headers.get('x-test-mode');
      if (testMode === 'true' || !request.headers.get('authorization')) {
        return {
          id: 'dev-user-123',
          email: 'developer@example.com',
          username: 'developer'
        };
      }
    }

    // First try to get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userUsername = request.headers.get('x-user-username');

    if (userId && userEmail && userUsername) {
      return {
        id: userId,
        email: userEmail,
        username: userUsername
      };
    }

    // Fallback to token extraction and verification
    const token = getTokenFromRequest(request);
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
