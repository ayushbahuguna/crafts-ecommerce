import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400)
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return createErrorResponse('Invalid credentials', 401)
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return createErrorResponse('Invalid credentials', 401)
    }

    // Generate token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return createResponse({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
