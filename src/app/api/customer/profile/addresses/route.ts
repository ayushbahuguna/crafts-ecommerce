import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: user.userId
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return createResponse(addresses)
  } catch (error) {
    console.error('Addresses fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      isDefault
    } = await request.json()

    if (!name || !phone || !address || !city || !state || !pincode) {
      return createErrorResponse('All address fields are required', 400)
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.userId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.userId,
        name,
        phone,
        address,
        city,
        state,
        pincode,
        country: country || 'India',
        isDefault: isDefault || false
      }
    })

    return createResponse(newAddress, 201)
  } catch (error) {
    console.error('Address creation error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
