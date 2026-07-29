import React from 'react';
import { Tooltip } from '@fluentui/react-components';
import { Circle16Regular, Person20Regular, Sparkle16Filled } from '@fluentui/react-icons';
import { AUTHORSHIP, AUTHORSHIP_META } from '../../data/authoring.js';
import styles from './AuthorshipBadge.module.css';

const ICONS = {
  ai: Sparkle16Filled,
  assisted: Sparkle16Filled,
  manual: Person20Regular,
  empty: Circle16Regular,
};

/**
 * Provenance for one section.
 *
 * AI and assisted always show. "Manually authored" is quieter — it renders in a
 * neutral tone rather than shouting, because a hand-written case should not be
 * covered in labels telling the author that they wrote it.
 */
export default function AuthorshipBadge({ level = AUTHORSHIP.EMPTY, hideEmpty = false }) {
  if (hideEmpty && level === AUTHORSHIP.EMPTY) return null;
  const meta = AUTHORSHIP_META[level] || AUTHORSHIP_META.empty;
  const Icon = ICONS[level] || Circle16Regular;

  return (
    <Tooltip relationship="description" withArrow content={meta.description}>
      <span className={`${styles.badge} ${styles[level]}`} data-authorship={level}>
        <Icon className={styles.icon} aria-hidden="true" />
        {meta.label}
      </span>
    </Tooltip>
  );
}
