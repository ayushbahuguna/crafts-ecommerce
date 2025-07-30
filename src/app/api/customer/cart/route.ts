import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.userId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse images and calculate totals
    const cartWithParsedImages = cartItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images)
      }
    }))

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity)
    }, 0)

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return createResponse({
      items: cartWithParsedImages,
      summary: {
        subtotal,
        totalItems,
        itemCount: cartItems.length
      }
    })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity < 1) {
      return createErrorResponse('Valid product ID and quantity are required', 400)
    }

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true
      }
    })

    if (!product) {
      return createErrorResponse('Product not found or inactive', 404)
    }

    // Check stock availability
    if (product.stock < quantity) {
      return createErrorResponse('Insufficient stock available', 400)
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.userId,
          productId
        }
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update existing cart item
      const newQuantity = existingCartItem.quantity + quantity
      
      if (product.stock < newQuantity) {
        return createErrorResponse('Insufficient stock available', 400)
      }

      cartItem = await prisma.cartItem.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: newQuantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              comparePrice: true,
              images: true,
              stock: true
            }
          }
        }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.userId,
          productId,
          quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              comparePrice: true,
              images: true,
              stock: true
            }
          }
        }
      })
    }

    return createResponse({
      ...cartItem,
      product: {
        ...cartItem.product,
        images: JSON.parse(cartItem.product.images)
      }
    }, 201)
  } catch (error) {
    console.error('Add to cart error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
