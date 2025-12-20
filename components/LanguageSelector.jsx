'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSelector() {
  const { language, changeLanguage, mounted: langMounted, languages } = useLanguage();
  const [langDropdown, setLangDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === language);

  return (
    <div
      ref={dropdownRef}
      className="language-selector-wrapper"
    >
      <div className="language-selector-inner">
        <button
          onClick={() => setLangDropdown(!langDropdown)}
          className="btn-icon language-selector-btn"
        >
          <Globe size={16} color="var(--primary)" />
          {langMounted && <span>{currentLang?.flag}</span>}
        </button>
      </div>
      {langDropdown && (
        <div className="language-selector-dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => { changeLanguage(lang.code); setLangDropdown(false); }}
              className={`language-selector-item ${language === lang.code ? 'active' : ''}`}
            >
              <span className="flag">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

