import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: {
      OR?: Array<{
        code?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {}

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.coupon.count({ where })
    ])

    return createResponse({
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Coupons fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
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

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCoupon) {
      return createErrorResponse('Coupon code already exists', 409)
    }

    const coupon = await prisma.coupon.create({
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
        isActive: isActive ?? true
      }
    })

    return createResponse(coupon, 201)
  } catch (error) {
    console.error('Coupon creation error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
