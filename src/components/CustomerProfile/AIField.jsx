import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Dropdown,
  Input,
  Option,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Textarea,
} from '@fluentui/react-components';
import { Sparkle16Filled } from '@fluentui/react-icons';
import ConfidenceBadge from '../shared/ConfidenceBadge.jsx';
import styles from './AIField.module.css';

/**
 * A single profile field. When the assistant fills it, the field flashes once
 * and then carries a provenance affordance — the badge says how confident, the
 * "Show source" popover says what the value was drawn from.
 */
export default function AIField({
  label,
  value,
  meta,
  type = 'text',
  options = [],
  icon,
  onChange,
}) {
  const id = useId();
  const [highlight, setHighlight] = useState(false);
  const lastPopulated = useRef(null);

  useEffect(() => {
    if (!meta?.populatedAt || meta.populatedAt === lastPopulated.current) return;
    lastPopulated.current = meta.populatedAt;
    setHighlight(true);
    const t = setTimeout(() => setHighlight(false), 1300);
    return () => clearTimeout(t);
  }, [meta?.populatedAt]);

  const isAi = meta?.source === 'ai';

  return (
    <div className={`${styles.field} ${highlight ? styles.populating : ''}`}>
      <div className={styles.head}>
        <label className={styles.label} htmlFor={id}>
          {icon ? (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {label}
        </label>

        {meta ? (
          <div className={styles.meta}>
            {isAi ? (
              <span className={styles.aiTag} title="Populated by the copilot">
                <Sparkle16Filled aria-hidden="true" />
                AI
              </span>
            ) : null}
            <ConfidenceBadge level={meta.confidence} basis={meta.basis} compact />
          </div>
        ) : null}
      </div>

      <div className={styles.control}>
        {type === 'select' ? (
          <Dropdown
            id={id}
            className={styles.input}
            value={value}
            selectedOptions={value ? [value] : []}
            placeholder="Select…"
            onOptionSelect={(_, data) => onChange(data.optionValue)}
          >
            {options.map((o) => (
              <Option key={o} value={o}>
                {o}
              </Option>
            ))}
          </Dropdown>
        ) : type === 'textarea' ? (
          <Textarea
            id={id}
            className={styles.input}
            value={value}
            resize="vertical"
            onChange={(_, data) => onChange(data.value)}
            placeholder="What is the customer trying to achieve?"
          />
        ) : (
          <Input
            id={id}
            className={styles.input}
            value={value}
            onChange={(_, data) => onChange(data.value)}
            placeholder="—"
          />
        )}
      </div>

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
