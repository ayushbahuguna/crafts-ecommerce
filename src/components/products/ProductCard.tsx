'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/common/Button'

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

interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/login'
      return
    }

    try {
      setIsAddingToCart(true)
      await addToCart(product.id, 1)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add item to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0] || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            />
          </button>

          {/* Discount badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}

          {/* Stock status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
          
          {/* Product name */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.avgRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          {showAddToCart && product.stock > 0 && (
            <Button
              onClick={handleAddToCart}
              fullWidth
              size="sm"
              loading={isAddingToCart}
              className="flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </Button>
          )}
        </div>
      </Link>
    </div>
  )
}
