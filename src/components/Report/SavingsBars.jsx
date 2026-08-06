import React from 'react';
import { formatCurrency } from '../../data/model.js';
import styles from './Report.module.css';

/**
 * What each displaced contract is worth across the horizon.
 *
 * Section 6 counts vendors coming off the estate. A count invites the question
 * it cannot answer, which is which of them the saving actually rests on, and
 * the answer is rarely even: one contract usually carries most of it.
 *
 * Bars rather than a table because the shape is the point. Sorted, so the
 * longest bar is the one to defend first.
 */
export default function SavingsBars({ rows, total, years, symbol = '$' }) {
  if (!rows.length) return null;
  const money = (v) => formatCurrency(v, { symbol });

  /* A contract counts as displaceable on its capabilities and its end date
     alone, so one whose cost the seller has not typed yet arrives here worth
     nothing. Drawn, it is a green bar at the minimum width labelled $0, which
     reads as a saving too small to see rather than as a gap in the case. */
  const priced = rows.filter((r) => r.saved > 0);
  const unpriced = rows.length - priced.length;
  if (!priced.length) {
    return (
      <p className={styles.cardLead}>
        {unpriced === 1
          ? 'One displaced contract has no cost entered, so there is nothing to price yet.'
          : `${unpriced} displaced contracts have no cost entered, so there is nothing to price yet.`}
      </p>
    );
  }

  const max = Math.max(...priced.map((r) => r.saved), 1);

  return (
    <div className={styles.savings}>
      <ul className={styles.savingsList}>
        {priced.map((r) => (
          <li key={r.id} className={styles.savingsRow}>
            <span className={styles.savingsName}>{r.vendor}</span>
            <span className={styles.savingsTrack}>
              <span
                className={styles.savingsBar}
                style={{ width: `${Math.max(2, (r.saved / max) * 100)}%` }}
              />
            </span>
            <span className={styles.savingsValue}>{money(r.saved)}</span>
          </li>
        ))}
      </ul>

      <div className={styles.savingsTotal}>
        <span className={styles.savingsTotalValue}>
          {formatCurrency(total, { symbol, compact: false })}
        </span>
        {/* Every other total on this page carries its period. These bars are
            horizon figures on a page that also prints the same savings
            annually, so without one a reader can be wrong by the horizon. */}
        <span className={styles.savingsTotalLabel}>Saved over {years} years</span>
      </div>

      {unpriced ? (
        <p className={styles.cardLead}>
          {unpriced === 1
            ? 'One more contract is displaced but has no cost entered.'
            : `${unpriced} more contracts are displaced but have no cost entered.`}
        </p>
      ) : null}
    </div>
  );
}
