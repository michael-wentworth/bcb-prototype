import React from 'react';
import { Button, Card, Toast, ToastBody, ToastTitle, Toaster, useId, useToastController } from '@fluentui/react-components';
import {
  ArrowRight20Regular,
  Checkmark16Filled,
  DocumentPdf20Regular,
  MoneyHand20Regular,
  Shield20Regular,
  SlideText20Regular,
  Sparkle16Filled,
  Sparkle20Regular,
  Wrench20Regular,
} from '@fluentui/react-icons';
import { capabilityById } from '../../data/capabilities.js';
import { formatCurrency, formatPercent } from '../../data/model.js';
import { buildReport } from '../../data/reportModel.js';
import { SIGNALS } from '../../data/signals.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import Disclosure from '../shared/Disclosure.jsx';
import SharePopover from '../shared/SharePopover.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import CaseConfidencePanel from './CaseConfidencePanel.jsx';
import CashFlowChart from './CashFlowChart.jsx';
import SavingsBars from './SavingsBars.jsx';
import WaterfallChart from './WaterfallChart.jsx';
import { defender, entra, intune, purview, sentinel } from '../Landing/productLogos.js';
import styles from './Report.module.css';

/* The five official marks that exist as assets. Microsoft 365 and Security
   Copilot have no file in src/assets/products, and a look-alike Fluent glyph
   beside an official product name reads as that product's logo — so those cards
   carry the name alone rather than an unofficial mark. */
const LOGOS = {
  'defender-suite': defender,
  'bp-defender': defender,
  'defender-cloud': defender,
  'entra-suite': entra,
  'external-id': entra,
  'intune-suite': intune,
  'purview-suite': purview,
  'bp-purview': purview,
  sentinel,
};

const DRIVER_ICONS = {
  cost: MoneyHand20Regular,
  consolidation: Wrench20Regular,
  security: Shield20Regular,
  ai: Sparkle20Regular,
};

/**
 * Step 3 — the executive briefing.
 *
 * Nine sections in one narrative: what the customer has, what Microsoft is
 * recommending, why it is better, what it costs, and whether to approve it.
 * Every figure is read from one derivation (buildReport) so no two sections can
 * describe the same deal differently.
 *
 * Deliberately not a spreadsheet. The only figures laid out in a grid are the
 * three cash-flow rows in the financial section, which are the rows a sponsor
 * asks for by name. The audience is deciding whether to fund something, not
 * auditing a model — the audit lives one disclosure down, in Assumptions.
 */
