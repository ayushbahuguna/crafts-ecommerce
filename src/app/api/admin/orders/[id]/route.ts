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
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    const { status } = await request.json()

    if (!status) {
      return createErrorResponse('Status is required', 400)
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        },
        address: true
      }
    })

    // Parse product images
    const orderWithParsedImages = {
      ...order,
      orderItems: order.orderItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images)
        }
      }))
    }

    return createResponse(orderWithParsedImages)
  } catch (error) {
    console.error('Order update error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
