import React from 'react';
import { Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import {
  CheckmarkCircle16Filled,
  Circle16Regular,
  Sparkle16Filled,
  Warning16Filled,
} from '@fluentui/react-icons';
import styles from './ConfidenceBadge.module.css';

const LEVELS = {
  high: { label: 'High', tone: 'high' },
  medium: { label: 'Medium', tone: 'medium' },
  low: { label: 'Low', tone: 'low' },
  confirmed: { label: 'Confirmed by you', tone: 'confirmed' },
};

/**
 * One pill carrying everything known about where a value came from: that the
 * copilot put it there, how confident it was, and what it was drawn from.
 *
 * These used to be three separate affordances on every populated field — a
 * gradient "AI" chip, this badge, and a "Show source" link below the input. Ten
 * fields meant thirty controls. Merged, the icon says who, the word says how
 * sure, and the surface says why — revealed on hover, and equally on click and
 * keyboard focus, because hover-only content does not exist on touch and cannot
 * be reached from the keyboard.
 *
 * The sparkle is only for values the copilot supplied. Once you edit one it
 * becomes "Confirmed by you" with a checkmark, because it is no longer the
 * copilot's claim to make.
 */
export default function ConfidenceBadge({ level = 'medium', basis, evidence, ai = false, compact = false }) {
  const meta = LEVELS[level] || LEVELS.medium;

  const Icon = ai
    ? Sparkle16Filled
    : meta.tone === 'low'
      ? Warning16Filled
      : meta.tone === 'medium'
        ? Circle16Regular
        : CheckmarkCircle16Filled;

  const pill = (
    <span
      className={`${styles.badge} ${styles[meta.tone]} ${compact ? styles.compact : ''}`}
      data-confidence={meta.tone}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>{meta.label}</span>
    </span>
  );

  const heading = meta.tone === 'confirmed' ? meta.label : `${meta.label} confidence`;

  // Nothing to reveal, so nothing to interact with. A value you edited yourself
  // carries no evidence and a basis of "Edited by you", which is the pill's own
  // label again — so it stays a plain label rather than offering a popover that
  // would repeat itself.
  const hasDetail = Boolean(evidence) || (Boolean(basis) && meta.tone !== 'confirmed');
  if (!hasDetail) return pill;

  return (
    <Popover openOnHover mouseLeaveDelay={140} withArrow positioning="below-start">
      <PopoverTrigger disableButtonEnhancement>
        <button
          type="button"
          className={styles.trigger}
          aria-label={`${ai ? 'Populated by the copilot. ' : ''}${heading}. Show source.`}
        >
          {pill}
        </button>
      </PopoverTrigger>
      <PopoverSurface className={styles.surface}>
        <p className={styles.surfaceHead}>{ai ? `Populated by the copilot — ${heading}` : heading}</p>
        {basis ? <p className={styles.basis}>{basis}</p> : null}
        {evidence ? <p className={styles.evidence}>{evidence}</p> : null}
      </PopoverSurface>
    </Popover>
  );
}
