import React, { useMemo, useState } from 'react';
import {
  Card,
  Input,
  Tab,
  TabList,
  Toast,
  ToastTitle,
  Toaster,
  Tooltip,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { Search20Regular } from '@fluentui/react-icons';
import { ANALYST_STUDIES, STUDY_AREAS, STUDY_FORMATS } from '../../data/library.js';
import FeedbackBand from './FeedbackBand.jsx';
import styles from './Library.module.css';

/**
 * The analyst studies library.
 *
 * The page it replaces had three problems that were all the same problem. Four
 * studies sat in a Highlights band and then appeared again in the list below, so
 * a third of what you saw was duplicate. The list itself ran down the left of a
 * two-column layout with the right column empty. And every entry read "TEI of
 * Microsoft <something>", so nineteen links opened with the same four words and
 * the one distinguishing word landed wherever the product name happened to end.
 *
 * One list, filtered rather than duplicated; the product first; the methodology
 * and the format as badges. Format is a first-class filter because it decides
 * what the asset is *for* — the infographic goes to the customer, the full study
 * goes into the business case.
 */
export default function AnalystStudies() {
  const [area, setArea] = useState('all');
  const [query, setQuery] = useState('');

  const toasterId = useId('studies-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const counts = useMemo(
    () => ({
      all: ANALYST_STUDIES.length,
      ...Object.fromEntries(
        STUDY_AREAS.map((a) => [a.id, ANALYST_STUDIES.filter((s) => s.area === a.id).length]),
      ),
    }),
    [],
  );

  /* Filter the assets, then group them by product. The old page listed every
     asset separately, so "Microsoft 365 E3" was four consecutive entries
     distinguished only by a trailing word — and the reader had to notice that
     word to understand they were the same research in four wrappers. One card
     per product, with every format it exists in, says that outright. */
  const visible = useMemo(() => {
    let rows = ANALYST_STUDIES;
    if (area !== 'all') rows = rows.filter((s) => s.area === area);
    const q = query.trim().toLowerCase();
    if (q)
      rows = rows.filter((s) =>
        [s.product, s.covers, STUDY_FORMATS[s.format].label].join(' ').toLowerCase().includes(q),
      );

    const byProduct = new Map();
    rows.forEach((s) => {
      const group = byProduct.get(s.product);
      if (group) {
        group.assets.push(s);
        // The full study carries the description; a one-page cut of it does not
        // deserve to overwrite that with "the figures on one page".
        if (s.format === 'study') group.covers = s.covers;
        group.projected = group.projected || !!s.projected;
      } else {
        byProduct.set(s.product, {
          product: s.product,
          covers: s.covers,
          projected: !!s.projected,
          assets: [s],
        });
      }
    });
    return [...byProduct.values()];
  }, [area, query]);

  const open = (study) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{study.product} — not part of this prototype</ToastTitle>
      </Toast>,
      { intent: 'info', position: 'top-end' },
    );

  return (
    <div className={styles.root}>
      <Toaster toasterId={toasterId} />

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Analyst studies</h1>
          <p className={styles.lead}>
            The independent research behind the numbers this tool produces. Every study here is a
            Forrester Total Economic Impact commission — cite them for the benefit categories your
            case argues, and hand a customer the infographic rather than the full report.
          </p>
        </div>
        <p className={styles.headerCount}>
          <span className={styles.headerCountValue}>{ANALYST_STUDIES.length}</span>
          studies
        </p>
      </header>

      <div className={styles.toolbar}>
        <TabList
          selectedValue={area}
          onTabSelect={(_, d) => setArea(d.value)}
          className={styles.tabs}
        >
          <Tab value="all">
            All
            <span className={styles.tabCount}>{counts.all}</span>
          </Tab>
          {STUDY_AREAS.map((a) => (
            <Tab key={a.id} value={a.id}>
              {a.label}
              <span className={styles.tabCount}>{counts[a.id]}</span>
            </Tab>
          ))}
        </TabList>

        <div className={styles.controls}>
          <Input
            className={styles.search}
            value={query}
            onChange={(_, d) => setQuery(d.value)}
            placeholder="Search studies…"
            contentBefore={<Search20Regular />}
            aria-label="Search analyst studies"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>No study matches “{query}”.</p>
      ) : (
        <ul className={styles.grid}>
          {visible.map((group) => (
            <li key={group.product}>
              <Card className={styles.card}>
                <h2 className={styles.cardProduct}>{group.product}</h2>
                <p className={styles.cardCovers}>{group.covers}</p>
                <div className={styles.cardMeta}>
                  <div className={styles.formatRow}>
                    {group.assets.map((asset) => {
                      const format = STUDY_FORMATS[asset.format];
                      return (
                        <Tooltip
                          key={asset.id}
                          content={format.hint}
                          relationship="label"
                          withArrow
                        >
                          <button
                            type="button"
                            className={`${styles.formatBadge} ${
                              asset.format === 'study' ? styles.formatStudy : ''
                            }`}
                            onClick={() => open(asset)}
                          >
                            {format.label}
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>
                  {/* Security Copilot's is a projection rather than a measurement
                      of deployed customers, which changes how hard you can lean
                      on it in front of a CFO. */}
                  {group.projected ? <span className={styles.projected}>Projected</span> : null}
                  <span className={styles.publisher}>Forrester TEI</span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <FeedbackBand />
    </div>
  );
}
