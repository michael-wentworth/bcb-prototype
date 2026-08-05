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

/* What the seller is told when they hover a value they corrected. Transparent
   about the fact that corrections are useful, and careful not to claim that one
   customer's data trains anything — the honest version is that a confirmed
   value may inform future suggestions, not that this account is a training
   set. */
const CONFIRMED_NOTE = 'Your correction helps improve future recommendations.';

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

  /* The copilot's own values keep the confidence word and its colour, with the
     sparkle saying who put it there. The level is the useful thing at a glance —
     a low-confidence rate is a placeholder and needs to look like one — and
     replacing it with "AI generated" said something the sparkle already said. */
  const isAi = ai && meta.tone !== 'confirmed';
  const tone = meta.tone;

  const Icon = isAi
    ? Sparkle16Filled
    : tone === 'low'
      ? Warning16Filled
      : tone === 'medium'
        ? Circle16Regular
        : CheckmarkCircle16Filled;

  const pill = (
    <span
      className={`${styles.badge} ${styles[tone]} ${compact ? styles.compact : ''}`}
      data-confidence={tone}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <span className={styles.text}>{meta.label}</span>
    </span>
  );

  const heading = tone === 'confirmed' ? meta.label : `${meta.label} confidence`;

  /* A corrected value now has something worth saying, so it stops being an
     inert label: hovering it explains what the correction is good for. */
  const note = tone === 'confirmed' ? CONFIRMED_NOTE : null;
  const hasDetail = Boolean(evidence) || Boolean(note) || (Boolean(basis) && tone !== 'confirmed');
  if (!hasDetail) return pill;

  return (
    <Popover openOnHover mouseLeaveDelay={140} withArrow positioning="below-start">
      <PopoverTrigger disableButtonEnhancement>
        <button
          type="button"
          className={styles.trigger}
          aria-label={`${isAi ? 'Populated by the copilot. ' : ''}${heading}. ${note || 'Show source.'}`}
        >
          {pill}
        </button>
      </PopoverTrigger>
      <PopoverSurface className={styles.surface}>
        <p className={styles.surfaceHead}>
          {isAi ? `Populated by the copilot — ${heading}` : heading}
        </p>
        {note ? <p className={styles.basis}>{note}</p> : null}
        {basis && tone !== 'confirmed' ? <p className={styles.basis}>{basis}</p> : null}
        {evidence ? <p className={styles.evidence}>{evidence}</p> : null}
      </PopoverSurface>
    </Popover>
  );
}
