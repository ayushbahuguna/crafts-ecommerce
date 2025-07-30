import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!coupon) {
      return createErrorResponse('Coupon not found', 404)
    }

    return createResponse(coupon)
  } catch (error) {
    console.error('Coupon fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = await request.json()

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return createErrorResponse('Code, discount type, discount value, valid from, and valid until are required', 400)
    }

    // Check if another coupon with same code exists
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { code: code.toUpperCase() }
        ]
      }
    })

    if (existingCoupon) {
      return createErrorResponse('Another coupon with this code already exists', 409)
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minimumAmount: minimumAmount ? parseFloat(minimumAmount) : 0,
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive
      }
    })

    return createResponse(coupon)
  } catch (error) {
    console.error('Coupon update error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if coupon is used in any orders
    const ordersCount = await prisma.order.count({
      where: { couponId: id }
    })

    if (ordersCount > 0) {
      return createErrorResponse('Cannot delete coupon used in orders', 400)
    }

    await prisma.coupon.delete({
      where: { id }
    })

    return createResponse({ message: 'Coupon deleted successfully' })
  } catch (error) {
    console.error('Coupon deletion error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
