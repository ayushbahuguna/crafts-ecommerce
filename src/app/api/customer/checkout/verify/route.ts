import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return createErrorResponse('Payment verification data is incomplete', 400)
    }

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return createErrorResponse('Payment verification failed', 400)
    }

    // Update order status
    const order = await prisma.order.update({
      where: {
        id: orderId,
        userId: user.userId
      },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paymentId: razorpay_payment_id,
        paymentMethod: 'razorpay'
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        },
        address: true
      }
    })

    if (!order) {
      return createErrorResponse('Order not found', 404)
    }

    return createResponse({
      message: 'Payment verified successfully',
      order: {
        ...order,
        orderItems: order.orderItems.map(item => ({
          ...item,
          product: {
            ...item.product,
            images: JSON.parse(item.product.images)
          }
        }))
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
