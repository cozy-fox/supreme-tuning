import { getBrands, getGroupById, getModels } from '@/lib/data';
import { generateMetadata as generateSeoMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import ModelSelector from '@/components/ModelSelector';
import ClientTranslation from '@/components/ClientTranslation';

// SEO Metadata
export async function generateMetadata({ params }) {
  const { brand: brandSlug, group: groupId } = await params;
  const brands = await getBrands();
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) {
    return {
      title: 'Brand Not Found',
    };
  }

  const group = await getGroupById(parseInt(groupId));

  return generateSeoMetadata({
    title: `${brand.name} ${group?.name || ''} - Select Model & Engine`,
    description: `Choose your ${brand.name} ${group?.name || ''} model, generation, and engine for chiptuning options.`,
    path: `/${brandSlug}/group/${groupId}`,
  });
}

export default async function GroupModelSelectionPage({ params }) {
  const { brand: brandSlug, group: groupId } = await params;
  const brands = await getBrands();
  const brandName = brandSlug.replace(/-/g, ' ');
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());

  if (!brand) {
    notFound();
  }

  // Fetch group details
  const group = await getGroupById(parseInt(groupId));
  
  if (!group) {
    notFound();
  }

  // Fetch models for this group
  const models = await getModels(brand.id, parseInt(groupId));

  return (
    <main className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Home</a>
        <span> › </span>
        <a href={`/${brandSlug}`}>{brand.name}</a>
        <span> › </span>
        <a href={`/${brandSlug}/group`}>Groups</a>
        <span> › </span>
        <span className="current">{group.displayName}</span>
      </nav>

      {/* Hero Section with Group Info */}
      <div className="hero-section">
        <h1 style={{ marginBottom: '12px' }}>
          {brand.name} {group.displayName}
        </h1>
        <ClientTranslation
          translationKey="selectModelGeneration"
          style={{
            color: 'var(--text-muted)',
            maxWidth: '700px',
            margin: '0 auto',
            display: 'block'
          }}
        />
      </div>

      {/* Model Selector */}
      <ModelSelector brand={brand} models={models} />
    </main>
  );
}

