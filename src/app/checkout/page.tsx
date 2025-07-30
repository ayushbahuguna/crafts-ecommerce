'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Button from '@/components/common/Button'
import Script from 'next/script'

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  notes: {
    address: string
  }
  theme: {
    color: string
  }
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void
    }
  }
}

export default function CheckoutPage() {
  const { user, token } = useAuth()
  const { items, summary, clearCart } = useCart()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/customer/profile/addresses', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setAddresses(data.data)
          const defaultAddress = data.data.find((addr: Address) => addr.isDefault)
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id)
          }
        }
      } catch {
        setError('Failed to load addresses')
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [user, token, router])

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address')
      return
    }

    try {
      const response = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addressId: selectedAddress })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order')
      }

      const { order, razorpayOrder, razorpayKeyId } = data.data

      const options: RazorpayOptions = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'ShopD2C',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verificationResponse = await fetch('/api/customer/checkout/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id
              })
            })

            const verificationData = await verificationResponse.json()

            if (verificationData.success) {
              clearCart()
              router.push(`/order-confirmation/${order.id}`)
            } else {
              setError(verificationData.error || 'Payment verification failed')
            }
          } catch {
            setError('An error occurred during payment verification.')
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          address: 'N/A'
        },
        theme: {
          color: '#3B82F6'
        }
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while placing the order.'
      setError(errorMessage)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="bg-gray-50 py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
            {addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map(address => (
                  <div 
                    key={address.id}
                    onClick={() => setSelectedAddress(address.id)}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedAddress === address.id 
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}>
                    <p className="font-semibold">{address.name}</p>
                    <p>{address.address}, {address.city}</p>
                    <p>{address.state} - {address.pincode}</p>
                    <p>Phone: {address.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No addresses found. Please add an address in your profile.</p>
            )}
            <Link href="/profile/addresses/new" className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block">
              + Add new address
            </Link>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="divide-y divide-gray-200">
              {items.map(item => (
                <div key={item.id} className="flex justify-between py-3">
                  <div className="flex items-center space-x-4">
                    <Image 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      width={48} 
                      height={48} 
                      className="rounded-md"
                    />
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p>₹{summary.subtotal.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>₹{summary.subtotal.toLocaleString()}</p>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <Button 
              fullWidth 
              size="lg" 
              className="mt-6" 
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || items.length === 0}
            >
              Place Order & Pay
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

