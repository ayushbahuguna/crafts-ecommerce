import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: {
      name?: {
        contains: string;
        mode: 'insensitive';
      };
    } = {}

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.category.count({ where })
    ])

    return createResponse({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return createErrorResponse('Unauthorized', 401)
    }

    const { name, slug, description, image, isActive } = await request.json()

    if (!name || !slug) {
      return createErrorResponse('Name and slug are required', 400)
    }

    // Check if category with same slug exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return createErrorResponse('Category with this slug already exists', 409)
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive: isActive ?? true
      }
    })

    return createResponse(category, 201)
  } catch (error) {
    console.error('Category creation error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
