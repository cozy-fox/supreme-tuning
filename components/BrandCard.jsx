'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function BrandCard({ brand }) {
  const [imgError, setImgError] = useState(false);

  // URL-safe brand name (replace spaces with hyphens)
  const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');

  // Check if logo is a data URL
  const isDataUrl = brand.logo && brand.logo.startsWith('data:');

  // Render logo image based on type
  const renderLogo = () => {
    if (!brand.logo || imgError) {
      return (
        <div className="brand-card-fallback">
          {brand.name.charAt(0)}
        </div>
      );
    }

    // For data URLs, use regular img tag to avoid hydration issues
    if (isDataUrl) {
      return (
        <img
          src={brand.logo}
          alt={brand.name}
          width={90}
          height={90}
          onError={() => setImgError(true)}
        />
      );
    }

    // For regular URLs, use Next.js Image
    return (
      <Image
        src={brand.logo}
        alt={brand.name}
        width={90}
        height={90}
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <Link
      href={`/${brandSlug}`}
      className="brand-card"
    >
      <div className="brand-card-content">
        {renderLogo()}
        <p>{brand.name}</p>
      </div>
    </Link>
  );
}

