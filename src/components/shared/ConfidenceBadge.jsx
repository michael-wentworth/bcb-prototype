import React from 'react';
import { Tooltip } from '@fluentui/react-components';
import {
  CheckmarkCircle20Filled,
  Circle16Regular,
  Info16Regular,
  Warning20Filled,
} from '@fluentui/react-icons';
import styles from './ConfidenceBadge.module.css';

const LEVELS = {
  high: { label: 'High', tone: 'high' },
  medium: { label: 'Medium', tone: 'medium' },
  low: { label: 'Low', tone: 'low' },
  confirmed: { label: 'Confirmed by you', tone: 'confirmed' },
};

/**
 * Confidence is always rendered as icon + word, never colour alone — the badge
 * has to survive greyscale and colour-vision deficiency.
 */
export default function ConfidenceBadge({ level = 'medium', basis, compact = false }) {
  const meta = LEVELS[level] || LEVELS.medium;

  const Icon =
    meta.tone === 'confirmed'
      ? CheckmarkCircle20Filled
      : meta.tone === 'low'
        ? Warning20Filled
        : meta.tone === 'medium'
          ? Circle16Regular
          : CheckmarkCircle20Filled;

  const badge = (
    <span
      className={`${styles.badge} ${styles[meta.tone]} ${compact ? styles.compact : ''}`}
      data-confidence={meta.tone}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>
        {compact ? meta.label : `Confidence: ${meta.label}`}
      </span>
      {basis && !compact ? <Info16Regular className={styles.info} aria-hidden="true" /> : null}
    </span>
  );

  if (!basis) return badge;

  return (
    <Tooltip
      relationship="description"
      withArrow
      content={
        <span className={styles.tooltip}>
          <strong>{meta.tone === 'confirmed' ? meta.label : `${meta.label} confidence`}</strong>
          <span>{basis}</span>
        </span>
      }
    >
      {badge}
    </Tooltip>
  );
}
