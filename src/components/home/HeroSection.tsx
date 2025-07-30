'use client'

import React from 'react'
import Link from 'next/link'
import Button from '@/components/common/Button'
import { ChevronRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-[500px] flex items-center justify-center text-center bg-cover bg-center rounded-lg shadow-lg"
             style={{ backgroundImage: "url('/images/hero-banner.jpg')" }}>
          <div className="absolute inset-0 bg-black opacity-40 rounded-lg"></div>
          <div className="relative z-10 text-white p-6">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
              Discover Your Style
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Explore our latest collection of premium products, curated just for you.
            </p>
            <Link href="/products">
              <Button size="lg" className="flex items-center space-x-2">
                <span>Shop Now</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
