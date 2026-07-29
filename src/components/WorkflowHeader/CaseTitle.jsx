import React, { useEffect, useRef, useState } from 'react';
import { Input, Tooltip } from '@fluentui/react-components';
import { Edit16Regular } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { CASE_STATUS } from '../../data/caseLibrary.js';
import styles from './CaseTitle.module.css';

/**
 * Which case you are in, in the band that holds the steps — the way a document
 * name sits above a document rather than inside it.
 *
 * The name shown here is `caseSetup.name`, the same value the "Business Case
 * Name" field on step 1 writes and the report titles itself with. Three surfaces,
 * one value: it cannot drift.
 *
 * Click the name to rename it. The edit is a local draft committed on Enter or
 * blur, never per keystroke — `caseSetup.name` is a heading elsewhere in the app,
 * and writing on every keystroke makes those headings flicker letter by letter.
 */
export default function CaseTitle({ renaming, onStartRename, onEndRename }) {
  const { caseSetup, customer, activeCaseStatus, setCaseSetup } = useAppState();
  const name = caseSetup.name || '';
  const [draft, setDraft] = useState(name);
  const inputRef = useRef(null);

  // Entering rename seeds the draft from whatever is committed now.
  useEffect(() => {
    if (renaming) setDraft(name);
  }, [renaming, name]);

  const commit = () => {
    const next = draft.trim();
    // An empty name is never written from here. Clearing it is step 1's job,
    // where the field is labelled required and the consequence is visible.
    if (next && next !== name) setCaseSetup('name', next);
    onEndRename();
  };

  // Read-only here on purpose: changing the analysis period rebuilds every SKU
  // row's seat schedule, so it belongs on step 1 beside the table it reshapes.
  const meta = [
    customer.accountName,
    caseSetup.analysisPeriod ? `${caseSetup.analysisPeriod}-year` : '',
    CASE_STATUS[activeCaseStatus]?.label,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={styles.root}>
      <div className={styles.nameRow}>
        {renaming ? (
          <Input
            ref={inputRef}
            className={styles.editInput}
            size="medium"
            appearance="filled-lighter"
            maxLength={100}
            autoFocus
            value={draft}
            aria-label="Business case name"
            placeholder="Name this business case"
            onFocus={(e) => e.target.select()}
            onChange={(_, d) => setDraft(d.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(name);
                onEndRename();
              }
            }}
          />
        ) : (
          <Tooltip content={name || 'Name this business case'} relationship="label" withArrow>
            <button type="button" className={styles.titleButton} onClick={onStartRename}>
              {/* An unnamed case gets a dashed rule rather than a confident
                  title, so it reads as an empty field and not as a case someone
                  genuinely called "Untitled business case". */}
              <span className={styles.titleText} data-empty={name ? undefined : 'true'}>
                {name || 'Untitled business case'}
              </span>
              <Edit16Regular className={styles.pencil} aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>

      {meta ? <div className={styles.meta}>{meta}</div> : null}
    </div>
  );
}
