import React from 'react';
import {
  Avatar,
  Toast,
  ToastTitle,
  Toaster,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { ChevronDown12Regular } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { CURRENT_USER } from '../../data/session.js';
import MicrosoftLogo from './MicrosoftLogo.jsx';
import styles from './TopBar.module.css';

/**
 * Every destination, named outright. The two reference entries used to sit behind
 * a Resources menu; a dropdown holding exactly two items spends a click hiding
 * what it has room to show, and it made the active section ambiguous — landing on
 * Learning lit up a trigger labelled something else. Creating a case is not here:
 * it is an action, and a row of navigation links is a poor place for a verb —
 * every destination carries its own create button on the page itself.
 */
const NAV_ITEMS = [
  { id: 'myCases', label: 'My cases' },
  { id: 'examples', label: 'Example cases' },
  { id: 'studies', label: 'Analyst studies' },
  { id: 'learning', label: 'Learning' },
];

/**
 * Global navigation, following the azure.microsoft.com header pattern:
 * Microsoft lockup, a vertical rule, the product name at a larger weight, then
 * regular-weight destinations, with utilities right-aligned.
 */
export default function TopBar() {
  const { view, setView } = useAppState();

  const toasterId = useId('nav-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const notImplemented = (label) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{label} is not part of this prototype</ToastTitle>
      </Toast>,
      { intent: 'info', position: 'top-end' },
    );

  // The builder is scoped to a case, so it has no nav item — while you are in
  // it, My Cases stays marked as the section you are working within.
  const activeId = view === 'builder' ? 'myCases' : view;

  return (
    <header className={styles.bar}>
      <Toaster toasterId={toasterId} />

      <a
        className={styles.msLink}
        href="#/"
        onClick={(e) => e.preventDefault()}
        aria-label="Microsoft"
      >
        <MicrosoftLogo size={21} />
      </a>

      <span className={styles.rule} aria-hidden="true" />

      {/* The product lockup goes to the landing page, the way the Azure
          wordmark goes to Azure home. */}
      <button
        type="button"
        className={styles.product}
        onClick={() => setView('landing')}
      >
        Security BCB
      </button>

      <nav className={styles.nav} aria-label="Primary">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.navLink} ${activeId === item.id ? styles.navLinkActive : ''}`}
                aria-current={activeId === item.id ? 'page' : undefined}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Neither a global search nor a create button lives here any more.
          Search had nothing to look across that the case list does not already
          filter in place. Create was inherited from azure.microsoft.com, whose
          filled top-right CTA is an acquisition button for anonymous visitors —
          it disappears the moment Azure becomes a signed-in tool at
          portal.azure.com, where that slot turns into search, settings and
          account. No signed-in Microsoft product puts a create action there, and
          every destination in this app already carries its own. */}
      <button type="button" className={styles.account} onClick={() => notImplemented('Account')}>
        <span className={styles.accountName}>{CURRENT_USER}</span>
        <Avatar name={CURRENT_USER} size={28} color="colorful" />
        <ChevronDown12Regular aria-hidden="true" className={styles.accountChevron} />
      </button>
    </header>
  );
}
