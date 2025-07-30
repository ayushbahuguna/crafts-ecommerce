'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ChevronRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string[]
  avgRating: number
  reviewCount: number
  stock: number
  isActive: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/public/products?featured=true&limit=8')
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.data.products)
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600 mt-2">Handpicked favorites just for you</p>
          </div>
          <Link 
            href="/products?featured=true"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
