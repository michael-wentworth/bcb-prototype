import React from 'react';

/**
 * The Microsoft four-square logo. Brand colours are fixed by definition, so
 * they are literals here rather than theme tokens — they must not shift between
 * light and dark mode.
 */
export default function MicrosoftLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
