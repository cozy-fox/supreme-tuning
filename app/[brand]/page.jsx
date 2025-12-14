import { getBrands, getModels, getBrandByName } from '@/lib/data';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import BrandSelector from './BrandSelector';
import { getBrandGroupConfig, brandHasGroups } from '@/lib/brandGroups';

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

/**
 * Get brand groups configuration (serialized for client)
 */
function getBrandGroupsForClient(brandId) {
  if (!brandHasGroups(brandId)) {
    return { hasGroups: false, groups: [] };
  }

  const config = getBrandGroupConfig(brandId);
  // Serialize groups (remove filter functions which can't be passed to client)
  const serializedGroups = config.groups.map(group => ({
    id: group.id,
    name: group.name,
    displayName: group.displayName,
    description: group.description,
    logo: group.logo,
  }));

  return {
    hasGroups: true,
    brandName: config.brandName,
    groups: serializedGroups,
  };
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

  const models = await getModels(brand.id);
  const brandGroups = getBrandGroupsForClient(brand.id);

  return (
    <main className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb" style={{ paddingTop: '10px' }}>
        <a href="/">Home</a>
        <span>›</span>
        <span className="current">{brand.name}</span>
      </nav>

      {/* Hero */}
      <div className="hero-section" style={{ padding: '20px 0 15px' }}>
        <h1>{brand.name} Chiptuning</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          {brandGroups.hasGroups
            ? 'Selecteer eerst een categorie, dan uw model, generatie en motor'
            : 'Selecteer uw model, generatie en motor om de tuning mogelijkheden te bekijken'
          }
        </p>
      </div>

      {/* Client-side selector component */}
      <BrandSelector
        brand={brand}
        models={models}
        brandGroups={brandGroups}
      />
    </main>
  );
}

