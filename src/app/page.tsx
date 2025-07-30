import HeroSection from "@/components/home/HeroSection"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import CategoriesShowcase from "@/components/home/CategoriesShowcase"

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesShowcase />
    </div>
  )
}
