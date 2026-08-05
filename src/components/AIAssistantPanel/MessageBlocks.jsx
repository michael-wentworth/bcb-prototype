import React from 'react';
import { Badge, Button } from '@fluentui/react-components';
import {
  ArrowRight16Filled,
  Checkmark16Filled,
  Lightbulb20Filled,
  Sparkle16Filled,
  Warning20Filled,
} from '@fluentui/react-icons';
import ConfidenceBadge from '../shared/ConfidenceBadge.jsx';
import ConfidenceAsk from './ConfidenceAsk.jsx';
import styles from './MessageBlocks.module.css';

/** Minimal inline markdown — **bold** only. Enough for scripted copy. */
function RichText({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

const CALLOUT_ICON = {
  insight: Lightbulb20Filled,
  coach: Sparkle16Filled,
  warning: Warning20Filled,
};

export default function MessageBlocks({ blocks, onAction }) {
  return (
    <div className={styles.stack}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} onAction={onAction} />
      ))}
    </div>
  );
}

function Block({ block, onAction }) {
  switch (block.type) {
    case 'text':
      return (
        <p className={styles.paragraph}>
          <RichText text={block.text} />
        </p>
      );

    case 'bullets':
      return (
        <ul className={styles.bullets}>
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );

    case 'fields':
      return (
        <div className={styles.fields}>
          {block.items.map((f, i) => (
            <div key={i} className={styles.field} style={{ animationDelay: `${i * 60}ms` }}>
              <div className={styles.fieldHead}>
                <span className={styles.fieldLabel}>{f.label}</span>
                <ConfidenceBadge level={f.confidence} basis={f.basis} compact />
              </div>
              <div className={styles.fieldValue}>{f.value}</div>
            </div>
          ))}
        </div>
      );

    case 'vendors':
      return (
        <div className={styles.vendors}>
          {block.items.map((v) => (
            <div key={v.id} className={styles.vendor}>
              <div className={styles.vendorMain}>
                <span className={styles.vendorName}>{v.name}</span>
                <span className={styles.vendorCategory}>{v.category}</span>
              </div>
              <ConfidenceBadge level={v.confidence} basis={v.basis} compact />
            </div>
          ))}
        </div>
      );

    case 'callout': {
      const Icon = CALLOUT_ICON[block.tone] || Lightbulb20Filled;
      return (
        <aside className={styles.callout} data-tone={block.tone}>
          <span className={styles.calloutIcon} aria-hidden="true">
            <Icon />
          </span>
          <div className={styles.calloutBody}>
            {block.title ? <p className={styles.calloutTitle}>{block.title}</p> : null}
            <p className={styles.calloutText}>
              <RichText text={block.text} />
            </p>
          </div>
        </aside>
      );
    }

    case 'metrics':
      return (
        <div className={styles.metrics}>
          {block.items.map((m, i) => (
            <div key={i} className={styles.metric} data-tone={m.tone || 'neutral'}>
              <span className={styles.metricLabel}>{m.label}</span>
              <span className={styles.metricValue}>{m.value}</span>
              {m.caption ? <span className={styles.metricCaption}>{m.caption}</span> : null}
            </div>
          ))}
        </div>
      );

    case 'mapping':
      return (
        <div className={styles.mapping}>
          {block.items.map((m, i) => (
            <div key={i} className={styles.mapRow}>
              <span className={styles.mapFrom}>{m.from}</span>
              <ArrowRight16Filled className={styles.mapArrow} aria-hidden="true" />
              <span className={styles.mapTo}>{m.to}</span>
              {m.confidence ? <ConfidenceBadge level={m.confidence} compact /> : null}
            </div>
          ))}
        </div>
      );

    case 'gaps':
      return (
        <div className={styles.gaps}>
          {block.items.map((g) => (
            <div key={g.id} className={styles.gap}>
              <div className={styles.gapHead}>
                <span className={styles.gapTitle}>{g.title}</span>
                <Badge
                  appearance="tint"
                  size="small"
                  color={g.impact === 'high' ? 'danger' : 'warning'}
                >
                  {g.impact === 'high' ? 'High impact' : 'Medium impact'}
                </Badge>
              </div>
              <p className={styles.gapText}>{g.text}</p>
              {g.prompt ? (
                <button
                  type="button"
                  className={styles.gapLink}
                  onClick={() => onAction?.({ kind: 'prompt', label: g.prompt })}
                >
                  {g.prompt}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      );

    case 'objections':
      return (
        <div className={styles.objections}>
          {block.items.map((o, i) => (
            <div key={i} className={styles.objection}>
              <p className={styles.objectionQ}>{o.objection}</p>
              <p className={styles.objectionA}>
                <Checkmark16Filled className={styles.objectionIcon} aria-hidden="true" />
                <span>{o.response}</span>
              </p>
            </div>
          ))}
        </div>
      );

    case 'draft':
      return (
        <div className={styles.draft}>
          <p className={styles.draftTitle}>{block.title}</p>
          <div className={styles.draftBody}>
            {block.body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      );

    case 'actions':
      return (
        <div className={styles.actions}>
          {block.items.map((a, i) => (
            <Button
              key={i}
              size="small"
              appearance="outline"
              className={styles.actionChip}
              icon={a.kind === 'navigate' ? <ArrowRight16Filled /> : <Sparkle16Filled />}
              iconPosition={a.kind === 'navigate' ? 'after' : 'before'}
              onClick={() => onAction?.(a)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      );

    /* The one explicit question, rendered from the conversation rather than
       from the report. It reads its own state so the panel needs no new
       plumbing and the answered form replaces it in place. */
    case 'confidence':
      return <ConfidenceAsk />;

    default:
      return null;
  }
}
