import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BusinessCTA } from '@/components/home/BusinessCTA';
import { AboutPreview } from '@/components/home/AboutPreview';
import { ContactPreview } from '@/components/home/ContactPreview';
import { getCachedProducts } from '@/lib/productsCache';

export const revalidate = 60;

export default async function HomePage() {
  const products = await getCachedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1 — HERO */}
      <HeroSection />

      {/* SECTION 2 — PRODUCT CATEGORIES */}
      <CategorySection />

      {/* SECTION 3 — WHY CHOOSE MEHAK */}
      <WhyChooseUs />

      {/* SECTION 4 — FEATURED PRODUCT AREA ("Built for Modern Bathrooms") */}
      <FeaturedProducts initialProducts={products} />

      {/* SECTION 5 — BUSINESS CTA */}
      <BusinessCTA />

      {/* SECTION 6 — ABOUT PREVIEW */}
      <AboutPreview />

      {/* SECTION 7 — CONTACT PREVIEW */}
      <ContactPreview />
    </div>
  );
}
