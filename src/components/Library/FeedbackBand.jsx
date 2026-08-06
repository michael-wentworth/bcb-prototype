import React from 'react';
import { Button, Toast, ToastTitle, Toaster, useId, useToastController } from '@fluentui/react-components';
import styles from './Library.module.css';

/**
 * The feedback band both reference pages carry.
 *
 * Kept because it is the only route a seller has back to the team that owns
 * these libraries, and a library nobody can correct goes stale. The original
 * ran a full-bleed mesh gradient behind it, which competed with the content
 * above; a flat brand tint says the same thing without pulling the eye off the
 * list.
 */
export default function FeedbackBand() {
  const toasterId = useId('feedback-toaster');
  const { dispatchToast } = useToastController(toasterId);

  return (
    <section className={styles.feedback}>
      <Toaster toasterId={toasterId} />
      <h2 className={styles.feedbackTitle}>Have feedback?</h2>
      <p className={styles.feedbackLead}>
        Tell us what is missing from this library
      </p>
      <Button
        appearance="primary"
        onClick={() =>
          dispatchToast(
            <Toast>
              <ToastTitle>Feedback is not part of this prototype</ToastTitle>
            </Toast>,
            { intent: 'info', position: 'top-end' },
          )
        }
      >
        Submit feedback
      </Button>
    </section>
  );
}
