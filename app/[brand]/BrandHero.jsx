'use client';

import { useLanguage } from '@/components/LanguageContext';

export default function BrandHero({ brandName, hasGroups }) {
  const { t } = useLanguage();

  return (
    <div className="hero-section">
      <h1>{brandName} Chiptuning</h1>
      <p className="hero-subtitle">
        {hasGroups ? t('selectGroupFirst') : t('selectModelGeneration')}
      </p>
    </div>
  );
}

