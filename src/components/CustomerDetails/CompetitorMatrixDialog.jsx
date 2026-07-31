import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
} from '@fluentui/react-components';
import { Dismiss20Regular, Search20Regular } from '@fluentui/react-icons';
import { COMPETITOR_CATALOGUE } from '../../data/referenceData.js';
import { formatCurrency } from '../../data/model.js';
import styles from './CompetitorMatrixDialog.module.css';

const PAGE_SIZE = 20;

/**
 * Browse-and-multi-select over the competitor catalogue.
 *
 * The seller is picking several incumbents at once — an estate usually has four
 * or five — so this commits to multi-select rather than closing after each pick.
 * Selection SURVIVES paging and filtering: someone who selects two on page one,
 * searches for a third, then clears the search must not silently lose the first
 * two. That is why the count in the footer counts the whole selection and not
 * what happens to be on screen.
 */
export default function CompetitorMatrixDialog({ open, onOpenChange, onAdd, symbol = '$' }) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(() => new Set());
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMPETITOR_CATALOGUE;
    return COMPETITOR_CATALOGUE.filter(
      (c) => c.product.toLowerCase().includes(q) || c.solution.toLowerCase().includes(q),
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const reset = () => {
    setPicked(new Set());
    setQuery('');
    setPage(0);
  };

  const commit = () => {
    COMPETITOR_CATALOGUE.filter((c) => picked.has(c.id)).forEach(onAdd);
    reset();
    onOpenChange(false);
  };

  const search = (value) => {
    setQuery(value);
    setPage(0); // a filtered list has different pages; staying on page 3 shows nothing
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(_, d) => {
        if (!d.open) reset();
        onOpenChange(d.open);
      }}
    >
      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle className={styles.title}>
            <div className={styles.titleRow}>
              <div>
                <span className={styles.titleText}>Competitor product matrix</span>
                <span className={styles.subtitle}>
                  Reference pricing used to prefill a row. Every figure is indicative — replace it
                  with what the customer actually pays.
                </span>
              </div>
              <div className={styles.titleTools}>
                <Input
                  className={styles.search}
                  value={query}
                  onChange={(_, d) => search(d.value)}
                  placeholder="Search capability or product"
                  contentBefore={<Search20Regular />}
                  aria-label="Search the competitor matrix"
                />
                <Button
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  aria-label="Close"
                  onClick={() => {
                    reset();
                    onOpenChange(false);
                  }}
                />
              </div>
            </div>
          </DialogTitle>

          <DialogContent className={styles.content}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.checkCol}>
                      <span className={styles.srOnly}>Select</span>
                    </th>
                    <th scope="col">Capability</th>
                    <th scope="col">Competitor product</th>
                    <th scope="col" className={styles.numeric}>
                      Annual cost
                    </th>
                    <th scope="col">License type</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.empty}>
                        No product matches &ldquo;{query}&rdquo;. Close this and use{' '}
                        <strong>Add a product that is not listed</strong> to enter it by hand.
                      </td>
                    </tr>
                  ) : (
                    rows.map((c) => (
                      <tr
                        key={c.id}
                        className={picked.has(c.id) ? styles.rowOn : undefined}
                        onClick={() => toggle(c.id)}
                      >
                        <td className={styles.checkCol}>
                          <Checkbox
                            checked={picked.has(c.id)}
                            onChange={() => toggle(c.id)}
                            /* The row handles the click; without this the label
                               would fire the handler a second time and cancel it. */
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${c.product}`}
                          />
                        </td>
                        <td>{c.solution}</td>
                        <td className={styles.product}>{c.product}</td>
                        <td className={styles.numeric}>
                          {formatCurrency(c.annualCost, { symbol, compact: false })}
                        </td>
                        <td>{c.licenseType}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DialogContent>

          <div className={styles.footer}>
            <span className={styles.showing}>
              {filtered.length === 0
                ? 'No matches'
                : `Showing ${current * PAGE_SIZE + 1}–${Math.min(
                    filtered.length,
                    current * PAGE_SIZE + PAGE_SIZE,
                  )} of ${filtered.length}`}
              {picked.size > 0 ? ` · ${picked.size} selected` : ''}
            </span>

            <div className={styles.footerActions}>
              <Button
                appearance="subtle"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                Previous
              </Button>
              <span className={styles.pageOf}>
                Page {current + 1} of {pageCount}
              </span>
              <Button
                appearance="subtle"
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                Next
              </Button>
              <Button appearance="primary" disabled={picked.size === 0} onClick={commit}>
                {picked.size > 0 ? `Add ${picked.size} product${picked.size === 1 ? '' : 's'}` : 'Add products'}
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
