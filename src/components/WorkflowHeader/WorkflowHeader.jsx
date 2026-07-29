import React from 'react';
import { Checkmark16Filled } from '@fluentui/react-icons';
import { STEPS } from '../../data/referenceData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './WorkflowHeader.module.css';

export default function WorkflowHeader() {
  const { step, maxStepReached, goToStep } = useAppState();
  // The stepper already states where you are; a "Step 1 of 3" line under it
  // repeats the same fact, so the count lives in the screen heading instead.

  return (
    <nav className={styles.root} aria-label="Business case steps">
      <ol className={styles.list}>
        {STEPS.map((s, i) => {
          // Visited steps read as complete; every step stays reachable, because
          // a form filled by hand does not have to be filled in order.
          const state =
            i < step || (i <= maxStepReached && i !== step)
              ? 'complete'
              : i === step
                ? 'current'
                : 'upcoming';

          return (
            <li key={s.id} className={styles.item} data-state={state}>
              {i > 0 ? (
                <span
                  className={styles.rail}
                  data-filled={i <= maxStepReached ? 'true' : 'false'}
                  aria-hidden="true"
                />
              ) : null}

              <button
                type="button"
                className={styles.step}
                onClick={() => goToStep(i)}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className={styles.marker} aria-hidden="true">
                  {state === 'complete' ? <Checkmark16Filled /> : i + 1}
                </span>
                <span className={styles.labels}>
                  <span className={styles.label}>{s.label}</span>
                  <span className={styles.caption}>{s.caption}</span>
                </span>
                <span className={styles.srOnly}>
                  {state === 'complete'
                    ? ' — visited'
                    : state === 'current'
                      ? ' — current step'
                      : ' — not started'}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
