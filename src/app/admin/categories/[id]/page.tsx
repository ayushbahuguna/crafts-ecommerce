'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CategoryForm from '../CategoryForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/admin/categories/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setCategory(data.data);
        } else {
          setError(data.error || 'Failed to load category');
        }
      } catch {
        setError('An error occurred while fetching the category.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCategory();
    }
  }, [params, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (!category) {
    return <div>Category not found.</div>;
  }

  return <CategoryForm category={category} mode="edit" />;
}
