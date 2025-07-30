'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Button from '@/components/common/Button'
import { User, MapPin, ShoppingBag } from 'lucide-react'

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

export default function AddressesPage() {
  const { user, token } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAddresses = async () => {
    if (!user) return
    try {
      setLoading(true)
      const response = await fetch('/api/customer/profile/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setAddresses(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [user, token])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await fetch(`/api/customer/profile/addresses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        fetchAddresses()
      } catch (error) {
        console.error('Failed to delete address:', error)
      }
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Addresses</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <nav className="space-y-2">
              <a href="/profile" className="text-gray-900 hover:bg-gray-50 flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <User className="h-5 w-5 mr-3" />
                Personal Information
              </a>
              <a href="/orders" className="text-gray-900 hover:bg-gray-50 flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <ShoppingBag className="h-5 w-5 mr-3" />
                Order History
              </a>
              <a href="/profile/addresses" className="bg-blue-50 text-blue-600 flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <MapPin className="h-5 w-5 mr-3" />
                Addresses
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Saved Addresses</h2>
                <Link href="/profile/addresses/new">
                  <Button size="sm">Add New Address</Button>
                </Link>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                {addresses.length > 0 ? (
                  addresses.map(address => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                      {address.isDefault && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                          Default
                        </span>
                      )}
                      <p className="font-semibold">{address.name}</p>
                      <p>{address.address}, {address.city}</p>
                      <p>{address.state} - {address.pincode}</p>
                      <p>Phone: {address.phone}</p>
                      <div className="mt-4 space-x-4">
                        <Link href={`/profile/addresses/edit/${address.id}`} className="text-sm text-blue-600 hover:text-blue-700">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(address.id)} className="text-sm text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>You have no saved addresses.</p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
