import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ShopD2C - Your Trusted E-commerce Platform",
  description: "Shop quality products across various categories with fast delivery and excellent customer service.",
  keywords: "ecommerce, online shopping, products, delivery",
  authors: [{ name: "ShopD2C" }],
  openGraph: {
    title: "ShopD2C - Your Trusted E-commerce Platform",
    description: "Shop quality products across various categories with fast delivery and excellent customer service.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
