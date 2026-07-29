import React from 'react';
import styles from './MicrosoftLogo.module.css';

/**
 * The Microsoft corporate logo: the four-square mark plus the wordmark, as one
 * lockup. It owns its own proportions so a consumer cannot mis-scale the two
 * halves relative to each other.
 *
 * Proportions are taken from the official asset (≈4.7:1 overall): the wordmark's
 * cap height is ~0.6 of the mark's height, and the gap between mark and
 * wordmark is ~0.28 of the mark's width.
 *
 * Brand colours are literals, never theme tokens — the mark must not shift
 * between light and dark mode. The wordmark does: Microsoft's brand guidance
 * uses the grey wordmark on light backgrounds and white on dark.
 */
export default function MicrosoftLogo({ size = 20, as: As = 'span', ...rest }) {
  return (
    <As className={styles.lockup} style={{ '--ms-mark': `${size}px` }} {...rest}>
      <svg
        className={styles.mark}
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        {/* 48-unit squares with a 4-unit gutter, matching the asset's ~7% gap. */}
        <rect x="0" y="0" width="48" height="48" fill="#F25022" />
        <rect x="52" y="0" width="48" height="48" fill="#7FBA00" />
        <rect x="0" y="52" width="48" height="48" fill="#00A4EF" />
        <rect x="52" y="52" width="48" height="48" fill="#FFB900" />
      </svg>
      <span className={styles.wordmark}>Microsoft</span>
    </As>
  );
}
