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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
      }}>
        {/* <span className="language-selector-label" style={{
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: '600',
          opacity: 0.8,
        }}>
          {language === 'nl' ? 'Taal' : language === 'en' ? 'Language' : language === 'de' ? 'Sprache' : 'Langue'}
        </span> */}
        <button
          onClick={() => setLangDropdown(!langDropdown)}
          className="btn-icon language-selector-btn"
          style={{
            background: 'var(--chrome-gradient)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            color: 'var(--text-main)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Globe size={16} color="var(--primary)" />
          {langMounted && <span>{currentLang?.flag}</span>}
        </button>
      </div>
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

