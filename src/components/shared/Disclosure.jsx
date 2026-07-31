import React, { useId, useState } from 'react';
import { ChevronRight16Regular } from '@fluentui/react-icons';
import styles from './Disclosure.module.css';

/**
 * Progressive disclosure for a group of secondary fields.
 *
 * The count is shown deliberately. A collapsed section that does not say how
 * much is inside reads as "there might be something important hidden here",
 * which costs the seller a click to rule out — the opposite of what hiding the
 * fields was meant to achieve.
 *
 * Content is unmounted when collapsed rather than hidden with CSS, so the
 * fields inside are genuinely out of the tab order. A `display: none` panel
 * still counts as form content to some assistive tech.
 */
export default function Disclosure({ label, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRight16Regular
          aria-hidden="true"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
        />
        <span className={styles.label}>{label}</span>
        {count != null ? <span className={styles.count}>{count}</span> : null}
      </button>

      {open ? (
        <div id={panelId} className={styles.panel}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
