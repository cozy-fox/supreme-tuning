'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Shield, LogOut, Home, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();
  const { language, changeLanguage, t, mounted: langMounted, languages } = useLanguage();
  const [langDropdown, setLangDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isHomePage = pathname === '/';
  const isAdminPage = pathname?.startsWith('/admin');

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
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
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
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--text-main) 50%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '2px',
            }}>
              SUPREME
            </h1>
            <p style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              margin: 0,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              {t('tuningCalculator')}
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'var(--chrome-gradient)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {themeMounted && (theme === 'dark' ? <Sun size={18} color="var(--primary)" /> : <Moon size={18} color="var(--primary)" />)}
          </button>

          {/* Language Selector */}
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
              {t('home')}
            </Link>
          )}

          {isAdmin ? (
            <>
              {!isAdminPage && (
                <Link
                  href="/admin"
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <Shield size={16} />
                  {t('admin')}
                </Link>
              )}
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <Shield size={16} />
              {t('login')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

