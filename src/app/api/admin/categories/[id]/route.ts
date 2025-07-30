import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!category) {
      return createErrorResponse('Category not found', 404)
    }

    return createResponse(category)
  } catch (error) {
    console.error('Category fetch error:', error)
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

    const { name, slug, description, image, isActive } = await request.json()

    if (!name || !slug) {
      return createErrorResponse('Name and slug are required', 400)
    }

    // Check if another category with same slug exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          { slug }
        ]
      }
    })

    if (existingCategory) {
      return createErrorResponse('Another category with this slug already exists', 409)
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        image,
        isActive
      }
    })

    return createResponse(category)
  } catch (error) {
    console.error('Category update error:', error)
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

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: params.id }
    })

    if (productsCount > 0) {
      return createErrorResponse('Cannot delete category with existing products', 400)
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return createResponse({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Category deletion error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
