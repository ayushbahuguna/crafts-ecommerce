'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '../ProductForm';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const params = useParams();

  useEffect(() => {
    Promise.all([fetchProduct(), fetchCategories()]);
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProduct(data.data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
