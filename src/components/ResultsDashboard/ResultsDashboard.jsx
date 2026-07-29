import React from 'react';
import {
  Badge,
  Button,
  Card,
  Toast,
  ToastBody,
  ToastTitle,
  Toaster,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  ArrowTrendingLines20Regular,
  Checkmark16Filled,
  Layer20Regular,
  MoneyHand20Regular,
  Share20Regular,
  SlideText20Regular,
  Sparkle16Filled,
  DocumentPdf20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';
import {
  ASSUMPTIONS,
  INVESTMENT_LINES,
  OPERATIONAL_BENEFITS,
  VALUE_DRIVERS,
  formatCurrency,
  formatPercent,
} from '../../data/mockData.js';
import { NARRATIVE_SECTIONS, TRACKED_SECTIONS } from '../../data/authoring.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import MetricTile from '../shared/MetricTile.jsx';
import AuthorshipBadge from '../shared/AuthorshipBadge.jsx';
import SectionHeading from '../shared/SectionHeading.jsx';
import StageFooter from '../shared/StageFooter.jsx';
import NarrativeSection from '../Narrative/NarrativeSection.jsx';
import PaybackChart from './PaybackChart.jsx';
import SpendComparison from './SpendComparison.jsx';
import styles from './ResultsDashboard.module.css';

export default function ResultsDashboard() {
  const {
    businessCase: c,
    profile,
    reportReady,
    authorship,
    sectionAuthorship,
    narrative,
    includedDisplacements,
    manualDisplacements,
    ask,
  } = useAppState();

  const sections = NARRATIVE_SECTIONS;
  const hasAnalysis = includedDisplacements.length > 0 || manualDisplacements.length > 0;
  const toasterId = useId('bcb-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const notify = (title, body) =>
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{body}</ToastBody>
      </Toast>,
      { intent: 'success', position: 'top-end' },
    );

  return (
    <div className={styles.root}>
      <Toaster toasterId={toasterId} />

      <SectionHeading
        eyebrow="Stage 4 of 4"
        title={`${profile.companyName || 'Customer'} — executive business case`}
        description={`Three-year analysis across ${
          profile.employeeCount || '18,000'
        } seats. Assembled from the profile, the recommended solutions and the displacement map — every figure traces back to a line in the ledger.`}
        actions={
          <Badge appearance="tint" color={reportReady ? 'success' : 'informative'}>
            {reportReady ? 'Ready to present' : 'Assembling…'}
          </Badge>
        }
      />

      {/* Case-level lineage: what the copilot touched, what you wrote, at a
          glance and without a banner interrupting the work. */}
      <Card className={styles.lineageCard}>
        <div className={styles.lineageHead}>
          <h3 className={styles.cardTitle}>Authorship</h3>
          <span className={styles.lineageSummary}>
            {authorship.aiTouched === 0
              ? 'Entirely authored by you'
              : `${authorship.ai} AI · ${authorship.assisted} assisted · ${authorship.manual} manual`}
          </span>
        </div>
        <ul className={styles.lineageList}>
          {TRACKED_SECTIONS.map((s) => (
            <li key={s.id} className={styles.lineageItem}>
              <span className={styles.lineageLabel}>{s.label}</span>
              <AuthorshipBadge level={sectionAuthorship[s.id] ?? narrative[s.id]?.authorship} />
            </li>
          ))}
        </ul>
      </Card>

      {!hasAnalysis ? (
        <Card className={styles.noAnalysis}>
          <p className={styles.noAnalysisTitle}>The numbers rest on operational benefit alone</p>
          <p className={styles.noAnalysisText}>
            No displacements are in the case yet, so the model has nothing retiring to offset the
            investment. Add mappings in stage 3 — by hand or with the copilot — or present this as a
            capability case and write the narrative below.
          </p>
        </Card>
      ) : null}

      <section className={styles.heroRow} aria-label="Headline metrics">
        <MetricTile
          hero
          label="Return on investment"
          value={formatPercent(c.roi)}
          caption="3-year, nominal"
          icon={<ArrowTrendingLines20Regular />}
          loading={!reportReady}
          explain={`Net benefit of ${formatCurrency(c.netBenefit)} against ${formatCurrency(
            c.investmentTotal,
          )} of incremental investment.`}
        />
        <MetricTile
          label="Estimated savings"
          value={formatCurrency(c.annualNetBenefit)}
          caption="average net, per year"
          icon={<MoneyHand20Regular />}
          loading={!reportReady}
          explain={`${formatCurrency(c.netBenefit)} of net benefit spread across the 3-year horizon.`}
        />
        <MetricTile
          label="Payback period"
          value={`${c.paybackMonths} months`}
          caption="cumulative benefit crosses zero"
          icon={<Timer20Regular />}
          loading={!reportReady}
          explain="Benefit is phased across a nine-month deployment while costs start immediately."
        />
        <MetricTile
          label="Vendors consolidated"
          value={String(c.vendorsConsolidated)}
          caption="third-party contracts retired"
          icon={<Layer20Regular />}
          loading={!reportReady}
          explain="Each retired contract also removes a console, a renewal cycle and an integration surface."
        />
      </section>

      <div className={styles.chartRow}>
        <Card className={styles.chartCard}>
          <PaybackChart cashflow={c.cashflow} paybackMonths={c.paybackMonths} />
        </Card>
        <Card className={styles.chartCard}>
          <SpendComparison
            current={c.annualThirdPartySpend}
            future={c.annualMicrosoftSpend}
            contractCount={c.vendorsConsolidated}
          />
        </Card>
      </div>

      {/* The written case. Every section can be typed directly or generated,
          and generated text can be reverted to whatever was there before. */}
      <Card className={styles.narrativeCard}>
        <div className={styles.narrativeHead}>
          <h3 className={styles.cardTitle}>The written case</h3>
          <p className={styles.narrativeLead}>
            Write these yourself, or hand any one of them to the copilot. Mixing the two is the
            normal case, not the exception.
          </p>
        </div>
        {sections.map((section) => (
          <NarrativeSection key={section.id} section={section} />
        ))}
      </Card>

      <Card className={styles.driversCard}>
        <h3 className={styles.cardTitle}>Key value drivers</h3>
        <ul className={styles.drivers}>
          {VALUE_DRIVERS.map((d) => (
            <li key={d.id} className={styles.driver}>
              <span className={styles.check} aria-hidden="true">
                <Checkmark16Filled />
              </span>
              <div>
                <span className={styles.driverTitle}>{d.title}</span>
                <p className={styles.driverText}>{d.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className={styles.ledgerRow}>
        <Card className={styles.ledgerCard}>
          <div className={styles.ledgerHead}>
            <h3 className={styles.cardTitle}>Where the benefit comes from</h3>
            <span className={styles.ledgerTotal}>{formatCurrency(c.benefitTotal)}</span>
          </div>
          <ul className={styles.ledger}>
            {c.includedDisplacements.map((d) => (
              <li key={d.id} className={styles.ledgerItem}>
                <div className={styles.ledgerMain}>
                  <span className={styles.ledgerLabel}>
                    {d.from.vendor} {d.from.product}
                  </span>
                  <span className={styles.ledgerDetail}>Displaced by {d.to.product}</span>
                </div>
                <span className={styles.ledgerValue}>{formatCurrency(d.benefit3yr)}</span>
              </li>
            ))}
            {/* Hand-entered lines sit in the same ledger as detected ones,
                labelled so a reviewer knows who put them there. */}
            {c.manualDisplacements.map((d) => (
              <li key={d.id} className={styles.ledgerItem}>
                <div className={styles.ledgerMain}>
                  <span className={styles.ledgerLabel}>
                    {d.vendor} {d.product}
                    <em className={styles.oneTime}>added by you</em>
                  </span>
                  <span className={styles.ledgerDetail}>Displaced by {d.target}</span>
                </div>
                <span className={styles.ledgerValue}>
                  {formatCurrency(Number(d.annualSpend) * 3)}
                </span>
              </li>
            ))}
            {OPERATIONAL_BENEFITS.map((b) => (
              <li key={b.id} className={styles.ledgerItem}>
                <div className={styles.ledgerMain}>
                  <span className={styles.ledgerLabel}>{b.label}</span>
                  <span className={styles.ledgerDetail}>{b.detail}</span>
                </div>
                <span className={styles.ledgerValue}>{formatCurrency(b.value)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.ledgerCard}>
          <div className={styles.ledgerHead}>
            <h3 className={styles.cardTitle}>Incremental investment</h3>
            <span className={styles.ledgerTotal}>{formatCurrency(c.investmentTotal)}</span>
          </div>
          <ul className={styles.ledger}>
            {INVESTMENT_LINES.map((l) => (
              <li key={l.id} className={styles.ledgerItem}>
                <div className={styles.ledgerMain}>
                  <span className={styles.ledgerLabel}>
                    {l.label}
                    {l.oneTime ? <em className={styles.oneTime}>one-time</em> : null}
                  </span>
                  <span className={styles.ledgerDetail}>{l.detail}</span>
                </div>
                <span className={styles.ledgerValue}>{formatCurrency(l.value)}</span>
              </li>
            ))}
          </ul>

          <div className={styles.assumptions}>
            <span className={styles.assumptionsTitle}>Assumptions</span>
            <dl className={styles.assumptionList}>
              {ASSUMPTIONS.map((a) => (
                <div key={a.label} className={styles.assumption}>
                  <dt>{a.label}</dt>
                  <dd>{a.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </div>

      <Card className={styles.actionsCard}>
        <div className={styles.actionsText}>
          <h3 className={styles.cardTitle}>Share the business case</h3>
          <p className={styles.actionsSub}>
            The copilot generates the deck, the written case and the sharing link from the same
            ledger, so the narrative and the numbers cannot drift apart.
          </p>
        </div>
        <div className={styles.actionButtons}>
          <Button
            appearance="primary"
            icon={<SlideText20Regular />}
            onClick={() =>
              notify('PowerPoint generated', '12-slide executive deck — prototype, no file produced.')
            }
          >
            Download PowerPoint
          </Button>
          <Button
            appearance="secondary"
            icon={<DocumentPdf20Regular />}
            onClick={() =>
              notify('PDF generated', 'Full business case with appendix — prototype, no file produced.')
            }
          >
            Download PDF
          </Button>
          <Button
            appearance="secondary"
            icon={<Share20Regular />}
            onClick={() =>
              notify('Share link created', 'Anyone in your tenant with the link can review — prototype.')
            }
          >
            Share business case
          </Button>
          <Button
            appearance="transparent"
            icon={<Sparkle16Filled />}
            onClick={() => ask('Draft an executive summary I can send')}
          >
            Draft the email
          </Button>
        </div>
      </Card>

      <StageFooter hint="Ask the copilot to stress-test any number before you present it." />
    </div>
  );
}
