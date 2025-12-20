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
      {/* Group Cards Grid - Mobile-first responsive */}
      <div
        className="group-cards-grid">
        {sortedGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => handleGroupSelect(group)}
            className="group-card-btn"
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
            <div
              className="group-logo-container">
              {getGroupLogo(group)}
            </div>

            {/* Group Name */}
            <div className="group-card-text">
              <h2 className="group-card-title">
                {group.displayName}
              </h2>
              {group.description && (
                <p className="group-card-description">
                  {group.description}
                </p>
              )}
            </div>

            {/* Subtle accent line */}
            <div className="group-card-accent" />
          </button>
        ))}
      </div>
    </>
  );
}

