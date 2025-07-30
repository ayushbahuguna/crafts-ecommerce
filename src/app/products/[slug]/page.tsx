'use client'

import React, { useState, useEffect } from 'react'
import ImageGallery from '@/components/products/ImageGallery'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Button from '@/components/common/Button'
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  stock: number
  avgRating: number
  reviewCount: number
  category: {
    name: string
    slug: string
  }
  reviews: {
    id: string
    rating: number
    comment?: string
    createdAt: string
    user: {
      name: string
    }
  }[]
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/public/products/${resolvedParams.slug}`)
        const data = await response.json()
        if (data.success) {
          setProduct(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [])

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    if (!product) return

    try {
      setIsAddingToCart(true)
      await addToCart(product.id, quantity)
      // Optionally, show success toast
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Product not found</div>
  }

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <ImageGallery images={product.images} />

          {/* Product Info */}
          <div className="mt-10 lg:mt-0">
            {/* Category */}
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{product.category.name}</h2>
            
            {/* Product Name */}
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-2">{product.name}</h1>

            {/* Price & Rating */}
            <div className="mt-3">
              <div className="flex items-center">
                {/* Rating */}
                <div className="flex items-center">
                  <p className="text-3xl text-gray-900">₹{product.price.toLocaleString()}</p>
                  <div className="ml-4 flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(product.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-500">({product.reviewCount} reviews)</p>
                  </div>
                </div>
              </div>
              {/* Compare Price */}
              {product.comparePrice && (
                <p className="mt-1 text-lg text-gray-500 line-through">₹{product.comparePrice.toLocaleString()}</p>
              )}
              {discountPercentage > 0 && (
                <p className="mt-1 text-sm font-medium text-green-600">Save {discountPercentage}%</p>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 space-y-6 text-base text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />

            {/* Stock and Quantity */}
            <div className="mt-6">
              {product.stock > 0 ? (
                <p className="text-sm text-green-600 font-medium">In stock ({product.stock} available)</p>
              ) : (
                <p className="text-sm text-red-600 font-medium">Out of stock</p>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mt-6">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mb-4">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-900">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input 
                      type="number"
                      id="quantity"
                      name="quantity"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-12 text-center border-l border-r border-gray-300 focus:outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleAddToCart}
                  loading={isAddingToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            )}

            {/* More info here (SKU, etc) */}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          {product.reviews.length > 0 ? (
            <div className="mt-6 space-y-8">
              {product.reviews.map(review => (
                <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="ml-3 text-sm font-medium text-gray-900">{review.user.name}</p>
                    <p className="ml-auto text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-600">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  )
}
