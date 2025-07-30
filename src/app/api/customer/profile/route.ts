import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest, hashPassword } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!profile) {
      return createErrorResponse('Profile not found', 404)
    }

    return createResponse(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { name, phone, currentPassword, newPassword } = await request.json()

    if (!name) {
      return createErrorResponse('Name is required', 400)
    }

    const updateData: any = {
      name,
      phone: phone || null
    }

    // If user wants to change password
    if (newPassword) {
      if (!currentPassword) {
        return createErrorResponse('Current password is required to set new password', 400)
      }

      // Verify current password
      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId }
      })

      if (!currentUser) {
        return createErrorResponse('User not found', 404)
      }

      const { comparePassword } = await import('@/lib/auth')
      const isValidPassword = await comparePassword(currentPassword, currentUser.password)
      
      if (!isValidPassword) {
        return createErrorResponse('Current password is incorrect', 400)
      }

      updateData.password = await hashPassword(newPassword)
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        updatedAt: true
      }
    })

    return createResponse(updatedProfile)
  } catch (error) {
    console.error('Profile update error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
