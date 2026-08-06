import React, { useState } from 'react';
import { Card } from '@fluentui/react-components';
import { ChevronDown16Regular, ChevronRight16Regular, Sparkle16Filled } from '@fluentui/react-icons';
import { formatCurrency } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './Capability.module.css';

/**
 * What the recommendation costs, previewed on the step that makes it.
 *
 * A preview, not the report. Everything here is ANNUAL and there are exactly
 * three figures, because the question this answers is "roughly, does this pay
 * for itself" — the horizon, the payback curve and the contract-by-contract
 * ledger all belong on step 3 and would turn this into the spreadsheet it
 * exists to replace.
 *
 * The investment shown is the uplift, not the whole Microsoft bill. That is the
 * same basis step 3 reports on, and the two disagreeing about the size of the
 * same deal is the fastest way to lose trust in both.
 */
export default function LicensingImpact() {
  const { capabilityCase } = useAppState();
  const [open, setOpen] = useState(false);
  const c = capabilityCase;

  if (!c.hasInputs) return null;

  const money = (v) => formatCurrency(v, { symbol: '$' });
  const exact = (v) => formatCurrency(v, { symbol: '$', compact: false });

  /* Annual, and only what the model can defend. `stops` is the spend from
     contracts that genuinely lapse inside the horizon; `continues` is the spend
     on contracts that cover something this move does not deliver, which is the
     honest version of the spreadsheet's "matching functionality" line — it is
     not netted off, because it runs either way. */
  const stops = c.competitorLines
    .filter((l) => l.displaceable)
    .reduce((sum, l) => sum + l.annualCost, 0);
  /* Everything the model will not count, kept as lines rather than a total.
     `!displaceable` is four different verdicts wearing one coat — covers nothing
     this move adds, net-new rather than a displacement, blocked pending a
     confirmation, or lapsing after the horizon — and only the first is "spend
     that continues". The model already writes the right sentence for each, and
     the contract list on this same step prints it, so the card reads it too
     instead of inventing a blanket one that is wrong for half of them. */
  const uncounted = c.competitorLines.filter((l) => !l.displaceable && l.annualCost > 0);
  const continues = uncounted.reduce((sum, l) => sum + l.annualCost, 0);
  /* The steady-state year, not year one. incrementalAnnual is microsoftByYear[0],
     which on a phased rollout is the cheapest year and can be zero outright — a
     case ramping from 1,200 seats would have shown "Microsoft investment $0"
     beside a saving, while years two and three cost the full amount. Both
     figures on this card are run-rates once everything has landed, which is the
     only way "a year" is true of either of them. */
  const byYear = c.microsoftByYear || [];
  const uplift = byYear.length ? byYear[byYear.length - 1] : c.incrementalAnnual;
  const net = stops - uplift;
  const ramps = byYear.length > 1 && byYear.some((v) => v !== byYear[byYear.length - 1]);

  const scale = Math.max(stops, uplift) || 1;
  const pct = (v) => `${Math.max(v > 0 ? 3 : 0, (v / scale) * 100)}%`;

  /* Written from the numbers rather than picked from a list of sentences, so it
     cannot say the opposite of the figures beside it. */
  const context = () => {
    if (c.competitorLines.length === 0) {
      return `No vendors named yet, so the whole ${money(uplift)} a year is new spend.`;
    }
    if (stops === 0) {
      return `Nothing named can be switched off inside the horizon, so the ${money(uplift)} a year stands on capability, not savings.`;
    }
    if (net >= 0) {
      return `Saves ${money(net)} a year after the Microsoft investment.`;
    }
    const covered = Math.round((stops / uplift) * 100);
    return `Covers ${covered}% of the Microsoft investment, leaving ${money(Math.abs(net))} a year of additional licensing.`;
  };

  return (
    <Card className={styles.card}>
      {/* No lead paragraph. The column labels say what each figure is and the
          copilot line below says what it means — a third explanation cost 30px
          of a card whose whole point is being short. */}
      <h2 className={styles.cardTitle}>Licensing impact preview</h2>

      {/* Two figures and the gap between them. Each bar is labelled by the
          figure above it, so there is nothing for a legend to explain. */}
      <div className={styles.impactRow} role="group" aria-live="polite" aria-label="Licensing impact, annual">
        <div className={styles.impactCol}>
          <span className={styles.impactLabel}>Competitor spend that stops</span>
          <span className={styles.impactValue}>{money(stops)}</span>
          <span className={styles.impactBar} aria-hidden="true">
            <span className={styles.impactFillStops} style={{ width: pct(stops) }} />
          </span>
          <span className={styles.impactNote}>a year, once contracts lapse</span>
        </div>
        <div className={styles.impactCol}>
          <span className={styles.impactLabel}>Microsoft investment</span>
          <span className={styles.impactValue}>{money(uplift)}</span>
          <span className={styles.impactBar} aria-hidden="true">
            <span className={styles.impactFillUplift} style={{ width: pct(uplift) }} />
          </span>
          <span className={styles.impactNote}>
            a year above what the customer pays today{ramps ? ', once fully rolled out' : ''}
          </span>
        </div>
        <div className={`${styles.impactCol} ${styles.impactNet}`}>
          <span className={styles.impactLabel}>Net impact</span>
          <span
            className={`${styles.impactValue} ${net >= 0 ? styles.impactGood : styles.impactBad}`}
          >
            {net >= 0 ? money(net) : `−${money(Math.abs(net))}`}
          </span>
          <span className={styles.impactNote}>a year</span>
        </div>
      </div>

      <p className={styles.impactContext}>
        <Sparkle16Filled className={styles.impactSparkle} aria-hidden="true" />
        <span>{context()}</span>
      </p>

      <button
        type="button"
        className={styles.impactToggle}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown16Regular aria-hidden="true" /> : <ChevronRight16Regular aria-hidden="true" />}
        {open ? 'Hide details' : 'View details'}
      </button>

      {open ? (
        <dl className={styles.impactDetails}>
          <div className={styles.impactDetailRow}>
            <dt>Competitor spend reduction</dt>
            <dd className={styles.impactGood}>+{exact(stops)}</dd>
          </div>
          <div className={styles.impactDetailRow}>
            <dt>
              Microsoft licensing cost
              <span className={styles.impactDetailNote}>
                The increase, not the whole bill
              </span>
            </dt>
            <dd className={styles.impactBad}>−{exact(uplift)}</dd>
          </div>
          <div className={`${styles.impactDetailRow} ${styles.impactDetailNet}`}>
            <dt>Net license cost {net >= 0 ? 'saving' : 'increase'}</dt>
            <dd className={net >= 0 ? styles.impactGood : styles.impactBad}>
              {net >= 0 ? `+${exact(net)}` : `−${exact(Math.abs(net))}`}
            </dd>
          </div>
          {/* Outside the sum on purpose: this spend runs whichever way the
              decision goes, so netting it off would overstate the cost of the
              move by the size of a bill the customer pays anyway. */}
          {continues > 0 ? (
            <div className={styles.impactDetailRow}>
              <dt>
                Competitor spend not counted
                <ul className={styles.impactReasons}>
                  {uncounted.map((l) => (
                    <li key={l.id}>
                      <strong>{l.vendor}</strong>: {l.reason || 'not counted in this case'}
                    </li>
                  ))}
                </ul>
              </dt>
              <dd>{exact(continues)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </Card>
  );
}
