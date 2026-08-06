import React, { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { ChevronDown16Regular, ChevronRight16Regular } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './Report.module.css';

/**
 * How complete the case is, sitting inside the executive summary.
 *
 * It is the fourth KPI rather than a card of its own, because it qualifies the
 * other three: a 300% return computed from two guesses is not a better case
 * than a 40% return computed from confirmed contracts, and a reader who sees
 * the returns without this reads them as equally solid.
 *
 * Expanded, it is a worklist ordered by what each gap costs the figure — "add
 * contract end dates" is only useful advice next to how much it is worth.
 */
export default function CaseConfidencePanel() {
  const { caseConfidence, goToStep } = useAppState();
  const [open, setOpen] = useState(false);

  if (!caseConfidence?.started) return null;
  const { percent, gaps, band, nextStep } = caseConfidence;
  const Chevron = open ? ChevronDown16Regular : ChevronRight16Regular;

  return (
    <div className={styles.confidence}>
      <div className={styles.confidenceHead}>
        <div>
          <span className={styles.kpiLabel}>Business case confidence</span>
          <p className={styles.confidenceLead}>
            {gaps.length === 0
              ? 'Everything the model needs has been answered.'
              : `${gaps.length} thing${gaps.length === 1 ? '' : 's'} would make this harder to argue with.`}
          </p>
        </div>
        <span
          className={`${styles.confidenceScore} ${
            styles[band === 'high' ? 'confHigh' : band === 'medium' ? 'confMedium' : 'confLow']
          }`}
        >
          {percent}%
        </span>
      </div>

      {gaps.length > 0 ? (
        <>
          <button
            type="button"
            className={styles.linkButton}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Chevron aria-hidden="true" />
            {open ? 'Hide what is missing' : 'What is missing'}
          </button>

          {open ? (
            <>
              <ul className={styles.gapList}>
                {gaps.map((g) => (
                  <li key={g.id} className={styles.gap}>
                    <span className={styles.gapLabel}>{g.label}</span>
                    <span className={styles.gapWorth}>+{g.worth} points</span>
                    <span className={styles.gapDetail}>{g.detail}</span>
                  </li>
                ))}
              </ul>
              {nextStep !== null ? (
                <Button
                  appearance="primary"
                  className={styles.selfStart}
                  onClick={() => goToStep(nextStep)}
                >
                  Improve confidence
                </Button>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
