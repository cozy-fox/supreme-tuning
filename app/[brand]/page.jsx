import { getBrands, getModels, getGroups, brandHasGroups } from '@/lib/data';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import { notFound, redirect } from 'next/navigation';
import BrandHero from './BrandHero';
import ModelSelector from '@/components/ModelSelector';

// Generate static params for all brands (SSG)
export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({
    brand: brand.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { brand: brandSlug } = await params;
  const brands = await getBrands();
  // Convert slug back to brand name (replace hyphens with spaces)
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) return {};

  return generateSeoMetadata({
    title: `${brand.name} Chiptuning`,
    description: `Professionele chiptuning voor ${brand.name}. Bekijk alle modellen en ontdek hoeveel extra vermogen uw ${brand.name} kan krijgen met Supreme Tuning.`,
    path: `/${brandSlug}`,
  });
}

export default async function BrandPage({ params }) {
  const { brand: brandSlug } = await params;
  const brands = await getBrands();
  // Convert slug back to brand name (replace hyphens with spaces)
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) {
    notFound();
  }

  // Check if brand has performance groups
  const hasPerformanceGroups = await brandHasGroups(brand.id);

  // If brand has performance groups, redirect to group selection page
  if (hasPerformanceGroups) {
    redirect(`/${brandSlug}/group`);
  }

  // For brands without performance groups, show model selector directly
  const groups = await getGroups(brand.id);
  const defaultGroupId = groups.length > 0 ? groups[0].id : null;

  // Fetch models for the default group
  const models = await getModels(brand.id, defaultGroupId);

  return (
    <main className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb" style={{ paddingTop: '10px' }}>
        <a href="/">Home</a>
        <span>›</span>
        <span className="current">{brand.name}</span>
      </nav>

      {/* Hero */}
      <BrandHero brandName={brand.name} />

      {/* Model Selector for brands without performance groups */}
      <ModelSelector brand={brand} models={models} />
    </main>
  );
}

