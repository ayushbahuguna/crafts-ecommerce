import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json()

    if (!name || !email || !password) {
      return createErrorResponse('Name, email, and password are required', 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return createErrorResponse('User already exists with this email', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'CUSTOMER'
      }
    })

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
    }, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
