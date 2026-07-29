import React from 'react';
import { Checkmark16Filled } from '@fluentui/react-icons';
import { STAGES } from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './WorkflowHeader.module.css';

export default function WorkflowHeader() {
  const { stage, maxStageReached, goToStage } = useAppState();

  return (
    <nav className={styles.root} aria-label="Business case stages">
      <ol className={styles.list}>
        {STAGES.map((s, i) => {
          const state = i < stage ? 'complete' : i === stage ? 'current' : 'upcoming';
          const reachable = i <= maxStageReached;

          return (
            <li key={s.id} className={styles.item} data-state={state}>
              {i > 0 ? (
                <span
                  className={styles.rail}
                  data-filled={i <= stage ? 'true' : 'false'}
                  aria-hidden="true"
                />
              ) : null}

              <button
                type="button"
                className={styles.step}
                onClick={() => reachable && goToStage(i)}
                disabled={!reachable}
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
                    ? ' — completed'
                    : state === 'current'
                      ? ' — current stage'
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
