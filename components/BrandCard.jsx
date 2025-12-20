'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function BrandCard({ brand }) {
  const [imgError, setImgError] = useState(false);

  // URL-safe brand name (replace spaces with hyphens)
  const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      href={`/${brandSlug}`}
      className="brand-card"
    >
      <div className="brand-card-content">
        {!imgError ? (
          <Image
            src={`/assets/brand_logo/${brand.name}.png`}
            alt={brand.name}
            width={90}
            height={90}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="brand-card-fallback">
            {brand.name.charAt(0)}
          </div>
        )}
        <p>{brand.name}</p>
      </div>
    </Link>
  );
}

