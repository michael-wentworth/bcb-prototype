import React from 'react';
import { Button } from '@fluentui/react-components';
import { Add20Filled, ArrowRight16Regular } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { MY_CASES } from '../../data/caseLibrary.js';
import { PILLARS } from '../../data/landing.js';
import PaybackChart from '../ResultsDashboard/PaybackChart.jsx';
import SpendComparison from '../ResultsDashboard/SpendComparison.jsx';
import {
  CASE,
  CONSOLIDATION,
  LEDGER,
  STEADY,
  STRESS,
  EXCLUDED,
  money,
  pct,
} from '../../data/landingCase.js';
import { logosFor } from './productLogos.js';
import styles from './Landing.module.css';

/**
 * The landing page.
 *
 * It shows one finished business case — Contoso, the same case that ships in the
 * tool — as a SIMPLIFIED report: headline, three figures, two charts. Not the
 * report itself. An earlier attempt put the actual ledger on the page, six
 * columns and dollar-exact, and that is an audit document rather than a front
 * door; the detail belongs behind "open this case in the tool", which is one
 * click away throughout.
 *
 * Two rules hold the layout together:
 *
 * 1. NO HERO. A masthead strip names the product and gets out of the way so the
 *    result owns the fold. The eyebrow / big headline / lede / button-pair /
 *    picture-on-the-right arrangement is the silhouette this page has already
 *    been rejected for twice.
 * 2. ONE GRID, ONE LEFT EDGE. Bands run full width and change colour; nothing
 *    inside one is ever indented differently from anything else.
 *
 * Every figure comes from the real engine via landingCase.js. Charts are the two
 * the tool already draws, so the page previews the product rather than
 * illustrating it.
 */
export default function Landing() {
  const { newCase, openCase } = useAppState();
  const contoso = MY_CASES.find((c) => c.id === 'case-contoso');
  const open = () => openCase(contoso);

  return (
    <div className={styles.root}>
      <Masthead onStart={newCase} onOpen={open} />
      <Result onOpen={open} />
      <WhatChanges />
      <WhyTiming />
      <Close onStart={newCase} />
    </div>
  );
}

/* --------------------------------- masthead -------------------------------- */

