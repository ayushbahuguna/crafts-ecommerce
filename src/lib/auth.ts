import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
}

// For Node.js runtime (API routes)
export function signToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET!
  const options = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as any, secret, options as any)
}

// For Edge Runtime compatible JWT verification (middleware)
export async function verifyTokenEdge(token: string): Promise<JWTPayload> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jose.jwtVerify(token, secret)
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'ADMIN' | 'CUSTOMER'
    }
  } catch {
    throw new Error('Invalid token')
  }
}

// For Node.js runtime (API routes) - secure verification
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log('Auth - Token found in Authorization header');
    return authHeader.substring(7)
  }
  
  // Also check for token in cookies
  const tokenFromCookie = request.cookies.get('auth-token')
  console.log('Auth - Token from cookie:', tokenFromCookie?.value ? 'Found' : 'Not found');
  return tokenFromCookie?.value || null
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      console.log('Auth - No token found in request');
      return null
    }
    
    console.log('Auth - Attempting to verify token');
    const user = await verifyTokenEdge(token)
    console.log('Auth - Token verified successfully for user:', { id: user.userId, role: user.role });
    return user
  } catch {
    console.log('Auth - Token verification failed');
    return null
  }
}
