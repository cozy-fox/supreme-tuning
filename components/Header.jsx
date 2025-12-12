'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { language, changeLanguage, t, mounted: langMounted, languages } = useLanguage();
  const [langDropdown, setLangDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isHomePage = pathname === '/';

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
    <header style={{
      padding: '10px 20px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}>
          <Image
            src="/assets/logo.png"
            alt="Supreme Tuning"
            width={50}
            height={50}
            style={{ objectFit: 'contain' }}
          />
          <div>
            <h1 style={{
              fontSize: '1.4rem',
              margin: 0,
              background: 'linear-gradient(135deg, #d0d8e0 0%, #ffffff 50%, #d0d8e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '2px',
              filter: 'drop-shadow(0 2px 4px rgba(184, 192, 200, 0.3))',
            }}>
              SUPREME
            </h1>
            <p style={{
              fontSize: '0.65rem',
              color: '#b8c0c8',
              margin: 0,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              {t('tuningCalculator')}
            </p>
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="btn-icon"
              style={{
                background: 'var(--chrome-gradient)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
              }}
            >
              <Globe size={16} color="var(--primary)" />
              {langMounted && currentLang?.flag}
            </button>
            {langDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                minWidth: '160px',
                boxShadow: 'var(--shadow)',
                zIndex: 1000,
              }}>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { changeLanguage(lang.code); setLangDropdown(false); }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: language === lang.code ? 'var(--bg-hover)' : 'transparent',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.target.style.background = language === lang.code ? 'var(--bg-hover)' : 'transparent'}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isHomePage && (
            <Link
              href="/"
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <Home size={16} />
              <span className="btn-text">{t('home')}</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

