import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!product) {
      return createErrorResponse('Product not found', 404)
    }

    return createResponse({
      ...product,
      images: JSON.parse(product.images)
    })
  } catch (error) {
    console.error('Product fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    const data = await request.json()
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      sku,
      stock,
      images,
      categoryId,
      isActive,
      isFeatured,
      weight,
      dimensions,
      metaTitle,
      metaDescription
    } = data

    // Check if another product with same slug or SKU exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { slug },
              { sku }
            ]
          }
        ]
      }
    })

    if (existingProduct) {
      return createErrorResponse('Another product with this slug or SKU already exists', 409)
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku,
        stock: parseInt(stock),
        images: JSON.stringify(images),
        categoryId,
        isActive,
        isFeatured,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        metaTitle,
        metaDescription
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    return createResponse({
      ...product,
      images: JSON.parse(product.images)
    })
  } catch (error) {
    console.error('Product update error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    await prisma.product.delete({
      where: { id: params.id }
    })

    return createResponse({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Product deletion error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
