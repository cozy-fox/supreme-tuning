import { getBrands, getGroups, brandHasGroups } from '@/lib/data';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import { notFound, redirect } from 'next/navigation';
import GroupSelector from '@/components/GroupSelector';
import ClientTranslation from '@/components/ClientTranslation';

// Use dynamic rendering to always fetch fresh data from MongoDB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate static params for all brands (SSG)
export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({
    brand: brand.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

// SEO Metadata
export async function generateMetadata({ params }) {
  const { brand: brandSlug } = await params;
  const brands = await getBrands();
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) {
    return {
      title: 'Brand Not Found',
    };
  }

  return generateSeoMetadata({
    title: `${brand.name} Performance Groups - Select Your Category`,
    description: `Choose between ${brand.name} standard models or performance variants for chiptuning options.`,
    path: `/${brandSlug}/group`,
  });
}

export default async function GroupSelectionPage({ params }) {
  const { brand: brandSlug } = await params;
  const brands = await getBrands();
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) {
    notFound();
  }

  // Fetch groups first (single DB call instead of two)
  const groups = await getGroups(brand.id);

  // Check if brand has groups based on fetched data
  const hasPerformanceGroups = groups.length > 1 || (groups.length === 1 && groups[0].isPerformance);

  // If no performance groups, redirect back to brand page
  if (!hasPerformanceGroups) {
    redirect(`/${brandSlug}`);
  }

  // Serialize groups for client component
  const serializedGroups = groups.map(group => ({
    id: group.id,
    name: group.name,
    displayName: group.displayName || group.name,
    description: group.description || '',
    tagline: group.tagline || null,
    color: group.color || null,
    icon: group.icon || null,
    logo: group.logo || null,
    isPerformance: group.isPerformance || false,
    order: group.order || 0,
  }));

  return (
    <main className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Home</a>
        <span> › </span>
        <a href={`/${brandSlug}`}>{brand.name}</a>
        <span> › </span>
        <span className="current">Select Group</span>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>{brand.name}</h1>
        <ClientTranslation
          translationKey="selectVariant"
          style={{
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto',
            display: 'block'
          }}
        />
      </div>

      {/* Group Selector */}
      <GroupSelector brand={brand} groups={serializedGroups} />
    </main>
  );
}

