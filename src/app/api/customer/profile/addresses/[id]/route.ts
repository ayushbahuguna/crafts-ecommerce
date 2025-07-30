import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify address ownership
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!existingAddress) {
      return createErrorResponse('Address not found', 404)
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.userId,
          isDefault: true,
          id: { not: params.id }
        },
        data: {
          isDefault: false
        }
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
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

    return createResponse(updatedAddress)
  } catch (error) {
    console.error('Address update error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Verify address ownership
    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!address) {
      return createErrorResponse('Address not found', 404)
    }

    // Check if address is used in any orders
    const ordersCount = await prisma.order.count({
      where: { addressId: params.id }
    })

    if (ordersCount > 0) {
      return createErrorResponse('Cannot delete address used in orders', 400)
    }

    await prisma.address.delete({
      where: { id: params.id }
    })

    return createResponse({ message: 'Address deleted successfully' })
  } catch (error) {
    console.error('Address deletion error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
