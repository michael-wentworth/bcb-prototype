import React from 'react';
import { Card } from '@fluentui/react-components';
import { SOLUTION_AREAS, capabilityById } from '../../data/capabilities.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './Capability.module.css';

/* Each bucket carries a different claim, and the wording is the claim. Mixing
   them is how a case ends up asserting a saving against something the customer
   was never paying for, so they are named by what you can say, not by what the
   arithmetic did. */
const BUCKETS = [
  {
    key: 'retained',
    name: 'Retained',
    cls: 'bucketRetained',
    why: 'Already owned and still owned. Argues nothing — it is the floor the case stands on, not part of the return.',
  },
  {
    key: 'newMicrosoft',
    name: 'New Microsoft capabilities',
    cls: 'bucketNew',
    why: 'Gained in the move. A market equivalent exists, so each one is a consolidation opportunity until you say otherwise on the next step.',
  },
  {
    key: 'consolidation',
    name: 'Consolidation opportunities',
    cls: 'bucketConsolidation',
    why: 'Gained, and you have named the incumbent. These are the only capabilities that can carry a saving.',
  },
  {
    key: 'strategic',
    name: 'Net-new strategic',
    cls: 'bucketStrategic',
    why: 'Gained, with nothing comparable to displace. No saving to claim — the argument is capability the estate did not have.',
  },
];

const SEGMENTS = [
  { key: 'retained', cls: 'segRetained', label: 'Retained' },
  { key: 'newMicrosoft', cls: 'segNew', label: 'New' },
  { key: 'consolidation', cls: 'segConsolidation', label: 'Consolidation' },
  { key: 'strategic', cls: 'segStrategic', label: 'Strategic' },
];

/**
 * Step 3 — what changes.
 *
 * Nothing is entered here. The seller made two selections and this is what they
 * imply, which is the point of putting capabilities at the centre: the analysis
 * that used to be argued by hand is now a consequence of two clicks.
 */
export default function CapabilityAnalysis() {
  const { capabilityCase } = useAppState();
  const { delta, counts } = capabilityCase;

  if (!delta.future.length) {
    return (
      <div className={styles.root}>
        <StepMasthead description="Current state against future state, split into the four claims a business case can make." />
        <Card className={styles.card}>
          <p className={styles.empty}>
            Choose a future state on the previous step and the analysis appears here.
          </p>
        </Card>
        <StepFooter hint="Nothing to analyse yet." />
      </div>
    );
  }

  const byArea = SOLUTION_AREAS.map((a) => {
    const inArea = (ids) => ids.filter((id) => capabilityById(id)?.area === a.id).length;
    const seg = {
      retained: inArea(delta.retained),
      newMicrosoft: inArea(delta.newMicrosoft),
      consolidation: inArea(delta.consolidation),
      strategic: inArea(delta.strategic),
    };
    const total = Object.values(seg).reduce((x, y) => x + y, 0);
    return { ...a, seg, total };
  }).filter((a) => a.total > 0);

  return (
    <div className={styles.root}>
      <StepMasthead description="Current state against future state, split into the four claims a business case can make. Nothing to fill in — this is what your two selections imply." />

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>
            {delta.gained.length} capabilities gained, {delta.retained.length} retained
          </h2>
          <p className={styles.cardLead}>
            Only the consolidation bucket can carry a saving, and only once you name what it
            replaces. The other three are the story around it.
          </p>
        </div>

        <div className={styles.buckets}>
          {BUCKETS.map((b) => {
            const ids = delta[b.key] || [];
            const shown = ids.slice(0, 6);
            return (
              <div key={b.key} className={`${styles.bucket} ${styles[b.cls]}`}>
                <span className={styles.bucketCount}>{counts[b.key] ?? ids.length}</span>
                <span className={styles.bucketName}>{b.name}</span>
                <p className={styles.bucketWhy}>{b.why}</p>
                {ids.length > 0 ? (
                  <ul className={styles.capList}>
                    {shown.map((id) => (
                      <li key={id} className={styles.capChip}>{capabilityById(id)?.name}</li>
                    ))}
                    {ids.length > shown.length ? (
                      <li className={styles.capMore}>+{ids.length - shown.length} more</li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Where the change lands</h2>
          <p className={styles.cardLead}>
            The same four categories by solution area — useful for working out which conversation
            this case actually is.
          </p>
        </div>

        <div>
          {byArea.map((a) => (
            <div key={a.id} className={styles.areaRow}>
              <span className={styles.areaName}>{a.label}</span>
              <span className={styles.areaBar}>
                {SEGMENTS.map((s) =>
                  a.seg[s.key] > 0 ? (
                    <span
                      key={s.key}
                      className={styles[s.cls]}
                      style={{ width: `${(a.seg[s.key] / a.total) * 100}%` }}
                      title={`${s.label}: ${a.seg[s.key]}`}
                    />
                  ) : null,
                )}
              </span>
              <span className={styles.areaCount}>{a.total}</span>
            </div>
          ))}
        </div>

        <div className={styles.legend}>
          {SEGMENTS.map((s) => (
            <span key={s.key} className={styles.legendItem}>
              <span className={`${styles.swatch} ${styles[s.cls]}`} aria-hidden="true" />
              {s.label}
            </span>
          ))}
        </div>
      </Card>

      {delta.lost.length > 0 ? (
        <Card className={styles.card}>
          <div>
            <h2 className={styles.cardTitle}>{delta.lost.length} capabilities would be lost</h2>
            <p className={styles.cardLead}>
              The future state does not deliver these and the current one does. Worth checking
              before this reaches a customer — a move that trades capability away is a different
              conversation from one that only adds.
            </p>
          </div>
          <ul className={styles.capList}>
            {delta.lost.map((id) => (
              <li key={id} className={styles.capChip}>{capabilityById(id)?.name}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <StepFooter
        hint={`${delta.potentialConsolidation.length} capabilities have a market equivalent — those are the only ones the next step asks about.`}
      />
    </div>
  );
}
