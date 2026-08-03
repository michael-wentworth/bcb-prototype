import React from 'react';
import { Card } from '@fluentui/react-components';
import { SOLUTION_AREAS, capabilityById } from '../../data/capabilities.js';
import { formatCurrency, formatPercent } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './Capability.module.css';

/**
 * Step 5 — what it is worth.
 *
 * Every figure is a read of the capability case. The money side is deliberately
 * narrow: the only benefit counted is competitor spend that stops, dated to the
 * year after each contract lapses. Security, compliance and strategic value are
 * stated as capability counts rather than converted into currency, because a
 * number invented for them is the fastest way to lose a CFO.
 */
export default function CapabilityReport() {
  const { capabilityCase, customer, caseSetup } = useAppState();
  const c = capabilityCase;
  const money = (v) => formatCurrency(v, { symbol: '$' });
  const exact = (v) => formatCurrency(v, { symbol: '$', compact: false });

  if (!c.hasInputs) {
    return (
      <div className={styles.root}>
        <StepMasthead description="What the move is worth, and what it is worth beyond the money." />
        <Card className={styles.card}>
          <p className={styles.empty}>
            Add a seat count and a future state and the case builds itself from here.
          </p>
        </Card>
        <StepFooter hint="Not enough to calculate yet." />
      </div>
    );
  }

  const displaced = c.competitorLines.filter((l) => l.displaceable);
  const excluded = c.competitorLines.filter((l) => !l.displaceable);
  const areas = SOLUTION_AREAS.map((a) => ({
    ...a,
    gained: c.delta.gained.filter((id) => capabilityById(id)?.area === a.id).length,
  })).filter((a) => a.gained > 0);

  return (
    <div className={styles.root}>
      <StepMasthead
        description={`${c.years}-year analysis across ${c.users.toLocaleString()} users. Every figure derives from the two licence selections and the incumbents you named.`}
      />

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>
            {customer.accountName || 'This customer'} would gain {c.delta.gained.length} capabilities
          </h2>
          <p className={styles.cardLead}>
            {c.delta.retained.length} retained, {c.counts.displaced} vendor
            {c.counts.displaced === 1 ? '' : 's'} displaced, {c.delta.strategic.length} net-new with
            nothing comparable on the market.
          </p>
        </div>

        <ul className={styles.kpis}>
          <li className={`${styles.kpi} ${styles.kpiBrand}`}>
            <span className={styles.kpiLabel}>Return on investment</span>
            <span className={styles.kpiValue}>{c.roi === null ? '—' : formatPercent(c.roi)}</span>
            <span className={styles.kpiNote}>{c.years}-year nominal</span>
          </li>
          <li className={`${styles.kpi} ${styles.kpiGood}`}>
            <span className={styles.kpiLabel}>Licensing savings</span>
            <span className={styles.kpiValue}>{money(c.competitorTotal)}</span>
            <span className={styles.kpiNote}>Competitor spend that stops</span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Microsoft uplift</span>
            <span className={styles.kpiValue}>{money(c.investmentTotal)}</span>
            <span className={styles.kpiNote}>
              {c.usingList ? 'At list — enter a negotiated rate' : `${money(c.incrementalAnnual)} a year`}
            </span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Payback</span>
            <span className={styles.kpiValue}>{c.paybackMonths ? `${c.paybackMonths} mo` : '—'}</span>
            <span className={styles.kpiNote}>
              {c.paybackMonths ? 'From first uplift' : 'Not inside the horizon'}
            </span>
          </li>
        </ul>

        <p className={styles.cardLead}>
          Net {exact(c.netBenefit)} over {c.years} years — {exact(c.competitorTotal)} of spend that
          stops against {exact(c.investmentTotal)} of additional Microsoft licensing. The estate
          they already pay for is not counted on either side.
        </p>
      </Card>

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>What the money comes from</h2>
          <p className={styles.cardLead}>
            A contract cannot be switched off mid-term, so each saving starts the year after it
            lapses. Rows that cannot contribute are shown with the reason rather than dropped.
          </p>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Incumbent</th>
              <th scope="col">Capability it covers</th>
              <th scope="col" className="numeric">Annual</th>
              <th scope="col" className="numeric">Contract ends</th>
              <th scope="col" className="numeric">In this case</th>
            </tr>
          </thead>
          <tbody>
            {c.competitorLines.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.excluded}>
                  No incumbents named. The case argues on capability gained rather than on savings.
                </td>
              </tr>
            ) : (
              c.competitorLines.map((l) => (
                <tr key={l.id} className={l.displaceable ? '' : styles.excluded}>
                  <th scope="row">{l.product}</th>
                  <td>
                    {l.capability?.name}
                    {l.reason ? <span className={styles.mapCapProduct}>{l.reason}</span> : null}
                  </td>
                  <td className="numeric">{money(l.annualCost)}</td>
                  <td className="numeric">{l.endYear}</td>
                  <td className="numeric">{l.saved ? money(l.saved) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {excluded.length > 0 ? (
          <p className={styles.cardLead}>
            {excluded.length} row{excluded.length === 1 ? '' : 's'} contribute nothing. That is the
            model refusing to count a saving it cannot defend, not an error.
          </p>
        ) : null}
      </Card>

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Value beyond the savings</h2>
          <p className={styles.cardLead}>
            Stated as capability rather than converted to currency. A number invented for security
            or compliance value is the fastest way to lose the room.
          </p>
        </div>

        <ul className={styles.kpis}>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Security &amp; compliance</span>
            <span className={styles.kpiValue}>
              {c.delta.gained.filter((id) => ['defender', 'purview', 'entra'].includes(capabilityById(id)?.area)).length}
            </span>
            <span className={styles.kpiNote}>New capabilities across Defender, Purview and Entra</span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Strategic</span>
            <span className={styles.kpiValue}>{c.delta.strategic.length}</span>
            <span className={styles.kpiNote}>Nothing comparable to displace</span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Vendors displaced</span>
            <span className={styles.kpiValue}>{c.counts.displaced}</span>
            <span className={styles.kpiNote}>Contracts that stop inside the horizon</span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Retained</span>
            <span className={styles.kpiValue}>{c.delta.retained.length}</span>
            <span className={styles.kpiNote}>Carried over, argues nothing</span>
          </li>
        </ul>

        <div>
          {areas.map((a) => (
            <div key={a.id} className={styles.areaRow}>
              <span className={styles.areaName}>{a.label}</span>
              <span className={styles.areaBar}>
                <span
                  className={styles.segNew}
                  style={{ width: `${(a.gained / c.delta.gained.length) * 100}%` }}
                />
              </span>
              <span className={styles.areaCount}>+{a.gained}</span>
            </div>
          ))}
        </div>
      </Card>

      <StepFooter
        hint={`${caseSetup.analysisPeriod}-year horizon. Savings dated to contract lapse, not to signature.`}
      />
    </div>
  );
}
