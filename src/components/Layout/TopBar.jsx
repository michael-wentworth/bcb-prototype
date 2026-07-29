import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toast,
  ToastTitle,
  Toaster,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  Add20Filled,
  ChevronDown12Regular,
  Dismiss20Regular,
  Search20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import MicrosoftLogo from './MicrosoftLogo.jsx';
import styles from './TopBar.module.css';

/**
 * Global navigation, following the azure.microsoft.com header pattern:
 * Microsoft lockup, a vertical rule, the product name at a larger weight, then
 * regular-weight destinations, with utilities right-aligned.
 */
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

export default function TopBar({ isDark, onToggleTheme }) {
  const { view, setView, newCase } = useAppState();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

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

      <a className={styles.msLockup} href="#/" onClick={(e) => e.preventDefault()}>
        <MicrosoftLogo />
        <span className={styles.msWordmark}>Microsoft</span>
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

      <div className={styles.actions}>
        {searchOpen ? (
          <div className={styles.searchWrap}>
            <Input
              autoFocus
              value={query}
              onChange={(_, d) => setQuery(d.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchOpen(false);
              }}
              placeholder="Search business cases and analyst studies"
              contentBefore={<Search20Regular />}
              className={styles.searchInput}
              aria-label="Search"
            />
            <Button
              appearance="subtle"
              size="small"
              icon={<Dismiss20Regular />}
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            />
          </div>
        ) : (
          <button type="button" className={styles.searchTrigger} onClick={() => setSearchOpen(true)}>
            <span className={styles.searchLabel}>Search</span>
            <Search20Regular aria-hidden="true" />
          </button>
        )}

        <Tooltip
          content={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          relationship="label"
          withArrow
        >
          <Button
            appearance="subtle"
            icon={isDark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          />
        </Tooltip>

        <button type="button" className={styles.account} onClick={() => notImplemented('Account')}>
          <span className={styles.accountName}>Michael Wentworth</span>
          <Avatar name="Michael Wentworth" size={28} color="colorful" />
          <ChevronDown12Regular aria-hidden="true" className={styles.accountChevron} />
        </button>
      </div>
    </header>
  );
}
