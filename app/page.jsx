import { getBrands } from '@/lib/data';
import Header from '@/components/Header';
import BrandCard from '@/components/BrandCard';
import { Zap } from 'lucide-react';

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
      <main className="container" style={{ padding: '40px 24px' }}>
        {/* Hero Section */}
        <div className="hero-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Zap size={32} color="#c9a227" />
            <h1>Chiptuning Calculator</h1>
          </div>
          <p style={{ color: '#8a8a8a', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Selecteer uw automerk om de tuning mogelijkheden te bekijken
          </p>
        </div>

        {/* Brand Grid */}
        <div className="grid-brands" style={{ marginTop: '40px' }}>
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </main>
    </>
  );
}