export default function ExecutiveReport() {
  const {
    capabilityCase,
    caseConfidence,
    currentLicenses,
    futureLicenses,
    capabilityCompetitors,
    rateByLicense,
    customer,
    caseSetup,
    recordSignal,
  } = useAppState();

  const toasterId = useId('report-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const notify = (title, body) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{body}</ToastBody>
      </Toast>,
      { intent: 'success', position: 'top-end' },
    );

  const c = capabilityCase;
  const money = (v) => formatCurrency(v, { symbol: '$' });
  const exact = (v) => formatCurrency(v, { symbol: '$', compact: false });

  if (!c.hasInputs) {
    return (
      <div className={styles.root}>
        <StepMasthead description="What the move is worth" />
        <Card className={styles.card}>
          <p className={styles.empty}>Add a seat count and a future state.</p>
        </Card>
        <StepFooter hint="Not enough to calculate yet" />
      </div>
    );
  }

  const r = buildReport({
    capabilityCase: c,
    caseConfidence,
    currentLicenses,
    futureLicenses,
    contracts: capabilityCompetitors.contracts,
    rateByLicense,
    customer,
  });

  /* Nothing to return on is not the same as a return we could not work out. The
     model nulls ROI and payback in both cases, so the note underneath has to
     say which one this is. */
  const noInvestment = r.financial.horizonInvestment === 0;

  const download = (format, label) => {
    recordSignal(SIGNALS.REPORT_DOWNLOADED, { format, from: 'report' });
    notify(`${label} generated`, 'Prototype only, no file produced');
  };

  return (
    <div className={styles.root}>
      <Toaster toasterId={toasterId} />
      <StepMasthead
        description={`${c.years}-year analysis across ${c.users.toLocaleString()} users`}
      />

      {/* ------------------------- 1. executive summary ----------------------- */}
      {/* The one figure the room repeats afterwards, at the size that says so,
          with the three that reconstruct it directly underneath. Everything
          below this card is the argument for this number. */}
      {/* data-tone opts this card out of the house chrome in global.css, which
          is a (0,3,0) selector and outranks any sensible number of doubled
          module classes. The module then owns the whole surface. */}
      <Card className={`${styles.card} ${styles.heroCard}`} data-tone="hero">
        <div className={styles.heroBlock}>
          <p className={styles.heroLead}>
            {r.headline.buying ? `With ${r.headline.buying}, ` : ''}
            {r.headline.account}{' '}
            {r.headline.direction === 'save'
              ? 'could save'
              : r.headline.direction === 'spend'
                ? 'would spend a net'
                : 'breaks even'}
          </p>
          <p
            className={`${styles.heroFigure} ${
              r.headline.direction === 'spend' ? styles.heroFigureNegative : ''
            }`}
          >
            {exact(Math.abs(r.headline.net))}
          </p>

          <ul className={styles.heroStats}>
            <li className={styles.heroStat}>
              <span className={styles.heroStatLabel}>{c.years}-year ROI</span>
              {/* Null is not zero. The model returns null when there is nothing
                  to return on, and printing 0% would state the opposite. */}
              <span className={styles.heroStatValue}>
                {r.kpis.roi === null ? 'n/a' : formatPercent(r.kpis.roi)}
              </span>
            </li>
            <li className={styles.heroStat}>
              <span className={styles.heroStatLabel}>Payback</span>
              <span className={styles.heroStatValue}>
                {r.kpis.paybackMonths
                  ? `${r.kpis.paybackMonths} months`
                  : noInvestment
                    ? 'Nothing to recover'
                    : 'Not in horizon'}
              </span>
            </li>
          </ul>

          {/* The arithmetic in the open. A headline figure a reader cannot take
              apart is a figure they have to trust rather than check. */}
          <div className={styles.equation}>
            <span className={styles.equationTerm}>
              <span className={styles.equationLabel}>Total benefits</span>
              <span className={styles.equationValue}>{exact(r.headline.benefits)}</span>
            </span>
            <span className={styles.equationOp} aria-hidden="true">
              &minus;
            </span>
            <span className={styles.equationTerm}>
              <span className={styles.equationLabel}>Total costs</span>
              <span className={styles.equationValue}>{exact(r.headline.costs)}</span>
            </span>
            <span className={styles.equationOp} aria-hidden="true">
              =
            </span>
            <span className={`${styles.equationTerm} ${styles.equationNet}`}>
              <span className={styles.equationLabel}>Net</span>
              <span className={styles.equationValue}>{exact(r.financial.horizonNet)}</span>
            </span>
          </div>
        </div>

        <p className={styles.summary}>
          <Sparkle16Filled className={styles.summarySparkle} aria-hidden="true" />
          <span>{r.summary}</span>
        </p>

        <div className={styles.heroFoot}>
          <CaseConfidencePanel />
          <div className={styles.actions}>
            <Button
              appearance="primary"
              icon={<SlideText20Regular />}
              onClick={() => download('pptx', 'PowerPoint')}
            >
              PowerPoint
            </Button>
            <Button icon={<DocumentPdf20Regular />} onClick={() => download('pdf', 'PDF')}>
              PDF
            </Button>
            <SharePopover>
              <Button>Share</Button>
            </SharePopover>
          </div>
        </div>
      </Card>

      {/* ---------------------- 2. current vs future state -------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>What changes</h2>
        </div>

        <div className={styles.transform}>
          <div className={styles.estate}>
            <span className={styles.estateLabel}>Today</span>
            <ul className={styles.estateList}>
              {r.state.current.licenses.map((n) => (
                <li key={n} className={styles.estateItem}>
                  {n}
                </li>
              ))}
              {r.state.current.vendors.map((n) => (
                <li key={n} className={`${styles.estateItem} ${styles.estateVendor}`}>
                  {n}
                </li>
              ))}
              {r.state.current.licenses.length + r.state.current.vendors.length === 0 ? (
                <li className={styles.estateEmpty}>Nothing recorded</li>
              ) : null}
            </ul>
          </div>

          <ArrowRight20Regular className={styles.transformArrow} aria-hidden="true" />

          <div className={`${styles.estate} ${styles.estateFuture}`}>
            <span className={styles.estateLabel}>With Microsoft</span>
            <ul className={styles.estateList}>
              {r.state.future.licenses.map((n) => (
                <li key={n} className={styles.estateItem}>
                  {n}
                </li>
              ))}
              {r.consolidation.replacedBy.slice(0, 5).map((n) => (
                <li key={n} className={`${styles.estateItem} ${styles.estateProduct}`}>
                  {n}
                </li>
              ))}
              {/* A vendor nobody can displace is still on the estate the day
                  after signature. Leaving it out of this column showed every
                  named vendor disappearing across the arrow while section 6,
                  four cards down, listed the ones that stay. */}
              {r.consolidation.remaining.map((n) => (
                <li key={n} className={`${styles.estateItem} ${styles.estateVendor}`}>
                  {n}
                </li>
              ))}
            </ul>
            {r.consolidation.remaining.length ? (
              <span className={styles.estateFoot}>
                {r.consolidation.remaining.length === 1 ? 'One vendor stays' : `${r.consolidation.remaining.length} vendors stay`}
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      {/* ----------------------- 3. recommended stack ------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Recommended solution</h2>
        </div>

        <div className={styles.stack}>
          {r.stack.map((s) => (
            <div key={s.id} className={styles.stackCard}>
              <div className={styles.stackHead}>
                {LOGOS[s.id] ? (
                  <img src={LOGOS[s.id]} alt="" aria-hidden="true" className={styles.stackLogo} />
                ) : null}
                <span className={styles.stackName}>{s.name}</span>
                {s.isNew ? <span className={styles.stackBadge}>Recommended</span> : null}
                {s.redundant ? (
                  <span className={`${styles.stackBadge} ${styles.stackBadgeWarn}`}>
                    Overlaps
                  </span>
                ) : null}
              </div>
              {s.blurb ? <p className={styles.stackBlurb}>{s.blurb}</p> : null}
              <p className={styles.stackRationale}>{s.rationale}</p>
              {s.adds.length ? (
                <Disclosure label="Capabilities it adds" count={s.adds.length}>
                  <ul className={styles.capChips}>
                    {s.adds.map((n) => (
                      <li key={n} className={styles.capChip}>
                        {n}
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      {/* ------------------------- 4. financial impact ------------------------ */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Financial impact</h2>
        </div>

        {/* Three rows and one column per year. The hero carries the horizon
            totals; this is where they come apart, which is what a finance
            reviewer checks the chart against. */}
        <div className={styles.tableWrap}>
        <table className={`${styles.dataTable} ${styles.flowTable}`}>
          <thead>
            <tr>
              <th scope="col">Cash flow</th>
              {r.financial.byYear.map((y) => (
                <th key={y.label} scope="col" className={styles.numeric}>
                  {y.label}
                </th>
              ))}
              <th scope="col" className={styles.numeric}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Benefits</th>
              {r.financial.byYear.map((y) => (
                <td key={y.label} className={styles.numeric}>
                  {exact(y.benefit)}
                </td>
              ))}
              <td className={styles.numeric}>{exact(r.financial.horizonSavings)}</td>
            </tr>
            <tr>
              <th scope="row">Costs</th>
              {r.financial.byYear.map((y) => (
                <td key={y.label} className={styles.numeric}>
                  {exact(y.cost)}
                </td>
              ))}
              <td className={styles.numeric}>{exact(r.financial.horizonInvestment)}</td>
            </tr>
            <tr className={styles.flowNet}>
              <th scope="row">Net</th>
              {r.financial.byYear.map((y) => (
                <td key={y.label} className={styles.numeric}>
                  {exact(y.net)}
                </td>
              ))}
              <td className={styles.numeric}>{exact(r.financial.horizonNet)}</td>
            </tr>
          </tbody>
        </table>
        </div>

        <CashFlowChart rows={r.financial.byYear} years={c.years} />

        {/* The run-rate sits one click down. It answers a different question to
            the curve above, and an executive asks the curve's question first. */}
        <Disclosure label="Annual licensing, today to future">
          <WaterfallChart
            steps={r.financial.steps}
            total={r.financial.futureSpend}
            totalLabel="Annual licensing after"
          />
        </Disclosure>
      </Card>

      {/* ------------------------ 5. capability coverage ---------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Capability coverage</h2>
          <p className={styles.cardLead}>
            What the estate covers today against what it would cover after.
          </p>
        </div>

        <div className={styles.coverage}>
          {r.coverage.map((row) => (
            <div key={row.id} className={styles.coverageRow}>
              <div>
                <span className={styles.coverageArea}>{row.label}</span>
                <span className={styles.coverageBlurb}>{row.blurb}</span>
              </div>
              <CoverageCell state={row.today} caption="today" />
              <ArrowRight20Regular className={styles.coverageArrow} aria-hidden="true" />
              <CoverageCell state={row.future} caption="after" strong />
              {/* Both movements, so the row reconciles: today + gained − lost
                  is the after count, and a reader who adds it up gets the
                  number printed beside it. */}
              <span className={styles.coverageGain}>
                {row.gained > 0 ? `+${row.gained}` : row.lost > 0 ? '' : 'None'}
                {row.lost > 0 ? <span className={styles.coverageLoss}>−{row.lost}</span> : null}
              </span>
            </div>
          ))}
        </div>

        {r.consolidation.dropped.length ? (
          <p className={styles.cardLead}>Not replaced: {r.consolidation.dropped.join(', ')}</p>
        ) : null}
      </Card>

      {/* ----------------------- 6. vendor consolidation ---------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Vendor consolidation</h2>
          <p className={styles.cardLead}>
            {r.consolidation.vendorCount === 0
              ? 'No vendors named.'
              : r.consolidation.displacedCount
                ? `${r.consolidation.displacedCount} of ${r.consolidation.vendorCount} named vendor${r.consolidation.vendorCount === 1 ? '' : 's'} come off the estate.`
                : 'No named vendor can be displaced.'}
          </p>
        </div>

        {/* Only when something actually moves. The arrow used to render 3 → 3
            under a lead that had just said nothing could be displaced, and the
            caption asserted a consolidation the same card denied. */}
        {r.consolidation.displacedCount ? (
          <div className={styles.consolidation}>
            <span className={styles.consolidationBig}>{r.consolidation.vendorCount}</span>
            <span className={styles.consolidationLabel}>
              vendor{r.consolidation.vendorCount === 1 ? '' : 's'} today
            </span>
            <ArrowRight20Regular className={styles.transformArrow} aria-hidden="true" />
            <span className={styles.consolidationBig}>
              {r.consolidation.vendorCount - r.consolidation.displacedCount}
            </span>
            <span className={styles.consolidationLabel}>left</span>
          </div>
        ) : null}

        {/* The same list priced. A vendor count tells the reader how many
            contracts go; it never says which one the case rests on. */}
        <SavingsBars
          rows={r.financial.vendorSavings}
          total={r.financial.vendorSavingsTotal}
          years={c.years}
        />

        {r.consolidation.remaining.length ? (
          <p className={styles.cardLead}>Still running: {r.consolidation.remaining.join(', ')}</p>
        ) : null}
      </Card>

      {/* -------------------------- 7. value drivers -------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Where the value comes from</h2>
        </div>

        <div className={styles.drivers}>
          {r.drivers.map((d) => {
            const Icon = DRIVER_ICONS[d.id] || Shield20Regular;
            return (
              <div key={d.id} className={styles.driver}>
                <Icon className={styles.driverIcon} aria-hidden="true" />
                <span className={styles.driverTitle}>{d.title}</span>
                {d.value ? <span className={styles.driverValue}>{money(d.value)} a year</span> : null}
                <span className={styles.driverText}>{d.text}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* --------------------------- 8. assumptions --------------------------- */}
      <Card className={styles.card}>
        {/* A heading, not just a disclosure button. Navigating by heading used
            to jump straight from the value drivers to the next steps, so the
            one section a CFO will actually test was invisible to anyone not
            reading top to bottom. */}
        <div>
          <h2 className={styles.cardTitle}>Assumptions</h2>
        </div>

        <Disclosure label="View assumptions" count={r.assumptions.length}>
          <dl className={styles.assumptions}>
            {r.assumptions.map((a) => (
              <div key={a.label} className={styles.assumption}>
                <dt>{a.label}</dt>
                <dd>{a.value}</dd>
              </div>
            ))}
          </dl>

          {/* The per-contract ledger, kept for transparency and kept out of the
              narrative. Every saving above resolves to a row here, including the
              rows worth nothing and the model's own reason for each — which is
              the part a CFO will actually test. */}
          {c.competitorLines.length > 0 ? (
            <>
              <h3 className={styles.subTitle}>Where each saving comes from</h3>
              <div className={styles.tableWrap}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th scope="col">Vendor</th>
                    <th scope="col">Capability it covers</th>
                    <th scope="col" className={styles.numeric}>
                      Annual
                    </th>
                    <th scope="col" className={styles.numeric}>
                      Ends
                    </th>
                    <th scope="col" className={styles.numeric}>
                      In this case
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.competitorLines.map((l) => (
                    <tr key={l.id}>
                      <th scope="row">{l.vendor}</th>
                      <td>
                        {l.capabilityIds
                          .map((id) => capabilityById(id)?.name)
                          .filter(Boolean)
                          .join(', ')}
                        {l.reason ? <span className={styles.stepDetail}>{l.reason}</span> : null}
                      </td>
                      <td className={styles.numeric}>{exact(l.annualCost)}</td>
                      <td className={styles.numeric}>{l.endYear}</td>
                      <td className={styles.numeric}>{l.saved ? exact(l.saved) : 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          ) : null}
        </Disclosure>
      </Card>

      {/* -------------------------- 9. next steps ----------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Recommended next steps</h2>
        </div>

        <ul className={styles.steps}>
          {r.steps.map((s) => (
            <li key={s.id} className={styles.step}>
              <Checkmark16Filled className={styles.stepTick} aria-hidden="true" />
              <span>
                <span className={styles.stepText}>{s.text}</span>
                {s.detail ? <span className={styles.stepDetail}>{s.detail}</span> : null}
              </span>
            </li>
          ))}
          {r.steps.length === 0 ? (
            <li className={styles.estateEmpty}>Nothing to recommend yet</li>
          ) : null}
        </ul>
      </Card>

      <StepFooter
        hint={`${caseSetup.analysisPeriod}-year horizon`}
      />
    </div>
  );
}

/**
 * One coverage cell: the word, then the fraction that justifies it.
 *
 * The fraction is not decoration. "Partial" on its own is a judgement the model
 * is not entitled to make; "Partial — 3 of 5" is arithmetic anyone can check,
 * and it is the difference between a coverage matrix and a colour chart.
 *
 * Explicit class lookup rather than a computed key: CSS-module keys resolve to
 * undefined when they miss, with no error and no styling.
 */
function CoverageCell({ state, caption, strong = false }) {
  const label = state.state === 'full' ? 'Full' : state.state === 'partial' ? 'Partial' : 'None';
  const tone =
    state.state === 'full'
      ? styles.covFull
      : state.state === 'partial'
        ? styles.covPartial
        : styles.covNone;
  return (
    <span className={`${styles.coverageCell} ${strong ? styles.coverageCellStrong : ''}`}>
      <span className={`${styles.coverageBadge} ${tone}`}>{label}</span>
      <span className={styles.coverageCount}>
        {state.covered} of {state.total} {caption}
      </span>
    </span>
  );
}
