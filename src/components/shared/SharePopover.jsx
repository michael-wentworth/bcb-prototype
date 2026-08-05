import React, { useState } from 'react';
import {
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Toast,
  ToastBody,
  ToastTitle,
  Toaster,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  DocumentPdf20Regular,
  Link20Regular,
  SlideText20Regular,
} from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { SIGNALS } from '../../data/signals.js';
import { CASE_STATUS } from '../../data/caseLibrary.js';
import { CURRENT_USER } from '../../data/session.js';
import styles from './SharePopover.module.css';

/**
 * Handing the case to someone else. One component behind both the button in the
 * step band and the one on the report, so the two surfaces cannot drift.
 *
 * A flyout rather than a dialog: the band is a toolbar, and a modal scrim for a
 * copy-link is ceremony. It also keeps the case visible behind it on a projector.
 *
 * Everything here is real state. There is deliberately no recipient picker and no
 * permissions dropdown — a stakeholder who chooses "Can edit" and hits Send has
 * been told something false about a prototype with no backend.
 */
export default function SharePopover({ children, onNameIt }) {
  const { caseSetup, customer, activeCaseId, activeCaseOwner, activeCaseStatus, recordSignal } =
    useAppState();
  const [open, setOpen] = useState(false);

  const toasterId = useId('share-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const notify = (title, body) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{body}</ToastBody>
      </Toast>,
      { intent: 'success', position: 'top-end' },
    );

  const name = caseSetup.name?.trim() || '';
  const meta = [
    customer.accountName,
    caseSetup.analysisPeriod ? `${caseSetup.analysisPeriod}-year` : '',
    CASE_STATUS[activeCaseStatus]?.label,
  ]
    .filter(Boolean)
    .join(' · ');

  // `shared` on a seeded case means shared *to* you, so ownership is the honest
  // test — the Litware case is owned by a colleague, not by whoever is signed in.
  const ownedByMe = activeCaseOwner === CURRENT_USER;

  const copyLink = async () => {
    // Derived, never a hard-coded microsoft.com URL: a fabricated domain on
    // screen is exactly the detail that ends up in someone's screenshot.
    const link = `${window.location.origin}/case/${activeCaseId ?? 'draft'}`;
    try {
      await navigator.clipboard.writeText(link);
      notify('Share link copied', 'Prototype — nothing left the browser.');
    } catch {
      // Clipboard needs a secure context; localhost is fine, a plain-http LAN
      // address is not, and failing silently would look like a dead button.
      notify('Share link created', 'Copy was blocked by the browser, so nothing was written.');
    }
    setOpen(false);
  };

  return (
    <>
      <Toaster toasterId={toasterId} />
      <Popover
        open={open}
        onOpenChange={(_, d) => setOpen(d.open)}
        positioning="below-end"
        withArrow
      >
        <PopoverTrigger disableButtonEnhancement>{children}</PopoverTrigger>

        <PopoverSurface className={styles.surface}>
          <h3 className={styles.heading}>Share this business case</h3>

          {/* The one place the name is shown in full. That is what makes
              truncating it in the band acceptable. */}
          <div className={styles.identity}>
            <span className={styles.name} data-empty={name ? undefined : 'true'}>
              {name || 'Untitled business case'}
            </span>
            {meta ? <span className={styles.meta}>{meta}</span> : null}
          </div>

          <p className={styles.owner}>
            {ownedByMe ? `Owned by ${CURRENT_USER}` : `Shared with you by ${activeCaseOwner}`}
          </p>

          {name ? null : (
            <div className={styles.warn}>
              <span>This case has no name — the link would show “Untitled business case”.</span>
              {onNameIt ? (
                <Button
                  appearance="transparent"
                  size="small"
                  onClick={() => {
                    setOpen(false);
                    onNameIt();
                  }}
                >
                  Name it
                </Button>
              ) : null}
            </div>
          )}

          <span className={styles.divider} aria-hidden="true" />

          <div className={styles.actions}>
            {/* Copying the link is the one action here with a real side effect,
                and the closest thing the prototype has to "this went to somebody".
                A case worth sharing is a stronger endorsement than any rating. */}
            <Button
              icon={<Link20Regular />}
              onClick={() => {
                recordSignal(SIGNALS.REPORT_SHARED, { via: 'link' });
                copyLink();
              }}
              disabled={!name}
            >
              Copy link
            </Button>
            <Button
              icon={<SlideText20Regular />}
              onClick={() => {
                recordSignal(SIGNALS.REPORT_DOWNLOADED, { format: 'pptx', from: 'share' });
                notify('PowerPoint generated', 'Executive deck — prototype, no file produced.');
              }}
            >
              PowerPoint
            </Button>
            <Button
              icon={<DocumentPdf20Regular />}
              onClick={() => {
                recordSignal(SIGNALS.REPORT_DOWNLOADED, { format: 'pdf', from: 'share' });
                notify('PDF generated', 'Full business case — prototype, no file produced.');
              }}
            >
              PDF
            </Button>
          </div>

          <p className={styles.caption}>
            Recipients and permissions are not wired up in this prototype.
          </p>
        </PopoverSurface>
      </Popover>
    </>
  );
}
