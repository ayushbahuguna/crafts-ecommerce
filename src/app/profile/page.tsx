'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Button from '@/components/common/Button'
import { User, MapPin, ShoppingBag } from 'lucide-react'

interface Profile {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
}

export default function ProfilePage() {
  const { user, token } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/customer/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setProfile(data.data)
          setFormData({
            name: data.data.name,
            phone: data.data.phone || ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, token])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <nav className="space-y-2">
              <a href="/profile" className="bg-blue-50 text-blue-600 flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <User className="h-5 w-5 mr-3" />
                Personal Information
              </a>
              <a href="/orders" className="text-gray-900 hover:bg-gray-50 flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <ShoppingBag className="h-5 w-5 mr-3" />
                Order History
              </a>
              <a href="/profile/addresses" className="text-gray-900 hover:bg-gray-50 flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <MapPin className="h-5 w-5 mr-3" />
                Addresses
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              </div>
              
              <div className="px-6 py-4">
                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{profile?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="mt-1 text-sm text-gray-900">{profile?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Since</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
