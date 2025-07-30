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
    const category = searchParams.get('category')

    const skip = (page - 1) * limit

    const where: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        sku?: { contains: string; mode: 'insensitive' };
      }>;
      categoryId?: string;
    } = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.categoryId = category
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: JSON.parse(product.images)
    }))

    return createResponse({
      products: productsWithParsedImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin products fetch error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
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

    // Check if product with same slug or SKU exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { sku }
        ]
      }
    })

    if (existingProduct) {
      return createErrorResponse('Product with this slug or SKU already exists', 409)
    }

    const product = await prisma.product.create({
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
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
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
    }, 201)
  } catch (error) {
    console.error('Product creation error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
