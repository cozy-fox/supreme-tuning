'use client';

import { Zap } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="hero-section">
      <div className="hero-title-container">
        <img src="/assets/logo.png" alt="Supreme Tuning Logo" width={50} />
        {/* <Zap size={40} color="var(--primary)" /> */}
        <h1>{t('chiptuningCalculator')}</h1>
      </div>
      <p className="hero-subtitle">
        {t('selectBrand')}
      </p>
    </div>
  );
}

