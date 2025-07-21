import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
}

export function generateToken(user: JWTPayload): string {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      algorithm: 'HS256'
    }
  );
}

export function verifyToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    }) as JWTPayload;

    // Additional validation
    if (!payload.id || !payload.email || !payload.username) {
      throw new Error('Invalid token payload');
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    }
    throw error;
  }
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
    // First try to get user info from middleware headers (preferred method)
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

    // Fallback to direct token extraction and verification
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
