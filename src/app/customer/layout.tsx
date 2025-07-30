'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  LogOut 
} from 'lucide-react';

const sidebarItems = [
  { href: '/customer/profile', icon: User, label: 'Profile' },
  { href: '/customer/addresses', icon: MapPin, label: 'Addresses' },
  { href: '/customer/orders', icon: ShoppingBag, label: 'Orders' },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
