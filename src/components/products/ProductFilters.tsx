'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface FilterProps {
  categories: Category[]
  selectedCategory?: string
  minPrice?: number
  maxPrice?: number
  onFilterChange: (filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
  }) => void
}

export default function ProductFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  onFilterChange
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '')
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '')

  useEffect(() => {
    setLocalMinPrice(minPrice?.toString() || '')
    setLocalMaxPrice(maxPrice?.toString() || '')
  }, [minPrice, maxPrice])

  const handleCategoryChange = (categorySlug: string) => {
    onFilterChange({
      category: categorySlug === selectedCategory ? undefined : categorySlug,
      minPrice,
      maxPrice
    })
  }

  const handlePriceFilter = () => {
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined
    
    onFilterChange({
      category: selectedCategory,
      minPrice: min,
      maxPrice: max
    })
  }

  const clearFilters = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    onFilterChange({})
  }

  const hasActiveFilters = selectedCategory || minPrice || maxPrice

  return (
    <div className="relative">
      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
      >
        <span>Filters</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'} lg:block
        absolute lg:relative top-full lg:top-0 left-0 right-0 z-10
        bg-white border border-gray-200 rounded-md shadow-lg lg:shadow-none lg:border-0 lg:bg-transparent
        p-4 lg:p-0 mt-2 lg:mt-0
      `}>
        <div className="space-y-6">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Active Filters</span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <X className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category.slug}
                    checked={selectedCategory === category.slug}
                    onChange={() => handleCategoryChange(category.slug)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handlePriceFilter}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Price Filter
              </button>
            </div>
          </div>

          {/* Quick Price Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h3>
            <div className="space-y-2">
              {[
                { label: 'Under ₹500', min: 0, max: 500 },
                { label: '₹500 - ₹1000', min: 500, max: 1000 },
                { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
                { label: 'Above ₹2000', min: 2000, max: undefined }
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => onFilterChange({
                    category: selectedCategory,
                    minPrice: range.min,
                    maxPrice: range.max
                  })}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    minPrice === range.min && maxPrice === range.max
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
