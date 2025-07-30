import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true
              }
            }
          }
        },
        address: true,
        coupon: {
          select: {
            code: true,
            description: true
          }
        }
      }
    })

    if (!order) {
      return createErrorResponse('Order not found', 404)
    }

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
    console.error('Order fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { action } = await request.json()

    if (!action) {
      return createErrorResponse('Action is required', 400)
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return createErrorResponse('Order not found', 404)
    }

    let updatedOrder

    switch (action) {
      case 'cancel':
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
          return createErrorResponse('Order cannot be cancelled at this stage', 400)
        }

        updatedOrder = await prisma.$transaction(async (tx) => {
          // Restore product stock
          for (const item of order.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            })
          }

          // Update order status
          return await tx.order.update({
            where: { id: params.id },
            data: {
              status: 'CANCELLED'
            }
          })
        })
        break

      case 'return':
        if (order.status !== 'DELIVERED') {
          return createErrorResponse('Only delivered orders can be returned', 400)
        }

        // Check if return window is still open (e.g., 7 days)
        const deliveryDate = order.updatedAt
        const returnWindow = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        const now = new Date()

        if (now.getTime() - deliveryDate.getTime() > returnWindow) {
          return createErrorResponse('Return window has expired', 400)
        }

        updatedOrder = await prisma.order.update({
          where: { id: params.id },
          data: {
            status: 'RETURNED'
          }
        })
        break

      default:
        return createErrorResponse('Invalid action', 400)
    }

    return createResponse({
      message: `Order ${action}led successfully`,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order update error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