function Masthead({ onStart, onOpen }) {
  return (
    <header className={styles.masthead}>
      <div className={styles.grid}>
        <div className={styles.mastheadRow}>
          <div>
            <h1 className={styles.wordmark}>Security Business Case Builder</h1>
            <p className={styles.mastheadLine}>
              Build a defensible ROI case for your customer
            </p>
          </div>
          <div className={styles.mastheadActions}>
            <Button
              appearance="primary"
              size="large"
              icon={<Add20Filled />}
              onClick={onStart}
            >
              Build your own case
            </Button>
            <button type="button" className={styles.textLink} onClick={onOpen}>
              See the full report
              <ArrowRight16Regular aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------- result --------------------------------- */

/**
 * The fold: the answer, four figures, and the curve that explains them. Static —
 * a landing page that asks a stranger to operate a control before they know what
 * the product is reads as odd, so what the control used to demonstrate is stated
 * under "What it will not do" instead.
 */
function Result({ onOpen }) {
  return (
    <section className={styles.resultBand}>
      <div className={styles.grid}>
        <p className={styles.badge}>A case built with this tool · figures in USD</p>

        <h2 className={styles.headline}>
          Contoso could save <strong>{money(CASE.annualNetBenefit)}</strong> a year
        </h2>
        <p className={styles.subhead}>
          {CASE.users.toLocaleString()} users · {CASE.industry} · {CASE.years}-year analysis
        </p>

        <div className={styles.resultLayout}>
          <ul className={styles.kpis}>
            <Kpi tone="brand" label="Return on investment" value={pct(CASE.roi)} />
            <Kpi tone="good" label="Net benefit a year" value={money(CASE.annualNetBenefit)} />
          </ul>

          <div className={styles.chartCard}>
            <PaybackChart
              cashflow={CASE.cashflow}
              paybackMonths={CASE.paybackMonths}
              symbol="$"
            />
          </div>
        </div>

        <p className={styles.foot}>
          <button type="button" className={styles.inlineLink} onClick={onOpen}>
            See the full report
          </button>
        </p>
      </div>
    </section>
  );
}

function Kpi({ label, value, tone }) {
  return (
    <li className={`${styles.kpi} ${styles[`kpi_${tone}`]}`}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
    </li>
  );
}

/* ------------------------------- what changes ------------------------------ */

/**
 * The consolidation as a picture: four contracts on one side, one destination
 * on the other.
 *
 * The destination is Microsoft, not a single SKU. This case buys three products
 * and the heading says "one platform in", so naming any one of them as THE
 * replacement would be false — three of the four vendors give way to Microsoft
 * 365 E5 Security and the fourth to Sentinel. What is true, and what the
 * sentence actually means, is that four separate vendor relationships become
 * one. The card carries the products inside it and the total they cost a year.
 */
function WhatChanges() {
  return (
    <section className={styles.band}>
      <div className={styles.grid}>
        <h2 className={styles.sectionTitle}>
          {CONSOLIDATION.vendorCount} vendors out, one platform in
        </h2>

        {/* Category, not brand. This page is public marketing, so naming a
            competitor beside an invented price would be Microsoft publishing a
            pricing claim about someone else's product. Inside the tool the
            seller enters the real vendor for their own deal. */}
        <div className={styles.swap}>
          <ul className={styles.fromList}>
            {LEDGER.map((l) => (
              <li key={l.id} className={styles.fromCard}>
                <span className={styles.fromName}>{l.category}</span>
                <span className={styles.fromCost}>{money(l.annualCost)}/yr</span>
              </li>
            ))}
          </ul>

          <span className={styles.swapArrow} aria-hidden="true" />

          {/* The marks the four capabilities land on, derived from the rows
              rather than listed by hand — a case displacing DLP would show
              Purview here without anyone editing this. Three products sitting
              together says "platform" faster than three lines of text did. */}
          <div className={styles.toCard}>
            <span className={styles.toEyebrow}>Microsoft Security</span>
            <ul className={styles.toLogos}>
              {logosFor(LEDGER.map((l) => l.category)).map((logo) => (
                <li key={logo.name} className={styles.toLogo}>
                  <img src={logo.src} alt="" aria-hidden="true" />
                  <span>{logo.short}</span>
                </li>
              ))}
            </ul>
            <span className={styles.toCost}>{money(CONSOLIDATION.annualCost)}/yr</span>
            <span className={styles.toNote}>
              Licensed as {CONSOLIDATION.products.join(', ')}
            </span>
          </div>
        </div>

        <div className={styles.chartCard}>
          <SpendComparison
            current={CASE.todayAnnualSpend ?? 0}
            future={CASE.futureAnnualSpend ?? 0}
            contractCount={CASE.vendorCount}
            symbol="$"
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- why timing ------------------------------- */

/**
 * The same honesty, told forwards.
 *
 * This section used to open "Year one saves nothing", which is true and is the
 * least interesting true thing here. The headline ROI is a blend across the
 * whole horizon, dragged down by a first year in which nothing can legally be
 * switched off yet — so the rate the customer actually lives with afterwards is
 * much better than the number on the fold, and saying so is not a softening.
 * The reason year one is nil still gets stated; it is just no longer the point.
 */
function WhyTiming() {
  const peak = Math.max(...CASE.competitorByYear);

  return (
    <section className={styles.band}>
      <div className={styles.grid}>
        <h2 className={styles.sectionTitle}>It gets better every year</h2>
        <p className={styles.sectionLede}>
          A vendor cannot be switched off mid-contract, so each saving starts the year after
          that contract lapses.
        </p>

        <ol className={styles.years}>
          {CASE.competitorByYear.map((v, i) => (
            <li key={i} className={styles.year}>
              <span className={styles.yearLabel}>Year {i + 1}</span>
              <span className={styles.yearTrack}>
                <span
                  className={styles.yearFill}
                  style={{ width: v ? `${(v / peak) * 100}%` : '0%' }}
                />
              </span>
              <span className={styles.yearValue}>{v ? money(v) : 'nothing yet'}</span>
            </li>
          ))}
        </ol>

        <div className={styles.steady}>
          <span className={styles.steadyValue}>{pct(STEADY.ratio)}</span>
          <span className={styles.steadyText}>
            The rate after the switch: {money(STEADY.saves)} a year of spend stopping against{' '}
            {money(STEADY.costs)} of Microsoft. The {pct(CASE.roi)} above blends all{' '}
            {CASE.years} years.
          </span>
        </div>

        <p className={styles.factsTitle}>What it will not let you claim</p>
        <ul className={styles.facts}>
          <li className={styles.fact}>
            <span className={styles.factValue}>{pct(EXCLUDED.inflatedRoi)}</span>
            <span className={styles.factText}>
              What you could report if the {money(EXCLUDED.annual)} a year the customer already
              spends on {EXCLUDED.bundleName} counted as a saving.
            </span>
          </li>
          <li className={styles.fact}>
            <span className={styles.factValue}>{pct(STRESS.roi)}</span>
            <span className={styles.factText}>
              What the same case reports if none of the customer's contracts lapse inside the
              analysis period.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------- close ---------------------------------- */

/** Three figures of independent research, then the ask. */
const EVIDENCE = (() => {
  const seen = new Set();
  return PILLARS.flatMap((p) => p.stats)
    .filter((s) => {
      const k = s.label.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 3);
})();

function Close({ onStart }) {
  return (
    <section className={`${styles.band} ${styles.bandLast}`}>
      <div className={styles.grid}>
        <h2 className={styles.sectionTitle}>Independent research behind the category</h2>
        <p className={styles.sectionLede}>
          Figures you can put in a deck as they are
        </p>

        <ul className={styles.evidence}>
          {EVIDENCE.map((s) => (
            <li key={s.label} className={styles.evidenceItem}>
              <span className={styles.evidenceValue}>{s.value}</span>
              <span className={styles.evidenceLabel}>{s.label}</span>
            </li>
          ))}
        </ul>
        <p className={styles.evidenceNote}>
          Forrester Total Economic Impact™ studies, commissioned by Microsoft
        </p>

        <div className={styles.close}>
          <h2 className={styles.closeTitle}>Build the same thing for your customer</h2>
          <p className={styles.closeText}>
            Enter the customer's seats, vendors and contract dates. The copilot fills most of it
            from a sentence.
          </p>
          <Button appearance="primary" size="large" icon={<Add20Filled />} onClick={onStart}>
            Build your own case
          </Button>
        </div>
      </div>
    </section>
  );
}
