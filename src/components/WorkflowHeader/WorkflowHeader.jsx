import React, { useState } from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { ArrowLeft20Regular } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import CaseTitle from './CaseTitle.jsx';
import CaseActions from './CaseActions.jsx';
import styles from './WorkflowHeader.module.css';

/**
 * The case-scoped band: the way out, which case you are in, and the controls
 * that act on the case as a whole.
 *
 * The back arrow leads because that is where a detail view puts its exit — and it
 * makes leaving a case a visible affordance rather than something you have to
 * already know is under the overflow menu.
 *
 * The stepper used to sit between them, which meant the step was named here and
 * again in the page heading below. It now lives with that heading, as
 * shared/StepMasthead.jsx — so this band is about the case and nothing else.
 */
export default function WorkflowHeader({ panelOpen, onTogglePanel }) {
  const { setView } = useAppState();
  // Lifted, because two things start a rename: clicking the title, and the
  // Rename item in the overflow menu.
  const [renaming, setRenaming] = useState(false);

  return (
    <div className={styles.root}>
      <Tooltip content="Back to My cases" relationship="label" withArrow>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={() => setView('myCases')}
          aria-label="Back to My cases"
          className={styles.back}
        />
      </Tooltip>

      <CaseTitle
        renaming={renaming}
        onStartRename={() => setRenaming(true)}
        onEndRename={() => setRenaming(false)}
      />
      <CaseActions
        onRename={() => setRenaming(true)}
        panelOpen={panelOpen}
        onTogglePanel={onTogglePanel}
      />
    </div>
  );
}
