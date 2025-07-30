import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return createResponse(categories)
  } catch (error) {
    console.error('Categories fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
