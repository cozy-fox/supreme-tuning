import { getBrands } from '@/lib/data';
import Header from '@/components/Header';
import BrandCard from '@/components/BrandCard';
import HeroSection from '@/components/HeroSection';

export const metadata = {
  title: 'Chiptuning Calculator | Supreme Tuning',
  description: 'Bereken direct hoeveel vermogen uw auto kan winnen met professionele chiptuning. Selecteer uw merk en ontdek de mogelijkheden.',
  openGraph: {
    title: 'Chiptuning Calculator | Supreme Tuning',
    description: 'Bereken direct hoeveel vermogen uw auto kan winnen met professionele chiptuning.',
  },
};

export default async function HomePage() {
  const brands = await getBrands();

  return (
    <>
      <Header />
      <main className="container">
        <HeroSection />

        {/* Brand Grid */}
        <div className="grid-brands">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </main>
    </>
  );
}

