'use client';

/**
 * Professional Brand Logos - High Quality SVG
 * Accurate representations of official brand logos
 */

// BMW Standard Logo - Monochrome professional design
export function BMWLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bmwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A0A0A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#bmwGrad)" strokeWidth="3"/>

      {/* Inner circle border */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#bmwGrad)" strokeWidth="2"/>

      {/* Four quadrants - monochrome */}
      <path d="M 50 10 A 40 40 0 0 1 90 50 L 50 50 Z" fill="rgba(192, 192, 192, 0.3)"/>
      <path d="M 90 50 A 40 40 0 0 1 50 90 L 50 50 Z" fill="rgba(232, 232, 232, 0.5)"/>
      <path d="M 50 90 A 40 40 0 0 1 10 50 L 50 50 Z" fill="rgba(192, 192, 192, 0.3)"/>
      <path d="M 10 50 A 40 40 0 0 1 50 10 L 50 50 Z" fill="rgba(232, 232, 232, 0.5)"/>

      {/* Center circle */}
      <circle cx="50" cy="50" r="8" fill="url(#bmwGrad)"/>

      {/* BMW Text */}
      <text
        x="50"
        y="55"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fontWeight="700"
        fill="url(#bmwGrad)"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        BMW
      </text>
    </svg>
  );
}

// BMW M Logo - Official M design with colored stripes
export function BMWMLogo({ size = 80 }) {
  return (
    <svg width={size * 2.5} height={size * 0.8} viewBox="0 0 250 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Three colored stripes (blue, purple/violet, red) */}
      <path d="M 0 0 L 60 0 L 80 80 L 20 80 Z" fill="#1C69D4" />
      <path d="M 60 0 L 120 0 L 100 80 L 40 80 Z" fill="#7C3F98" />
      <path d="M 120 0 L 180 0 L 160 80 L 100 80 Z" fill="#E4002B" />

      {/* Large black M */}
      <text
        x="200"
        y="55"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="70"
        fontWeight="900"
        fill="#000000"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="-2"
      >
        M
      </text>
    </svg>
  );
}

// Audi Standard Logo - Four interlocking rings (monochrome professional)
export function AudiLogo({ size = 80 }) {
  return (
    <svg width={size * 2.2} height={size * 0.7} viewBox="0 0 220 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="audiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A0A0A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Four interlocking rings with gradient */}
      <circle cx="35" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
      <circle cx="80" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
      <circle cx="125" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
      <circle cx="170" cy="35" r="28" fill="none" stroke="url(#audiGrad)" strokeWidth="6"/>
    </svg>
  );
}

// Audi RS Logo - Official RS design with red outline
export function AudiRSLogo({ size = 80 }) {
  return (
    <svg width={size * 2} height={size * 0.9} viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Red outline/border effect */}
      <path d="M 10 10 L 60 10 L 60 80 L 10 80 Z" fill="none" stroke="#E4002B" strokeWidth="8" />

      {/* Black RS text */}
      <text
        x="100"
        y="60"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="65"
        fontWeight="900"
        fill="#000000"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="2"
      >
        RS
      </text>
    </svg>
  );
}

// Mercedes-Benz Standard Logo - Three-pointed star (professional monochrome)
export function MercedesLogo({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#E8E8E8', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#C0C0C0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A0A0A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#mbGrad)" strokeWidth="3"/>

      {/* Three-pointed star */}
      <path
        d="M 50 10 L 50 50 M 50 50 L 15 75 M 50 50 L 85 75"
        stroke="url(#mbGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Inner circle */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#mbGrad)" strokeWidth="2"/>
    </svg>
  );
}

// Mercedes-AMG Logo - Official AMG design with stripes
export function MercedesAMGLogo({ size = 80 }) {
  return (
    <svg width={size * 2.5} height={size * 0.8} viewBox="0 0 250 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Five black stripes */}
      <rect x="0" y="0" width="12" height="80" fill="#000000" />
      <rect x="16" y="0" width="12" height="80" fill="#000000" />
      <rect x="32" y="0" width="12" height="80" fill="#000000" />
      <rect x="48" y="0" width="12" height="80" fill="#000000" />
      <rect x="64" y="0" width="12" height="80" fill="#000000" />

      {/* Black AMG text */}
      <text
        x="150"
        y="55"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="60"
        fontWeight="900"
        fill="#000000"
        textAnchor="middle"
        dominantBaseline="middle"
        letterSpacing="4"
      >
        AMG
      </text>
    </svg>
  );
}

