'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import { Plus } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch('/api/customer/profile/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await fetch(`/api/customer/profile/addresses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAddresses();
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>
        <Link href="/customer/addresses/new">
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map(address => (
            <div key={address.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {address.isDefault && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
                      Default Address
                    </span>
                  )}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{address.name}</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>{address.address}</p>
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    <p>Phone: {address.phone}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Link href={`/customer/addresses/edit/${address.id}`}>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      Edit
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleDelete(address.id)} 
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
            <Link href="/customer/addresses/new">
              <Button>Add New Address</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
