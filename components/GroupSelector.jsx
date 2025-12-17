'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function GroupSelector({ brand, groups }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [imgErrors, setImgErrors] = useState({});

  // Sort groups: Standard first, then performance groups
  const sortedGroups = [...groups].sort((a, b) => {
    // Standard (non-performance) groups come first
    if (!a.isPerformance && b.isPerformance) return -1;
    if (a.isPerformance && !b.isPerformance) return 1;
    // Otherwise maintain original order
    return (a.order || 0) - (b.order || 0);
  });

  const handleGroupSelect = (group) => {
    // Navigate to the group-specific page for model/type/engine selection
    const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/${brandSlug}/group/${group.id}`);
  };

  const handleImageError = (groupId) => {
    setImgErrors(prev => ({ ...prev, [groupId]: true }));
  };

  // Get the appropriate logo for each group
  const getGroupLogo = (group) => {

    const hasError = imgErrors[group.id];

    if (!hasError && group.logo) {
      return (
        <Image
          src={`${group.logo}`}
          alt={group.name}
          width={240}
          height={140}
          style={{
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
          }}
          onError={() => handleImageError(group.id)}
        />
      );
    }

    // Fallback to default logo
    return (
      <Image
        src="/assets/brand_logo/default-group.svg"
        alt={group.name}
        width={240}
        height={140}
        style={{
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
        }}
      />
    );
  };

  return (
    // <div style={{
    //   maxWidth: '1200px',
    //   margin: '0 auto',
    //   padding: '0 20px'
    // }}>
    <>
      {/* Group Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '40px',
        padding: '20px 0'
      }}>
        {sortedGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => handleGroupSelect(group)}
            style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-hover) 100%)',
              border: '2px solid var(--border)',
              borderRadius: '16px',
              padding: '60px 40px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '30px',
              minHeight: '400px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Logo */}
            <div style={{
              width: '100%',
              maxWidth: '280px',
              height: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              overflow: 'hidden'
            }}>
              {getGroupLogo(group)}
            </div>

            {/* Group Name */}
            <div style={{
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                marginBottom: '12px',
                letterSpacing: '0.5px'
              }}>
                {group.displayName }
              </h2>
              {group.description && (
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                  fontWeight: '300'
                }}>
                  {group.description}
                </p>
              )}
            </div>

            {/* Subtle accent line */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)'
            }} />
          </button>
        ))}
      </div>
    </>
  );
}

