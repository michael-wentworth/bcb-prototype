import React from 'react';
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toast,
  ToastTitle,
  Toaster,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { Add20Filled, ChevronDown12Regular } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { CURRENT_USER } from '../../data/session.js';
import MicrosoftLogo from './MicrosoftLogo.jsx';
import styles from './TopBar.module.css';

/**
 * Primary nav is only the places you *work*. Reference material collapses into
 * one Resources entry, and creating a case is a persistent action rather than a
 * destination — it used to be reachable only through the marketing page.
 */
const NAV_ITEMS = [
  { id: 'myCases', label: 'My Cases' },
  { id: 'examples', label: 'Example Cases' },
];

const RESOURCES = [
  { id: 'studies', label: 'Analyst Studies' },
  { id: 'learning', label: 'Learning' },
];

/**
 * Global navigation, following the azure.microsoft.com header pattern:
 * Microsoft lockup, a vertical rule, the product name at a larger weight, then
 * regular-weight destinations, with utilities right-aligned.
 */
export default function TopBar() {
  const { view, setView, newCase } = useAppState();

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
        title="Security BCB home"
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
          <li>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <button
                  type="button"
                  className={`${styles.navLink} ${
                    RESOURCES.some((r) => r.id === activeId) ? styles.navLinkActive : ''
                  }`}
                >
                  Resources
                  <ChevronDown12Regular aria-hidden="true" className={styles.navChevron} />
                </button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {RESOURCES.map((r) => (
                    <MenuItem key={r.id} onClick={() => setView(r.id)}>
                      {r.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>
          </li>
        </ul>
      </nav>

      <Button appearance="primary" icon={<Add20Filled />} onClick={newCase} className={styles.cta}>
        New business case
      </Button>

      {/* Global search lived here, but it had nothing to search across that the
          case list does not already filter in place. The one search that earns
          its keep is on My Cases, scoped to the rows in front of you. */}
      <button type="button" className={styles.account} onClick={() => notImplemented('Account')}>
        <span className={styles.accountName}>{CURRENT_USER}</span>
        <Avatar name={CURRENT_USER} size={28} color="colorful" />
        <ChevronDown12Regular aria-hidden="true" className={styles.accountChevron} />
      </button>
    </header>
  );
}
