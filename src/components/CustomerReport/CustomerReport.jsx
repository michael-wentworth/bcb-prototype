import React from 'react';
import {
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
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import SharePopover from '../shared/SharePopover.jsx';
import NarrativeSection from '../Narrative/NarrativeSection.jsx';
import PaybackChart from '../ResultsDashboard/PaybackChart.jsx';
import SpendComparison from '../ResultsDashboard/SpendComparison.jsx';
import styles from './CustomerReport.module.css';

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

      <StepMasthead
        description={`${caseSetup.analysisPeriod}-year analysis${
          customer.numberOfUsers ? ` across ${Number(customer.numberOfUsers).toLocaleString('en-US')} users` : ''
        }. Every figure derives from what you entered on the previous two steps.`}
      />

      {!c.hasInputs ? (
        <Card className={styles.noInputs}>
          <p className={styles.noInputsTitle}>Nothing to calculate yet</p>
          <p className={styles.noInputsText}>
            Add at least one SKU or competitor product on <strong>Recommendations</strong> and the
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
          caption={c.paybackMonths ? undefined : 'does not break even in horizon'}
          icon={<Timer20Regular />}
          loading={!reportReady}
          explain="Competitor savings only begin once each contract lapses, which is what moves payback out."
        />
        <MetricTile
          label="Vendors displaced"
          value={String(c.vendorsConsolidated)}
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

      {/* -------------------------- The narrative -------------------------- */}
      <Card className={styles.narrativeCard}>
        <div className={styles.narrativeHead}>
          <h2 className={styles.cardTitle}>The written case</h2>
          <p className={styles.narrativeLead}>
            The parts a reader remembers after the numbers have faded.
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
            <h2 className={styles.cardTitle}>Where the benefit comes from</h2>
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
            <h2 className={styles.cardTitle}>Microsoft investment</h2>
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
          <h2 className={styles.cardTitle}>Outcomes this case addresses</h2>
          <ul className={styles.outcomeList}>
            {SECURITY_OUTCOMES.filter((o) => outcomes.includes(o.id)).map((o) => (
              <li key={o.id} className={styles.outcomeItem}>
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
          <h2 className={styles.cardTitle}>Share the business case</h2>
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
          {/* The same popover the step band opens, so the two cannot diverge.
              The downloads stay as buttons here — someone standing on the report
              should not have to hunt up into the app chrome for them. */}
          <SharePopover>
            <Button appearance="secondary" icon={<Share20Regular />}>
              Share
            </Button>
          </SharePopover>
        </div>
      </Card>

      <StepFooter />
    </div>
  );
}
