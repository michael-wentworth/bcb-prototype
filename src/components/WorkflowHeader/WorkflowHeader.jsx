import React, { useState } from 'react';
import { Checkmark16Filled } from '@fluentui/react-icons';
import { STEPS } from '../../data/referenceData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import CaseTitle from './CaseTitle.jsx';
import CaseActions from './CaseActions.jsx';
import styles from './WorkflowHeader.module.css';

/**
 * The case-scoped band: which case you are in, where you are within it, and the
 * controls that act on the case as a whole.
 *
 * Three grid columns — title, steps, actions — with the two side tracks given
 * equal explicit floors so the stepper's x-position never depends on how long the
 * case is called.
 *
 * The band spans the whole app, above the copilot rather than beside it, so its
 * width is the viewport's. Degradation still keys off the band's own width via
 * container queries rather than a media query: it is the box that actually
 * constrains the content, and that keeps the rules honest if the band is ever put
 * back into a column.
 */
export default function WorkflowHeader() {
  const { step, maxStepReached, goToStep } = useAppState();
  // Lifted, because two things start a rename: clicking the title, and the
  // Rename item in the overflow menu.
  const [renaming, setRenaming] = useState(false);

  return (
    <div className={styles.root}>
      <CaseTitle
        renaming={renaming}
        onStartRename={() => setRenaming(true)}
        onEndRename={() => setRenaming(false)}
      />

      <nav className={styles.stepper} aria-label="Business case steps">
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
                  // The labels below are hidden by container queries at narrow
                  // widths, which would take the step names out of the
                  // accessibility tree along with them.
                  aria-label={s.label}
                  title={s.label}
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

      <CaseActions onRename={() => setRenaming(true)} />
    </div>
  );
}
