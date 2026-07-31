import React from 'react';
import { Button } from '@fluentui/react-components';
import { ChevronLeft20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import { STEPS } from '../../data/referenceData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './StepFooter.module.css';

/**
 * Back, and a forward button that says what pressing it produces.
 *
 * "Next" describes the direction of travel and nothing else, which wastes the
 * one control on the page a seller is guaranteed to read. Naming the outcome
 * also carries the working model: you are reviewing a recommendation that has
 * already been drafted, and the last press is the one that produces the case.
 *
 * Deliberately never disabled — a seller filling the form by hand must be able
 * to move through the workflow without touching the assistant.
 */
const FORWARD = ['Review recommendation', 'Generate business case'];
export default function StepFooter({ hint, extra }) {
  const { step, goToStep } = useAppState();
  const isLast = step === STEPS.length - 1;

  return (
    <footer className={styles.footer}>
      <div className={styles.hint}>{hint}</div>
      <div className={styles.buttons}>
        {extra}
        {step > 0 ? (
          <Button
            appearance="secondary"
            icon={<ChevronLeft20Regular />}
            onClick={() => goToStep(step - 1)}
          >
            Back
          </Button>
        ) : null}
        {!isLast ? (
          <Button
            appearance="primary"
            icon={<ChevronRight20Regular />}
            iconPosition="after"
            onClick={() => goToStep(step + 1)}
          >
            {FORWARD[step] || 'Next'}
          </Button>
        ) : null}
      </div>
    </footer>
  );
}
