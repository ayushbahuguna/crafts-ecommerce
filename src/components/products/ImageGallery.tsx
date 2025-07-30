'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0] || '/images/placeholder.jpg')

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square relative rounded-lg bg-gray-100">
        <Image src="/images/placeholder.jpg" alt="Product placeholder" fill className="object-cover rounded-lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Main Image */}
      <div className="aspect-square relative rounded-lg bg-gray-100 overflow-hidden mb-4 shadow-lg">
        <Image 
          src={mainImage} 
          alt="Main product view" 
          fill 
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`aspect-square relative rounded-md cursor-pointer overflow-hidden border-2 transition-all ${
              mainImage === image ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setMainImage(image)}
          >
            <Image 
              src={image} 
              alt={`Product thumbnail ${index + 1}`} 
              fill 
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
