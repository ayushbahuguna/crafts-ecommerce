import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { addressId, couponCode } = await request.json()

    if (!addressId) {
      return createErrorResponse('Shipping address is required', 400)
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.userId
      }
    })

    if (!address) {
      return createErrorResponse('Invalid shipping address', 400)
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.userId
      },
      include: {
        product: true
      }
    })

    if (cartItems.length === 0) {
      return createErrorResponse('Cart is empty', 400)
    }

    // Validate stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return createErrorResponse(`Insufficient stock for ${item.product.name}`, 400)
      }
      if (!item.product.isActive) {
        return createErrorResponse(`Product ${item.product.name} is no longer available`, 400)
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const shipping = subtotal > 500 ? 0 : 50 // Free shipping above ₹500
    const tax = subtotal * 0.18 // 18% GST
    let discount = 0
    let coupon = null

    // Apply coupon if provided
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() }
        }
      })

      if (!coupon) {
        return createErrorResponse('Invalid or expired coupon', 400)
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return createErrorResponse('Coupon usage limit exceeded', 400)
      }

      if (subtotal < coupon.minimumAmount) {
        return createErrorResponse(`Minimum order amount ₹${coupon.minimumAmount} required for this coupon`, 400)
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * coupon.discountValue) / 100
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount
        }
      } else {
        discount = coupon.discountValue
      }
    }

    const total = subtotal + shipping + tax - discount

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.userId,
          addressId,
          orderNumber,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          tax,
          shipping,
          discount,
          total,
          couponId: coupon?.id
        }
      })

      // Create order items
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            total: item.product.price * item.quantity
          }
        })

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // Update coupon usage count
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: {
              increment: 1
            }
          }
        })
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: {
          userId: user.userId
        }
      })

      return newOrder
    })

    // Initialize Razorpay order (you'll need to implement this based on your Razorpay setup)
    const razorpayOrder = {
      id: `razorpay_${order.id}`,
      amount: Math.round(total * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: order.orderNumber
    }

    return createResponse({
      order: {
        ...order,
        razorpayOrderId: razorpayOrder.id
      },
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    }, 201)

  } catch (error) {
    console.error('Checkout error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
