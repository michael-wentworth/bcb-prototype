import React, { useId, useState } from 'react';
import { Badge, Button, Switch } from '@fluentui/react-components';
import {
  ArrowRight16Filled,
  ChevronDown20Regular,
  Sparkle16Filled,
} from '@fluentui/react-icons';
import styles from './RecommendationCard.module.css';

const TONE_COLOR = {
  brand: 'brand',
  success: 'success',
  neutral: 'informative',
};

export default function RecommendationCard({ sku, selected, onToggle, onAsk }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className={`${styles.card} ${selected ? styles.selected : ''}`}>
      <header className={styles.head}>
        <div className={styles.identity}>
          <div className={styles.titleRow}>
            <h3 className={styles.name}>{sku.name}</h3>
            <Badge appearance="filled" size="small" color={TONE_COLOR[sku.badgeTone] || 'brand'}>
              {sku.badge}
            </Badge>
          </div>
          <p className={styles.category}>
            {sku.category} · {sku.seats}
          </p>
        </div>

        <div className={styles.toggle}>
          <Switch
            checked={selected}
            onChange={onToggle}
            label={selected ? 'In case' : 'Excluded'}
            labelPosition="before"
          />
        </div>
      </header>

      <p className={styles.summary}>{sku.summary}</p>

      <div className={styles.fit}>
        <div className={styles.fitLabel}>
          <Sparkle16Filled aria-hidden="true" />
          <span>Fit score</span>
        </div>
        <div
          className={styles.meterTrack}
          role="img"
          aria-label={`Fit score ${sku.fitScore} out of 100`}
        >
          <div className={styles.meterFill} style={{ width: `${sku.fitScore}%` }} />
        </div>
        <span className={styles.fitValue}>{sku.fitScore}</span>
      </div>

      {sku.displaces.length > 0 ? (
        <div className={styles.displaces}>
          <span className={styles.displacesLabel}>Displaces</span>
          {sku.displaces.map((d) => (
            <span key={d} className={styles.displacesChip}>
              {d}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.disclosure}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown20Regular
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          />
          {open ? 'Hide rationale' : 'Why this recommendation?'}
        </button>

        <Button
          size="small"
          appearance="transparent"
          icon={<ArrowRight16Filled />}
          iconPosition="after"
          onClick={onAsk}
        >
          Ask the copilot
        </Button>
      </div>

      {open ? (
        <div className={styles.rationale} id={panelId}>
          <p className={styles.rationaleText}>{sku.rationale}</p>
          <p className={styles.evidenceLabel}>Evidence weighted</p>
          <ul className={styles.evidence}>
            {sku.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
