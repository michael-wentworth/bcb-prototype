import React, { useState } from 'react';
import CaseTitle from './CaseTitle.jsx';
import CaseActions from './CaseActions.jsx';
import styles from './WorkflowHeader.module.css';

/**
 * The case-scoped band: which case you are in on the left, the controls that act
 * on the case as a whole on the right.
 *
 * The stepper used to sit between them, which meant the step was named here and
 * again in the page heading below. It now lives with that heading, as
 * shared/StepMasthead.jsx — so this band is about the case and nothing else.
 */
export default function WorkflowHeader() {
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
      <CaseActions onRename={() => setRenaming(true)} />
    </div>
  );
}
