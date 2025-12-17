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
      style={{
        position: 'fixed',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setLangDropdown(!langDropdown)}
        className="btn-icon language-selector-btn"
        style={{
          background: 'var(--chrome-gradient)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.3s ease',
          color: 'var(--text-main)',
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <Globe size={18} color="var(--primary)" />
        {langMounted && <span style={{ fontSize: '1.1rem' }}>{currentLang?.flag}</span>}
      </button>
      {langDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
          minWidth: '180px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 1001,
        }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => { changeLanguage(lang.code); setLangDropdown(false); }}
              style={{
                width: '100%',
                padding: '14px 18px',
                border: 'none',
                background: language === lang.code ? 'var(--bg-hover)' : 'transparent',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.target.style.background = language === lang.code ? 'var(--bg-hover)' : 'transparent'}
            >
              <span style={{ fontSize: '1.3rem' }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

