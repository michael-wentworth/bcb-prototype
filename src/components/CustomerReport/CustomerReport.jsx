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
  DocumentPdf20Regular,
  Layer20Regular,
  MoneyHand20Regular,
  Share20Regular,
  SlideText20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';
import { NARRATIVE_SECTIONS } from '../../data/authoring.js';
import { SECURITY_OUTCOMES, currencySymbol, skuById } from '../../data/referenceData.js';
import { formatCurrency, formatPercent } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import MetricTile from '../shared/MetricTile.jsx';
import AuthorshipBadge from '../shared/AuthorshipBadge.jsx';
import SectionHeading from '../shared/SectionHeading.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import NarrativeSection from '../Narrative/NarrativeSection.jsx';
import PaybackChart from '../ResultsDashboard/PaybackChart.jsx';
import SpendComparison from '../ResultsDashboard/SpendComparison.jsx';
import styles from './CustomerReport.module.css';

const TRACKED = [
  { id: 'customer', label: 'Customer details' },
  { id: 'outcomes', label: 'Security outcomes' },
  { id: 'skus', label: 'SKU selection' },
  { id: 'competitors', label: 'Competitor products' },
];

export default function CustomerReport() {
  const {
    businessCase: c,
    customer,
    caseSetup,
    outcomes,
    skus,
    bundle,
    competitors,
    currency,
    authorship,
    sectionAuthorship,
    narrative,
    reportReady,
  } = useAppState();

  const symbol = currencySymbol(currency);
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

  const money = (v) => formatCurrency(v, { symbol });

  return (
    <div className={styles.root}>
      <Toaster toasterId={toasterId} />

      <SectionHeading
        eyebrow="Step 3 of 3"
        title={caseSetup.name || customer.accountName || 'Customer Report'}
        description={`${caseSetup.analysisPeriod}-year analysis${
          customer.numberOfUsers ? ` across ${Number(customer.numberOfUsers).toLocaleString('en-US')} users` : ''
        }. Every figure derives from what you entered on the previous two steps.`}
        actions={
          <Badge appearance="tint" color={reportReady ? 'success' : 'informative'}>
            {reportReady ? 'Ready to present' : 'Calculating…'}
          </Badge>
        }
      />

      {!c.hasInputs ? (
        <Card className={styles.noInputs}>
          <p className={styles.noInputsTitle}>Nothing to calculate yet</p>
          <p className={styles.noInputsText}>
            Add at least one SKU or competitor product on <strong>SKU Selection</strong> and the
            numbers here will fill in. You can still write the narrative below in the meantime.
          </p>
        </Card>
      ) : null}

      <section className={styles.heroRow} aria-label="Headline metrics">
        <MetricTile
          hero
          label="Return on investment"
          value={formatPercent(c.roi)}
          caption={`${c.years}-year, nominal`}
          icon={<ArrowTrendingLines20Regular />}
          loading={!reportReady}
          explain={`Net benefit of ${money(c.netBenefit)} against ${money(
            c.investmentTotal,
          )} of Microsoft investment.`}
        />
        <MetricTile
          label="Estimated savings"
          value={money(c.annualNetBenefit)}
          caption="average net, per year"
          icon={<MoneyHand20Regular />}
          loading={!reportReady}
          explain={`${money(c.netBenefit)} of net benefit across the ${c.years}-year horizon.`}
        />
        <MetricTile
          label="Payback period"
          value={c.paybackMonths ? `${c.paybackMonths} month${c.paybackMonths === 1 ? '' : 's'}` : '—'}
          caption={c.paybackMonths ? 'cumulative benefit crosses zero' : 'does not break even in horizon'}
          icon={<Timer20Regular />}
          loading={!reportReady}
          explain="Competitor savings only begin once each contract lapses, which is what moves payback out."
        />
        <MetricTile
          label="Vendors displaced"
          value={String(c.vendorsConsolidated)}
          caption="within the analysis period"
          icon={<Layer20Regular />}
          loading={!reportReady}
          explain="Competitor contracts that lapse inside the horizon. Later contracts are excluded."
        />
      </section>

      {c.hasInputs ? (
        <div className={styles.chartRow}>
          <Card className={styles.chartCard}>
            <PaybackChart cashflow={c.cashflow} paybackMonths={c.paybackMonths} symbol={symbol} />
          </Card>
          <Card className={styles.chartCard}>
            <SpendComparison
              current={c.todayAnnualSpend}
              future={c.futureAnnualSpend}
              contractCount={c.vendorsConsolidated}
              symbol={symbol}
            />
          </Card>
        </div>
      ) : null}

      {/* ----------------------- Authorship lineage ----------------------- */}
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
          {TRACKED.map((s) => (
            <li key={s.id} className={styles.lineageItem}>
              <span className={styles.lineageLabel}>{s.label}</span>
              <AuthorshipBadge level={sectionAuthorship[s.id]} />
            </li>
          ))}
          {NARRATIVE_SECTIONS.map((s) => (
            <li key={s.id} className={styles.lineageItem}>
              <span className={styles.lineageLabel}>{s.label}</span>
              <AuthorshipBadge level={narrative[s.id].authorship} />
            </li>
          ))}
        </ul>
      </Card>

      {/* -------------------------- The narrative -------------------------- */}
      <Card className={styles.narrativeCard}>
        <div className={styles.narrativeHead}>
          <h3 className={styles.cardTitle}>The written case</h3>
          <p className={styles.narrativeLead}>
            Write these yourself, or hand any one of them to the copilot. Mixing the two is the
            normal case, not the exception.
          </p>
        </div>
        {NARRATIVE_SECTIONS.map((section) => (
          <NarrativeSection key={section.id} section={section} />
        ))}
      </Card>

      {/* ----------------------------- Ledger ------------------------------ */}
      <div className={styles.ledgerRow}>
        <Card className={styles.ledgerCard}>
          <div className={styles.ledgerHead}>
            <h3 className={styles.cardTitle}>Where the benefit comes from</h3>
            <span className={styles.ledgerTotal}>{money(c.benefitTotal)}</span>
          </div>
          <ul className={styles.ledger}>
            {c.competitorLines
              .filter((l) => l.displaceable)
              .map((l) => (
                <li key={l.id} className={styles.ledgerItem}>
                  <div className={styles.ledgerMain}>
                    <span className={styles.ledgerLabel}>{l.currentProduct}</span>
                    <span className={styles.ledgerDetail}>
                      {l.newMicrosoftProduct ? `Displaced by ${l.newMicrosoftProduct}. ` : ''}
                      Contract ends {l.yearContractEnds} — {l.yearsOfBenefit} of {c.years} years in
                      scope
                    </span>
                  </div>
                  <span className={styles.ledgerValue}>{money(l.benefitTotal)}</span>
                </li>
              ))}
            {c.additionalTotal > 0 ? (
              <li className={styles.ledgerItem}>
                <div className={styles.ledgerMain}>
                  <span className={styles.ledgerLabel}>Additional products &amp; savings</span>
                  <span className={styles.ledgerDetail}>Entered as an annual value</span>
                </div>
                <span className={styles.ledgerValue}>{money(c.additionalTotal)}</span>
              </li>
            ) : null}
            {c.benefitTotal === 0 ? (
              <li className={styles.ledgerEmpty}>No benefit lines yet.</li>
            ) : null}
          </ul>
          {c.currentMicrosoftAnnual > 0 ? (
            <p className={styles.baselineNote}>
              The existing Microsoft bundle ({money(c.currentMicrosoftAnnual)} a year) is
              deliberately <strong>not</strong> counted as a saving — the customer keeps paying it.
              It appears in the spend comparison as baseline, not in the return.
            </p>
          ) : null}
        </Card>

        <Card className={styles.ledgerCard}>
          <div className={styles.ledgerHead}>
            <h3 className={styles.cardTitle}>Microsoft investment</h3>
            <span className={styles.ledgerTotal}>{money(c.investmentTotal)}</span>
          </div>
          <ul className={styles.ledger}>
            {skus.map((row) => {
              const total = row.seats.reduce(
                (sum, s) => sum + Number(s || 0) * Number(row.pricePerMonth || 0) * 12,
                0,
              );
              return (
                <li key={row.id} className={styles.ledgerItem}>
                  <div className={styles.ledgerMain}>
                    <span className={styles.ledgerLabel}>
                      {skuById(row.skuId)?.name || 'Unnamed SKU'}
                    </span>
                    <span className={styles.ledgerDetail}>
                      {row.solutionPlay || row.solutionArea || 'No solution play set'} ·{' '}
                      {symbol}
                      {row.pricePerMonth || 0}/user/month
                    </span>
                  </div>
                  <span className={styles.ledgerValue}>{money(total)}</span>
                </li>
              );
            })}
            {skus.length === 0 ? <li className={styles.ledgerEmpty}>No SKUs added yet.</li> : null}
          </ul>

          <div className={styles.assumptions}>
            <span className={styles.assumptionsTitle}>Assumptions</span>
            <dl className={styles.assumptionList}>
              <div className={styles.assumption}>
                <dt>Analysis horizon</dt>
                <dd>{c.years} years</dd>
              </div>
              <div className={styles.assumption}>
                <dt>Users</dt>
                <dd>{customer.numberOfUsers ? Number(customer.numberOfUsers).toLocaleString('en-US') : '—'}</dd>
              </div>
              <div className={styles.assumption}>
                <dt>Currency</dt>
                <dd>{currency}</dd>
              </div>
              <div className={styles.assumption}>
                <dt>Competitor MSRP discount</dt>
                <dd>{Number(competitors.msrpDiscount) || 0}%</dd>
              </div>
              <div className={styles.assumption}>
                <dt>Current bundle</dt>
                <dd>{bundle.annualPerUser ? `${symbol}${bundle.annualPerUser}/user/yr` : 'None'}</dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>

      {/* ---------------------------- Outcomes ---------------------------- */}
      {outcomes.length > 0 ? (
        <Card className={styles.outcomeCard}>
          <h3 className={styles.cardTitle}>Outcomes this case addresses</h3>
          <ul className={styles.outcomeList}>
            {SECURITY_OUTCOMES.filter((o) => outcomes.includes(o.id)).map((o) => (
              <li key={o.id} className={styles.outcomeItem}>
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
                <div>
                  <span className={styles.outcomeLabel}>{o.label}</span>
                  <p className={styles.outcomeDetail}>{o.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className={styles.actionsCard}>
        <div className={styles.actionsText}>
          <h3 className={styles.cardTitle}>Share the business case</h3>
          <p className={styles.actionsSub}>
            The deck, the written case and the sharing link all come from the same inputs, so the
            narrative and the numbers cannot drift apart.
          </p>
        </div>
        <div className={styles.actionButtons}>
          <Button
            appearance="primary"
            icon={<SlideText20Regular />}
            onClick={() => notify('PowerPoint generated', 'Executive deck — prototype, no file produced.')}
          >
            Download PowerPoint
          </Button>
          <Button
            appearance="secondary"
            icon={<DocumentPdf20Regular />}
            onClick={() => notify('PDF generated', 'Full business case — prototype, no file produced.')}
          >
            Download PDF
          </Button>
          <Button
            appearance="secondary"
            icon={<Share20Regular />}
            onClick={() => notify('Share link created', 'Prototype — nothing left the browser.')}
          >
            Share
          </Button>
        </div>
      </Card>

      <StepFooter hint="Ask the copilot to stress-test any number before you present it." />
    </div>
  );
}
