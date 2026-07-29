import React from 'react';
import { Button } from '@fluentui/react-components';
import { ChevronLeft20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import { STAGES } from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './StageFooter.module.css';

export default function StageFooter({ nextLabel, nextDisabled, hint, extra }) {
  const { stage, goToStage } = useAppState();
  const isLast = stage === STAGES.length - 1;

  return (
    <footer className={styles.footer}>
      <div className={styles.hint}>{hint}</div>
      <div className={styles.buttons}>
        {extra}
        {stage > 0 ? (
          <Button appearance="secondary" icon={<ChevronLeft20Regular />} onClick={() => goToStage(stage - 1)}>
            Back
          </Button>
        ) : null}
        {!isLast ? (
          <Button
            appearance="primary"
            icon={<ChevronRight20Regular />}
            iconPosition="after"
            disabled={nextDisabled}
            onClick={() => goToStage(stage + 1)}
          >
            {nextLabel || `Continue to ${STAGES[stage + 1].label}`}
          </Button>
        ) : null}
      </div>
    </footer>
  );
}
