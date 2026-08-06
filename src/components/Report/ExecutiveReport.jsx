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
 * Deliberately not a spreadsheet. There is no year-by-year table anywhere on
 * this page: the horizon shows up as three totals in the financial section and
 * as a payback figure in the summary, and that is the whole of it. The audience
 * is deciding whether to fund something, not auditing a model — the audit lives
 * one disclosure down, in Assumptions.
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
        <StepMasthead description="What the move is worth, and what it is worth beyond the money" />
        <Card className={styles.card}>
          <p className={styles.empty}>
            Add a seat count and a future state and the case builds itself from here.
          </p>
        </Card>
        <StepFooter hint="Not enough to calculate yet." />
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
    notify(`${label} generated`, 'Prototype — no file produced.');
  };

  return (
    <div className={styles.root}>
      <Toaster toasterId={toasterId} />
      <StepMasthead
        description={`${c.years}-year analysis across ${c.users.toLocaleString()} users`}
      />

      {/* ------------------------- 1. executive summary ----------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.hero}>
            {customer.accountName || 'This customer'} should move to{' '}
            {r.state.future.licenses.join(' and ') || 'a future state'}
          </h2>
        </div>

        <ul className={styles.kpis}>
          <li className={`${styles.kpi} ${styles.kpiBrand}`}>
            <span className={styles.kpiLabel}>Return on investment</span>
            {/* Null is not zero. The model returns null when there is nothing to
                return on, and printing 0% would state the opposite. */}
            <span className={styles.kpiValue}>
              {r.kpis.roi === null ? '—' : formatPercent(r.kpis.roi)}
            </span>
            <span className={styles.kpiNote}>
              {r.kpis.roi === null && noInvestment
                ? 'No additional investment to return on'
                : `${c.years}-year nominal`}
            </span>
          </li>
          <li className={`${styles.kpi} ${styles.kpiGood}`}>
            <span className={styles.kpiLabel}>Annual savings</span>
            <span className={styles.kpiValue}>{money(r.kpis.annualSavings)}</span>
            <span className={styles.kpiNote}>Once contracts lapse</span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Payback</span>
            <span className={styles.kpiValue}>
              {r.kpis.paybackMonths ? `${r.kpis.paybackMonths} mo` : '—'}
            </span>
            <span className={styles.kpiNote}>
              {r.kpis.paybackMonths
                ? 'From first uplift'
                : noInvestment
                  ? 'Nothing to recover'
                  : 'Not inside the horizon'}
            </span>
          </li>
          <li className={`${styles.kpi} ${styles.kpiConfidence}`}>
            <CaseConfidencePanel />
          </li>
        </ul>

        <p className={styles.summary}>
          <Sparkle16Filled className={styles.summarySparkle} aria-hidden="true" />
          <span>{r.summary}</span>
        </p>
      </Card>

      {/* ---------------------- 2. current vs future state -------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>What changes</h2>
          <p className={styles.cardLead}>
            The estate today, and the estate this case proposes.
          </p>
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
          <p className={styles.cardLead}>
            What the customer would buy, and what each product is here to do.
          </p>
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
          <p className={styles.cardLead}>
            Annual licensing either side of the move, and what the {c.years}-year horizon adds up
            to.
          </p>
        </div>

        <WaterfallChart
          steps={r.financial.steps}
          total={r.financial.futureSpend}
          totalLabel="Annual licensing after"
        />

        <ul className={styles.kpis}>
          <li className={`${styles.kpi} ${styles.kpiGood}`}>
            <span className={styles.kpiLabel}>Savings over {c.years} years</span>
            <span className={styles.kpiValue}>{money(r.financial.horizonSavings)}</span>
            <span className={styles.kpiNote}>Competitor spend that stops</span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Investment over {c.years} years</span>
            <span className={styles.kpiValue}>{money(r.financial.horizonInvestment)}</span>
            <span className={styles.kpiNote}>Above what they pay today</span>
          </li>
          <li className={styles.kpi}>
            <span className={styles.kpiLabel}>Net</span>
            <span className={styles.kpiValue}>{exact(r.financial.horizonNet)}</span>
            <span className={styles.kpiNote}>Savings less investment</span>
          </li>
        </ul>
      </Card>

      {/* ------------------------ 5. capability coverage ---------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Capability coverage</h2>
          <p className={styles.cardLead}>
            What the estate covers today — from Microsoft or from a vendor — against what it would
            cover after. Counted, never estimated.
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
                {row.gained > 0 ? `+${row.gained}` : row.lost > 0 ? '' : '—'}
                {row.lost > 0 ? <span className={styles.coverageLoss}>−{row.lost}</span> : null}
              </span>
            </div>
          ))}
        </div>

        {r.consolidation.dropped.length ? (
          <p className={styles.cardLead}>
            Not replaced: {r.consolidation.dropped.join(', ')}. {r.consolidation.droppedFrom.join(' and ')}{' '}
            {r.consolidation.droppedFrom.length === 1 ? 'covers' : 'cover'} this today and the future state
            does not, so the saving assumes the customer does not need it.
          </p>
        ) : null}
      </Card>

      {/* ----------------------- 6. vendor consolidation ---------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Vendor consolidation</h2>
          <p className={styles.cardLead}>
            {r.consolidation.vendorCount === 0
              ? 'No incumbent vendors have been named, so there is nothing to consolidate yet.'
              : r.consolidation.displacedCount
                ? `${r.consolidation.displacedCount} of ${r.consolidation.vendorCount} named vendor${r.consolidation.vendorCount === 1 ? '' : 's'} come off the estate.`
                : 'No named vendor can be displaced by this move as it stands.'}
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
            <span className={styles.consolidationLabel}>
              {r.consolidation.vendorCount === r.consolidation.displacedCount
                ? 'left — the estate runs on one Microsoft platform'
                : `still to run alongside Microsoft`}
            </span>
          </div>
        ) : null}

        {r.consolidation.remaining.length ? (
          <p className={styles.cardLead}>
            Still running: {r.consolidation.remaining.join(', ')}. The mapping on product selection
            says why each one stays.
          </p>
        ) : null}
      </Card>

      {/* -------------------------- 7. value drivers -------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Where the value comes from</h2>
          <p className={styles.cardLead}>
            Only the first of these is inside the return. The rest are the argument the money does
            not make.
          </p>
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
          <p className={styles.cardLead}>
            What the numbers above rest on, and where each saving comes from.
          </p>
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
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th scope="col">Incumbent</th>
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
                      <td className={styles.numeric}>{l.saved ? exact(l.saved) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </Disclosure>
      </Card>

      {/* -------------------------- 9. next steps ----------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Recommended next steps</h2>
          <p className={styles.cardLead}>Derived from the move and the contracts it displaces.</p>
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
            <li className={styles.estateEmpty}>
              Nothing to recommend yet — the future state and the incumbents drive this list.
            </li>
          ) : null}
        </ul>

        <div className={styles.actions}>
          <Button
            appearance="primary"
            icon={<SlideText20Regular />}
            onClick={() => download('pptx', 'PowerPoint')}
          >
            Download PowerPoint
          </Button>
          <Button icon={<DocumentPdf20Regular />} onClick={() => download('pdf', 'PDF')}>
            Download PDF
          </Button>
          <SharePopover>
            <Button>Share business case</Button>
          </SharePopover>
        </div>
      </Card>

      <StepFooter
        hint={`${caseSetup.analysisPeriod}-year horizon. Savings dated to contract lapse, not to signature.`}
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
