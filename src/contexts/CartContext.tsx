'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number
    images: string[]
    stock: number
    isActive: boolean
  }
}

interface CartSummary {
  subtotal: number
  totalItems: number
  itemCount: number
}

interface CartContextType {
  items: CartItem[]
  summary: CartSummary
  loading: boolean
  addToCart: (productId: string, quantity: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  refreshCart: () => Promise<void>
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary>({ subtotal: 0, totalItems: 0, itemCount: 0 })
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()

  const fetchCart = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch('/api/customer/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.data.items)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && token) {
      fetchCart()
    } else {
      setItems([])
      setSummary({ subtotal: 0, totalItems: 0, itemCount: 0 })
    }
  }, [user, token])

  const addToCart = async (productId: string, quantity: number) => {
    if (!token) throw new Error('Please login to add items to cart')

    try {
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to cart')
      }

      await fetchCart() // Refresh cart after adding
    } catch (error) {
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!token) return

    try {
      const response = await fetch(`/api/customer/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      })

      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error('Failed to update cart item:', error)
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/customer/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error('Failed to remove cart item:', error)
    }
  }

  const refreshCart = async () => {
    await fetchCart()
  }

  const clearCart = () => {
    setItems([])
    setSummary({ subtotal: 0, totalItems: 0, itemCount: 0 })
  }

  return (
    <CartContext.Provider value={{
      items,
      summary,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
