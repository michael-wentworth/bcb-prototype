import React, { useEffect, useId, useRef, useState } from 'react';
import { Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import ConfidenceBadge from './ConfidenceBadge.jsx';
import styles from './FormField.module.css';

/**
 * One labelled form field.
 *
 * When the copilot populated it, the field flashes once and then keeps a
 * provenance affordance — the badge says how confident, the "Show source"
 * popover says what the value was drawn from. Editing it clears that and marks
 * the value as yours.
 */
export default function FormField({
  label,
  required,
  help,
  meta,
  children,
  span,
  className = '',
}) {
  const id = useId();
  const [highlight, setHighlight] = useState(false);
  const seen = useRef(null);

  useEffect(() => {
    if (meta?.source !== 'ai') return undefined;
    const key = `${meta.basis}-${meta.confidence}`;
    if (seen.current === key) return undefined;
    seen.current = key;
    setHighlight(true);
    const t = setTimeout(() => setHighlight(false), 1300);
    return () => clearTimeout(t);
  }, [meta?.source, meta?.basis, meta?.confidence]);

  return (
    <div
      className={`${styles.field} ${span ? styles.span : ''} ${
        highlight ? styles.populating : ''
      } ${className}`}
    >
      <div className={styles.head}>
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? <span className={styles.required} aria-hidden="true"> *</span> : null}
        </label>
        {meta ? (
          <span className={styles.meta}>
            <ConfidenceBadge level={meta.confidence} basis={meta.basis} compact />
          </span>
        ) : null}
      </div>

      {/* Children receive the generated id so the label stays associated. */}
      {typeof children === 'function' ? children(id) : children}

      {help ? <p className={styles.help}>{help}</p> : null}

      {meta?.evidence ? (
        <Popover withArrow positioning="below-start">
          <PopoverTrigger disableButtonEnhancement>
            <button type="button" className={styles.sourceLink}>
              Show source
            </button>
          </PopoverTrigger>
          <PopoverSurface className={styles.sourceSurface}>
            <p className={styles.sourceLabel}>{meta.basis}</p>
            <p className={styles.sourceQuote}>{meta.evidence}</p>
          </PopoverSurface>
        </Popover>
      ) : null}
    </div>
  );
}
