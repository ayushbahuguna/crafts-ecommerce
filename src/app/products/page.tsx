'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/products/ProductCard'
import ProductFilters from '@/components/products/ProductFilters'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ChevronDown } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  slug: string
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const query = new URLSearchParams()

      if (filters.category) query.append('category', filters.category)
      if (filters.minPrice) query.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) query.append('maxPrice', filters.maxPrice.toString())
      if (filters.search) query.append('search', filters.search)
      if (filters.sortBy) query.append('sortBy', filters.sortBy)
      if (filters.sortOrder) query.append('sortOrder', filters.sortOrder)
      
      try {
        const response = await fetch(`/api/public/products?${query.toString()}`)
        const data = await response.json()

        if (data.success) {
          setProducts(data.data.products)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/public/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-')
    setFilters({ ...filters, sortBy, sortOrder })
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Column */}
          <aside className="lg:col-span-1">
            <ProductFilters 
              categories={categories} 
              selectedCategory={filters.category}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Products Column */}
          <main className="lg:col-span-3 mt-8 lg:mt-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{products.length}</span> products
              </p>
              
              <div className="relative">
                <select
                  onChange={(e) => handleSortChange(e.target.value)}
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="createdAt-desc">Latest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="avgRating-desc">Rating: High to Low</option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                <p className="text-gray-600 mt-2">Try adjusting your filters.</p>
              </div>
            )}

            {/* Pagination would go here */}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
