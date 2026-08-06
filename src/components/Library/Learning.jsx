import React from 'react';
import { Button, Card, Toast, ToastTitle, Toaster, Tooltip, useId, useToastController } from '@fluentui/react-components';
import {
  BookOpen24Regular,
  Chat20Regular,
  DocumentText24Regular,
  Play24Filled,
  Shield24Regular,
} from '@fluentui/react-icons';
import { LEARNING_FORMATS, LEARNING_RESOURCES } from '../../data/library.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FeedbackBand from './FeedbackBand.jsx';
import styles from './Library.module.css';

const FORMAT_ICON = {
  guide: <DocumentText24Regular />,
  video: <Play24Filled />,
  'case-study': <BookOpen24Regular />,
  training: <Shield24Regular />,
};

/**
 * The learning library.
 *
 * Eight assets, which is few enough that filtering them would be furniture — so
 * this page groups rather than filters, unlike Analyst studies next door. What
 * it does share is the correction: every entry on the old page began "Security
 * BCB", on a page inside the Security BCB, so eight links opened with the same
 * two words and the topic arrived third.
 *
 * The old Highlights band held the guide and the intro video and then listed
 * both again under General, so a quarter of the page was a duplicate of the
 * other quarter. They keep the prominence and lose the second appearance.
 *
 * The Teams group is a card rather than a clause. The old intro asked you to
 * join it and then gave you no way to.
 */
export default function Learning() {
  const { newCase } = useAppState();
  const toasterId = useId('learning-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const notReal = (label) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{label} is not part of this prototype</ToastTitle>
      </Toast>,
      { intent: 'info', position: 'top-end' },
    );

  const start = LEARNING_RESOURCES.filter((r) => r.start);
  const training = LEARNING_RESOURCES.filter((r) => !r.start);

  const badge = (resource) => {
    const format = LEARNING_FORMATS[resource.format];
    return (
      <Tooltip content={format.hint} relationship="description" withArrow>
        <span
          className={`${styles.formatBadge} ${
            resource.format === 'video' ? styles.formatStudy : ''
          }`}
        >
          {format.label}
        </span>
      </Tooltip>
    );
  };

  return (
    <div className={styles.root}>
      <Toaster toasterId={toasterId} />

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Learning</h1>
          <p className={styles.lead}>
            How to use this tool: a guide, a walkthrough, and enablement for each solution area
          </p>
        </div>
      </header>

      {/* ------------------------------ start here ---------------------------- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Start here</h2>
        <ul className={styles.startGrid}>
          {start.map((resource) => (
            <li key={resource.id}>
              <Card className={styles.startCard}>
                <button
                  type="button"
                  className={styles.cardHit}
                  onClick={() => notReal(resource.title)}
                >
                  <span className={styles.srOnly}>Open {resource.title}</span>
                </button>
                <span className={styles.startIcon} aria-hidden="true">
                  {FORMAT_ICON[resource.format]}
                </span>
                <div className={styles.startBody}>
                  <h3 className={styles.startTitle}>{resource.title}</h3>
                  <p className={styles.cardCovers}>{resource.blurb}</p>
                  <div className={styles.formatRow}>
                    {badge(resource)}
                    {resource.published ? (
                      <span className={styles.projected}>{resource.published}</span>
                    ) : null}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------- training ----------------------------- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Training</h2>
        <p className={styles.sectionLead}>
          One deck per solution area, plus a customer scenario to build alongside
        </p>
        <ul className={styles.grid}>
          {training.map((resource) => (
            <li key={resource.id}>
              <Card className={styles.card}>
                <button
                  type="button"
                  className={styles.cardHit}
                  onClick={() => notReal(resource.title)}
                >
                  <span className={styles.srOnly}>Open {resource.title}</span>
                </button>
                <h3 className={styles.cardProduct}>{resource.title}</h3>
                <p className={styles.cardCovers}>{resource.blurb}</p>
                <div className={styles.cardMeta}>
                  <div className={styles.formatRow}>{badge(resource)}</div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------- Teams ------------------------------- */}
      <section className={styles.teams}>
        <span className={styles.teamsIcon} aria-hidden="true">
          <Chat20Regular />
        </span>
        <div className={styles.teamsBody}>
          <h2 className={styles.teamsTitle}>The BCB Teams group</h2>
          <p className={styles.teamsLead}>
            Announcements, releases, and somewhere to ask questions
          </p>
        </div>
        <div className={styles.teamsActions}>
          <Button appearance="primary" onClick={() => notReal('The BCB Teams group')}>
            Join the group
          </Button>
          <Button appearance="secondary" onClick={newCase}>
            Create business case
          </Button>
        </div>
      </section>

      <FeedbackBand />
    </div>
  );
}
