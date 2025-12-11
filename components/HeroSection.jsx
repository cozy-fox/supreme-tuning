'use client';

import { Zap } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="hero-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
        <Zap size={40} color="var(--primary)" />
        <h1>{t('chiptuningCalculator')}</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>
        {t('selectBrand')}
      </p>
    </div>
  );
}

