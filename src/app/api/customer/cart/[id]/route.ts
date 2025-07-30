import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return createErrorResponse('Valid quantity is required', 400)
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: user.userId
      },
      include: {
        product: true
      }
    })

    if (!cartItem) {
      return createErrorResponse('Cart item not found', 404)
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return createErrorResponse('Insufficient stock available', 400)
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
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

    return createResponse({
      ...updatedCartItem,
      product: {
        ...updatedCartItem.product,
        images: JSON.parse(updatedCartItem.product.images)
      }
    })
  } catch (error) {
    console.error('Cart item update error:', error)
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
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Verify cart item ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!cartItem) {
      return createErrorResponse('Cart item not found', 404)
    }

    await prisma.cartItem.delete({
      where: { id }
    })

    return createResponse({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Cart item deletion error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
