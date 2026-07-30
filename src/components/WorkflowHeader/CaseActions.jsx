import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toast,
  ToastBody,
  ToastTitle,
  Toaster,
  ToggleButton,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  ArrowLeft20Regular,
  ArrowReset20Regular,
  DocumentPdf20Regular,
  MoreHorizontal20Regular,
  Rename20Regular,
  Settings20Regular,
  Share20Regular,
  Sparkle20Filled,
  Sparkle20Regular,
  SlideText20Regular,
} from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import SharePopover from '../shared/SharePopover.jsx';
import styles from './CaseActions.module.css';

/**
 * Everything that acts on the case rather than on a step.
 *
 * Three controls: the copilot toggle, Share, and one overflow. The toggle is here
 * rather than floating over the content because it has to be findable when the
 * panel is SHUT — a control that only exists once you have collapsed something is
 * one you must already know about to look for.
 */
export default function CaseActions({ onRename, panelOpen, onTogglePanel }) {
  const { setView, goToStep, reset } = useAppState();
  const [confirmReset, setConfirmReset] = useState(false);

  const toasterId = useId('case-actions-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const notify = (title, body) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{body}</ToastBody>
      </Toast>,
      { intent: 'success', position: 'top-end' },
    );

  return (
    <div className={styles.root} role="group" aria-label="Case actions">
      <Toaster toasterId={toasterId} />

      {/* Present whether the panel is open or shut — it only changes state.
          The old control existed solely in the collapsed state, which meant you
          had to already know it was there to find it. */}
      <Tooltip
        content={panelOpen ? 'Hide the copilot' : 'Show the copilot'}
        relationship="label"
        withArrow
      >
        <ToggleButton
          appearance="subtle"
          checked={!!panelOpen}
          onClick={onTogglePanel}
          icon={panelOpen ? <Sparkle20Filled /> : <Sparkle20Regular />}
          className={styles.copilot}
          aria-label={panelOpen ? 'Hide the copilot panel' : 'Show the copilot panel'}
          aria-controls="copilot-panel"
        >
          <span className={styles.copilotLabel}>Copilot</span>
        </ToggleButton>
      </Tooltip>

      <SharePopover onNameIt={onRename}>
        <Button appearance="secondary" icon={<Share20Regular />} className={styles.share}>
          {/* Hidden by CSS, not unmounted, so the button keeps one identity and
              the label is still there for assistive tech at every width. */}
          <span className={styles.shareLabel}>Share</span>
        </Button>
      </SharePopover>

      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Tooltip content="More case actions" relationship="label" withArrow>
            <Button
              appearance="subtle"
              icon={<MoreHorizontal20Regular />}
              aria-label="More case actions"
            />
          </Tooltip>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<Rename20Regular />} onClick={onRename}>
              Rename
            </MenuItem>
            <MenuItem icon={<Settings20Regular />} onClick={() => goToStep(0)}>
              Business case setup
            </MenuItem>

            <MenuDivider />

            <MenuItem
              icon={<SlideText20Regular />}
              onClick={() =>
                notify('PowerPoint generated', 'Executive deck — prototype, no file produced.')
              }
            >
              Download PowerPoint
            </MenuItem>
            <MenuItem
              icon={<DocumentPdf20Regular />}
              onClick={() =>
                notify('PDF generated', 'Full business case — prototype, no file produced.')
              }
            >
              Download PDF
            </MenuItem>

            <MenuDivider />

            {/* The builder had no in-context way out — the only exit was the
                global nav item, which is a destination rather than "leave this
                case". */}
            <MenuItem icon={<ArrowLeft20Regular />} onClick={() => setView('myCases')}>
              Back to My Cases
            </MenuItem>
            <MenuItem icon={<ArrowReset20Regular />} onClick={() => setConfirmReset(true)}>
              Start over
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      {/* Confirmed, because it clears every field and there is no undo. */}
      <Dialog open={confirmReset} onOpenChange={(_, d) => setConfirmReset(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Start over?</DialogTitle>
            <DialogContent>
              This clears every field in this case — the customer details, the solutions and
              everything written on the report. It cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                }}
              >
                Start over
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
