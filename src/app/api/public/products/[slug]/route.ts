import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          where: {
            isApproved: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!product) {
      return createErrorResponse('Product not found', 404)
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

    const productData = {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
      images: JSON.parse(product.images)
    }

    return createResponse(productData)
  } catch (error) {
    console.error('Product fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
