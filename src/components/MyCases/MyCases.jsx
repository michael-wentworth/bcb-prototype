import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  Add20Filled,
  ArrowSortDown20Regular,
  Open20Regular,
  Person20Regular,
  Search20Regular,
  Sparkle16Filled,
} from '@fluentui/react-icons';
import { CASE_STATUS, EXAMPLE_CASES, MY_CASES, caseMetrics } from '../../data/caseLibrary.js';
import { currencySymbol, geographyById } from '../../data/referenceData.js';
import { formatCurrency, formatPercent } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './MyCases.module.css';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Drafts' },
  { id: 'in-review', label: 'In review' },
  { id: 'published', label: 'Published' },
  { id: 'shared', label: 'Shared with me' },
];

const SORTS = [
  { id: 'modified', label: 'Last modified' },
  { id: 'title', label: 'Name (A–Z)' },
  { id: 'customer', label: 'Customer' },
];

export default function MyCases() {
  const { newCase, openCase, setView } = useAppState();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('modified');

  // "No cases at all" is a different state from "this filter matches nothing",
  // and only the first one hands the screen over to the empty state's hero.
  const hasAnyCases = MY_CASES.length > 0;

  const counts = useMemo(
    () => ({
      all: MY_CASES.length,
      draft: MY_CASES.filter((c) => c.status === 'draft').length,
      'in-review': MY_CASES.filter((c) => c.status === 'in-review').length,
      published: MY_CASES.filter((c) => c.status === 'published').length,
      shared: MY_CASES.filter((c) => c.shared).length,
    }),
    [],
  );

  const visible = useMemo(() => {
    let rows = [...MY_CASES];
    if (tab === 'shared') rows = rows.filter((c) => c.shared);
    else if (tab !== 'all') rows = rows.filter((c) => c.status === tab);

    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((c) =>
        [c.title, c.customer, c.industry, c.owner].some((v) => v.toLowerCase().includes(q)),
      );
    }

    const compare = {
      modified: (a, b) => a.modifiedOrder - b.modifiedOrder,
      title: (a, b) => a.title.localeCompare(b.title),
      customer: (a, b) => a.customer.localeCompare(b.customer),
    }[sort];

    return rows.sort(compare);
  }, [tab, query, sort]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Cases</h1>
          <p className={styles.subtitle}>
            Every business case you own or have been shared on — drafts through published.
          </p>
        </div>
        {/* Default size, not large. Fluent publishes no guidance for choosing
            large, and nothing ties button size to page-level versus chrome-level
            scope — so the only thing large was carrying was emphasis it did not
            need. Medium also matches the 32px search box and sort control
            directly beneath it, so the right edge reads as one column.

            Stands down when there are no cases at all: the empty state runs its
            own hero button, and two filled primaries on one screen is the thing
            this whole arrangement exists to avoid. A filter that matches nothing
            is NOT that case — the list still has cases, so the header keeps its
            button and the empty state shows none. */}
        {hasAnyCases ? (
          <Button appearance="primary" icon={<Add20Filled />} onClick={newCase}>
            New business case
          </Button>
        ) : null}
      </header>

      <div className={styles.toolbar}>
        <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value)} className={styles.tabs}>
          {TABS.map((t) => (
            <Tab key={t.id} value={t.id}>
              {t.label}
              <span className={styles.tabCount}>{counts[t.id]}</span>
            </Tab>
          ))}
        </TabList>

        <div className={styles.controls}>
          <Input
            className={styles.search}
            value={query}
            onChange={(_, d) => setQuery(d.value)}
            placeholder="Search cases, customers, owners…"
            contentBefore={<Search20Regular />}
            aria-label="Search my cases"
          />
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="subtle" icon={<ArrowSortDown20Regular />}>
                {SORTS.find((s) => s.id === sort).label}
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {SORTS.map((s) => (
                  <MenuItem key={s.id} onClick={() => setSort(s.id)}>
                    {s.label}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          query={query}
          onNew={newCase}
          onExamples={() => setView('examples')}
          onOpenExample={() => openCase(EXAMPLE_CASES[0])}
        />
      ) : (
        <ul className={styles.list}>
          {visible.map((entry) => (
            <CaseRow key={entry.id} entry={entry} onOpen={() => openCase(entry)} />
          ))}
        </ul>
      )}

      {/* Examples double as onboarding — the fastest way to understand what a
          finished case looks like is to read one. */}
      <section className={styles.examples}>
        <div className={styles.examplesHead}>
          <div>
            <h2 className={styles.examplesTitle}>Example cases</h2>
            <p className={styles.examplesLead}>
              Finished cases published by Microsoft. Open one to see how it is put together.
            </p>
          </div>
          <Button appearance="secondary" onClick={() => setView('examples')}>
            See all examples
          </Button>
        </div>
        <div className={styles.exampleGrid}>
          {EXAMPLE_CASES.slice(0, 3).map((entry) => {
            const m = caseMetrics(entry);
            const symbol = currencySymbol(
              geographyById(entry.input.customer.geography)?.currency || 'USD',
            );
            return (
              <button
                key={entry.id}
                type="button"
                className={styles.exampleCard}
                onClick={() => openCase(entry)}
              >
                <span className={styles.exampleCustomer}>{entry.customer}</span>
                <span className={styles.exampleTitle}>{entry.title}</span>
                <span className={styles.exampleHighlight}>{entry.highlight}</span>
                <span className={styles.exampleStats}>
                  <strong>{formatPercent(m.roi)}</strong> ROI ·{' '}
                  <strong>{formatCurrency(m.annualNetBenefit, { symbol })}</strong> a year
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CaseRow({ entry, onOpen }) {
  const m = caseMetrics(entry);
  const status = CASE_STATUS[entry.status] || CASE_STATUS.draft;
  const symbol = currencySymbol(geographyById(entry.input.customer.geography)?.currency || 'USD');

  return (
    <li className={styles.row}>
      <button type="button" className={styles.rowHit} onClick={onOpen}>
        <span className={styles.srOnly}>Open {entry.title}</span>
      </button>

      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <Badge appearance="tint" size="small" color={status.color}>
            {status.label}
          </Badge>
          {entry.shared ? (
            <span className={styles.sharedTag}>
              <Person20Regular aria-hidden="true" />
              Shared with me
            </span>
          ) : null}
        </div>
        <h3 className={styles.rowTitle}>{entry.title}</h3>
        <p className={styles.rowMeta}>
          {entry.customer} · {entry.industry} ·{' '}
          {Number(entry.input.customer.numberOfUsers).toLocaleString('en-US')} users ·{' '}
          {entry.input.caseSetup.analysisPeriod}-year
        </p>
      </div>

      <div className={styles.rowStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>ROI</span>
          <span className={styles.statValue}>{formatPercent(m.roi)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Net / year</span>
          <span className={styles.statValue}>
            {formatCurrency(m.annualNetBenefit, { symbol })}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Payback</span>
          <span className={styles.statValue}>
            {m.paybackMonths ? `${m.paybackMonths} mo` : '—'}
          </span>
        </div>
      </div>

      <div className={styles.rowOwner}>
        <Avatar name={entry.owner} size={24} color="colorful" />
        <span className={styles.ownerText}>{entry.owner}</span>
        <span className={styles.modified}>{entry.modified}</span>
      </div>

      <div className={styles.rowAction}>
        <Button appearance="subtle" icon={<Open20Regular />} onClick={onOpen}>
          Open
        </Button>
      </div>
    </li>
  );
}

function EmptyState({ query, onNew, onExamples, onOpenExample }) {
  if (query.trim()) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No matches</p>
        <p className={styles.emptyText}>Nothing matches “{query.trim()}”.</p>
      </div>
    );
  }
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No cases here yet</p>
      <p className={styles.emptyText}>
        Start one from scratch, or read a finished example first — it is the quickest way to see what
        a complete case looks like.
      </p>
      <div className={styles.emptyActions}>
        <Button appearance="primary" icon={<Add20Filled />} onClick={onNew}>
          New business case
        </Button>
        <Button appearance="secondary" icon={<Sparkle16Filled />} onClick={onOpenExample}>
          Open an example
        </Button>
        <Button appearance="transparent" onClick={onExamples}>
          Browse all examples
        </Button>
      </div>
    </div>
  );
}
