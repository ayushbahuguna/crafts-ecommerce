'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Button from '@/components/common/Button'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'

export default function CartPage() {
  const { items, summary, loading, updateQuantity, removeFromCart } = useCart()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50">
        <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Shopping Cart</h1>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart Items */}
          <section className="lg:col-span-8">
            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {items.map((item) => (
                <li key={item.id} className="flex py-6 px-4 bg-white">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <Image 
                      src={item.product.images[0] || '/images/placeholder.jpg'} 
                      alt={item.product.name} 
                      width={128}
                      height={128}
                      className="h-32 w-32 rounded-md object-cover"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="ml-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                        </h3>
                        <p className="ml-4 text-lg font-medium text-gray-900">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Price: ₹{item.product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 flex items-center space-x-1 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Order Summary */}
          <section className="mt-10 lg:mt-0 lg:col-span-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal ({summary.itemCount} items)</p>
                <p className="text-sm font-medium text-gray-900">₹{summary.subtotal.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Shipping</p>
                <p className="text-sm font-medium text-gray-900">Free</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-medium text-gray-900">Order total</p>
                <p className="text-base font-medium text-gray-900">₹{summary.subtotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/checkout">
                <Button fullWidth size="lg">Proceed to Checkout</Button>
              </Link>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              <Link href="/products" className="font-medium text-blue-600 hover:text-blue-500">
                Continue Shopping
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
