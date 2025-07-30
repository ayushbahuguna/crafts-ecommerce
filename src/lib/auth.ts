import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

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
    return authHeader.substring(7)
  }
  
  // Also check for token in cookies
  const tokenFromCookie = request.cookies.get('auth-token')
  return tokenFromCookie?.value || null
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return null
    
    return verifyToken(token)
  } catch {
    return null
  }
}
