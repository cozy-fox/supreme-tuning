'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
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
    <header className="app-header">
      <div className="header-container">
        <div></div> {/* Empty left side */}

        <div ref={dropdownRef} className="header-language-selector">
          <button
            onClick={() => setLangDropdown(!langDropdown)}
            className="language-selector-btn"
          >
            <Globe size={16} color="var(--primary)" />
            {langMounted && <span>{currentLang?.flag}</span>}
          </button>

          {langDropdown && (
            <div className="language-dropdown">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setLangDropdown(false); }}
                  className={`language-option ${language === lang.code ? 'active' : ''}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

