'use client';

import { useLanguage } from './LanguageContext';

/**
 * Client component wrapper for translations in server components
 * Usage: <ClientTranslation translationKey="selectVariant" />
 */
export default function ClientTranslation({ translationKey, style, className, as: Component = 'p' }) {
  const { t } = useLanguage();
  
  return (
    <Component style={style} className={className}>
      {t(translationKey)}
    </Component>
  );
}

