import React, { useEffect, useId, useRef } from 'react';
import { Tooltip } from '@fluentui/react-components';
import { Checkmark16Filled } from '@fluentui/react-icons';
import { STEPS } from '../../data/referenceData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './StepMasthead.module.css';

/**
 * The step you are on, stated once.
 *
 * This replaces a stepper in the app chrome plus a separate page heading below it,
 * which between them said the step's name twice, its position twice and its
 * purpose twice. Here the rail *is* the heading: the current step's label is the
 * page's h1, and the two steps either side stay small navigation labels.
 *
 * There is deliberately no `title` prop and no `eyebrow` prop. The name comes from
 * STEPS[step] and the position from step, so a caller cannot state either a second
 * time — the merge is enforced by the signature rather than by convention.
 */
export default function StepMasthead({ description }) {
  const { step, maxStepReached, goToStep } = useAppState();
  const descId = useId();
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  // The stage container is keyed on the step, so this whole header remounts when
  // you navigate — which would drop keyboard focus on the floor. Put it on the new
  // heading instead. Skipped on first mount, so arriving at a case does not steal
  // focus from wherever the user actually is.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  return (
    <header className={styles.root}>
      <nav className={styles.rail} aria-label="Business case steps">
        <ol className={styles.list}>
          {STEPS.map((s, i) => {
            const state =
              i < step || (i <= maxStepReached && i !== step)
                ? 'complete'
                : i === step
                  ? 'current'
                  : 'upcoming';
            const isCurrent = state === 'current';

            return (
              <li
                key={s.id}
                className={styles.item}
                data-state={state}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {i > 0 ? (
                  <span
                    className={styles.connector}
                    data-filled={i <= maxStepReached ? 'true' : 'false'}
                    aria-hidden="true"
                  />
                ) : null}

                {isCurrent ? (
                  /* A span, not a button: <button> takes phrasing content only, and
                     a role=button's children are presentational — an <h1> inside
                     one is dropped from the accessibility tree entirely. Every
                     other step is still a button, so all steps stay reachable in
                     any order; clicking the one you are on was always a no-op. */
                  <span className={styles.current}>
                    <span className={styles.markerCell}>
                      <span className={styles.marker} aria-hidden="true">
                        {i + 1}
                      </span>
                    </span>
                    <h1
                      className={styles.heading}
                      tabIndex={-1}
                      ref={headingRef}
                      aria-describedby={description ? descId : undefined}
                    >
                      {s.label}
                      {/* "Step 3 of 3" used to be printed above the title. Three
                          markers with the third filled says it already, so it
                          survives only for anyone who cannot see them. */}
                      <span className={styles.srOnly}>{`, step ${i + 1} of ${STEPS.length}`}</span>
                    </h1>
                  </span>
                ) : (
                  <Tooltip
                    content={s.caption}
                    relationship="description"
                    withArrow
                    positioning="below"
                  >
                    {/* No aria-label here on purpose. An element's own aria-label
                        replaces its contents, which would silence the state suffix
                        below — and the label is hidden by clipping rather than
                        display:none, so the visible text carries the name into the
                        accessible name at every width. */}
                    <button type="button" className={styles.step} onClick={() => goToStep(i)}>
                      <span className={styles.markerCell}>
                        <span className={styles.marker} aria-hidden="true">
                          {state === 'complete' ? <Checkmark16Filled /> : i + 1}
                        </span>
                      </span>
                      <span className={styles.label}>{s.label}</span>
                      <span className={styles.srOnly}>
                        {state === 'complete' ? ', visited' : ', not started'}
                      </span>
                    </button>
                  </Tooltip>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {description ? (
        <p className={styles.lede} id={descId}>
          {description}
        </p>
      ) : null}
    </header>
  );
}
