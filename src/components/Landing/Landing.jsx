import React, { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { Add20Filled, ArrowRight16Regular } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { MY_CASES } from '../../data/caseLibrary.js';
import { PILLARS } from '../../data/landing.js';
import PaybackChart from '../ResultsDashboard/PaybackChart.jsx';
import SpendComparison from '../ResultsDashboard/SpendComparison.jsx';
import { CASE, LEDGER, SCENARIOS, EXCLUDED, money, pct } from '../../data/landingCase.js';
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
              Work out what a customer saves by moving their security vendors onto Microsoft.
            </p>
          </div>
          <div className={styles.mastheadActions}>
            <Button appearance="primary" icon={<Add20Filled />} onClick={onStart}>
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
 * The fold: the answer, three figures, and the curve that explains them. The
 * scenario control sits with the figures it moves — the claim "payback is month
 * 23" has to be demonstrable where it is made, not five screens down.
 */
function Result({ onOpen }) {
  const [id, setId] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === id) || SCENARIOS[0];
  const positive = active.annualNetBenefit >= 0;

  return (
    <section className={styles.resultBand}>
      <div className={styles.grid}>
        <p className={styles.badge}>Worked example · Contoso Ltd. · figures in USD</p>

        <h2 className={styles.headline}>
          {positive ? (
            <>
              Contoso could save <strong>{money(active.annualNetBenefit)}</strong> a year
            </>
          ) : (
            <>
              On these dates Contoso is{' '}
              <strong>{money(Math.abs(active.annualNetBenefit))}</strong> a year worse off
            </>
          )}
        </h2>
        <p className={styles.subhead}>
          18,000 users · Manufacturing · {CASE.years}-year analysis
        </p>

        <div className={styles.resultLayout}>
          <ul className={styles.kpis}>
            <Kpi tone="brand" label="Return on investment" value={pct(active.roi)} />
            <Kpi
              tone={positive ? 'good' : 'bad'}
              label="Net benefit a year"
              value={money(active.annualNetBenefit)}
            />
            <Kpi
              tone="plain"
              label="Payback"
              value={active.paybackMonths ? `${active.paybackMonths} mo` : 'Never'}
            />
            <Kpi
              tone="plain"
              label="Vendors retired"
              value={`${active.vendorsConsolidated} of ${CASE.vendorCount}`}
            />
          </ul>

          <div className={styles.chartCard}>
            <PaybackChart
              cashflow={CASE.cashflow}
              paybackMonths={CASE.paybackMonths}
              symbol="$"
            />
          </div>
        </div>

        <div className={styles.control}>
          <span className={styles.controlLabel} id="timing-label">
            Try moving the contract end dates
          </span>
          <div className={styles.segments} role="group" aria-labelledby="timing-label">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.segment} ${s.id === id ? styles.segmentOn : ''}`}
                aria-pressed={s.id === id}
                onClick={() => setId(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className={styles.controlNote}>
            {active.note}{' '}
            <button type="button" className={styles.inlineLink} onClick={onOpen}>
              Open the full report
            </button>
          </p>
        </div>
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
 * The consolidation, as a picture rather than a table. Four vendor contracts on
 * one side, Microsoft on the other, and what the swap does to annual spend.
 */
function WhatChanges() {
  return (
    <section className={styles.band}>
      <div className={styles.grid}>
        <h2 className={styles.sectionTitle}>Four vendors out, one platform in</h2>
        <p className={styles.sectionLede}>
          The saving is spend that stops, not spend that is estimated.
        </p>

        <div className={styles.changeLayout}>
          {/* Category, not brand. This page is public marketing, so naming a
              competitor beside an invented price would be Microsoft publishing a
              pricing claim about someone else's product. Inside the tool the seller
              enters the real vendor for their own deal, which is their statement
              about their own customer rather than ours. The argument here is about
              categories of spend and contract timing, and loses nothing without
              the brand. */}
          <ul className={styles.vendors}>
            {LEDGER.map((l) => (
              <li key={l.id} className={styles.vendor}>
                <span className={styles.vendorTop}>
                  <span className={styles.vendorName}>{l.category}</span>
                  <span className={styles.vendorCost}>{money(l.annualCost)}/yr</span>
                </span>
                <span className={styles.vendorArrow} aria-hidden="true" />
                <span className={styles.vendorTo}>{l.replacedBy}</span>
              </li>
            ))}
          </ul>

          <div className={styles.chartCard}>
              <SpendComparison
              current={CASE.todayAnnualSpend ?? 0}
              future={CASE.futureAnnualSpend ?? 0}
              contractCount={CASE.vendorCount}
              symbol="$"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- why timing ------------------------------- */

/**
 * The credibility beat, kept to one idea and one graphic: nothing is saved in
 * year one, because on day one every contract is still running.
 */
function WhyTiming() {
  const [inflated, setInflated] = useState(false);
  const peak = Math.max(...CASE.competitorByYear);

  return (
    <section className={`${styles.band} ${styles.bandTint}`}>
      <div className={styles.grid}>
        <h2 className={styles.sectionTitle}>Year one saves nothing</h2>
        <p className={styles.sectionLede}>
          A vendor cannot be switched off mid-contract, so savings begin the year after one lapses.
          That is why payback lands at month{' '}
          {CASE.paybackMonths} rather than immediately — and why
          this case can be checked.
        </p>

        <ol className={styles.years}>
          {CASE.competitorByYear.map((v, i) => (
            <li key={i} className={styles.year}>
              <span className={styles.yearLabel}>{CASE.startYear + i}</span>
              <span className={styles.yearTrack}>
                <span
                  className={styles.yearFill}
                  style={{ width: v ? `${(v / peak) * 100}%` : '0%' }}
                />
              </span>
              <span className={styles.yearValue}>{v ? money(v) : 'nothing'}</span>
            </li>
          ))}
        </ol>

        <div className={styles.demo}>
          <div>
            <p className={styles.demoTitle}>And what it refuses to count</p>
            <p className={styles.demoBody}>
              Contoso already pays {money(EXCLUDED.annual)} a year for {EXCLUDED.bundleName} and
              will keep paying it. Count that as a saving, as a spreadsheet built to flatter would,
              and the same case reports a return ten times larger.
            </p>
            <button
              type="button"
              className={styles.demoToggle}
              aria-pressed={inflated}
              onClick={() => setInflated((v) => !v)}
            >
              {inflated ? 'Show the honest figure' : 'Count the existing licences as a saving'}
            </button>
          </div>
          <div className={styles.demoFigure}>
            <span className={`${styles.demoValue} ${inflated ? styles.demoValueBad : ''}`}>
              {pct(inflated ? EXCLUDED.inflatedRoi : EXCLUDED.honestRoi)}
            </span>
            <span className={styles.demoCaption}>
              {inflated ? 'What an inflated case looks like' : 'Counting only spend that stops'}
            </span>
          </div>
        </div>
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
        <ul className={styles.evidence}>
          {EVIDENCE.map((s) => (
            <li key={s.label} className={styles.evidenceItem}>
              <span className={styles.evidenceValue}>{s.value}</span>
              <span className={styles.evidenceLabel}>{s.label}</span>
            </li>
          ))}
        </ul>
        <p className={styles.evidenceNote}>
          Forrester Total Economic Impact™ studies, commissioned by Microsoft. Your case is built
          from your customer&rsquo;s own contracts, not from these.
        </p>

        <div className={styles.close}>
          <h2 className={styles.closeTitle}>Build the same thing for your customer</h2>
          <p className={styles.closeText}>
            Their seats, their vendors, their contract dates — about ten minutes, and the copilot
            fills most of it from a sentence.
          </p>
          <Button appearance="primary" size="large" icon={<Add20Filled />} onClick={onStart}>
            Build your own case
          </Button>
        </div>
      </div>
    </section>
  );
}
