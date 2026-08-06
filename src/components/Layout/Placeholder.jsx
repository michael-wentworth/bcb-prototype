import React from 'react';
import { Button, Card } from '@fluentui/react-components';
import {
  Add20Filled,
  ShieldCheckmark20Regular,
} from '@fluentui/react-icons';
import { EXAMPLE_CASES, caseMetrics } from '../../data/caseLibrary.js';
import { currencySymbolFor, geographyById } from '../../data/referenceData.js';

const currencyOf = (e) => geographyById(e.input.customer.geography)?.currency || 'USD';
import { formatCurrency, formatPercent } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './Placeholder.module.css';

const VIEWS = {
  landing: {
    icon: <ShieldCheckmark20Regular />,
    title: 'Security BCB',
    lead: 'No page here yet',
  },
};

export default function Placeholder({ view }) {
  const { setView, newCase, openCase } = useAppState();

  if (view === 'examples') return <ExampleCases />;

  const meta = VIEWS[view] || VIEWS.landing;

  return (
    <div className={styles.root}>
      <span className={styles.icon} aria-hidden="true">
        {meta.icon}
      </span>
      <h1 className={styles.title}>{meta.title}</h1>
      <p className={styles.lead}>{meta.lead}</p>
      <div className={styles.actions}>
        <Button appearance="primary" icon={<Add20Filled />} onClick={newCase}>
          Create business case
        </Button>
        <Button appearance="secondary" onClick={() => setView('myCases')}>
          Go to My cases
        </Button>
      </div>
    </div>
  );
}

/**
 * Example Cases gets a real page rather than a stub — it is the strongest
 * onboarding asset in the product, so burying it would waste it.
 */
function ExampleCases() {
  const { openCase, newCase } = useAppState();

  return (
    <div className={styles.examplesRoot}>
      <header className={styles.examplesHeader}>
        <div>
          <h1 className={styles.title}>Example cases</h1>
          <p className={styles.lead}>
            Finished business cases built for Microsoft customers
          </p>
        </div>
        <Button appearance="primary" icon={<Add20Filled />} onClick={newCase}>
          Create business case
        </Button>
      </header>

      <div className={styles.grid}>
        {EXAMPLE_CASES.map((entry) => {
          const m = caseMetrics(entry);
          const symbol = currencySymbolFor(currencyOf(entry), EXAMPLE_CASES.map(currencyOf));
          return (
            <Card key={entry.id} className={styles.card}>
              <button type="button" className={styles.cardHit} onClick={() => openCase(entry)}>
                <span className={styles.srOnly}>Open {entry.title}</span>
              </button>
              <div className={styles.cardBody}>
                <span className={styles.cardCustomer}>
                  {entry.customer} · {entry.industry}
                </span>
                <h2 className={styles.cardTitle}>{entry.title}</h2>
                <p className={styles.cardHighlight}>{entry.highlight}</p>
              </div>
              <dl className={styles.cardStats}>
                <div>
                  <dt>ROI</dt>
                  <dd>{formatPercent(m.roi)}</dd>
                </div>
                <div>
                  <dt>Net / year</dt>
                  <dd>{formatCurrency(m.annualNetBenefit, { symbol })}</dd>
                </div>
                <div>
                  <dt>Payback</dt>
                  <dd>{m.paybackMonths ? `${m.paybackMonths} mo` : 'n/a'}</dd>
                </div>
                <div>
                  <dt>Horizon</dt>
                  <dd>{m.years} yrs</dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>

      <p className={styles.footNote}>
        Editing an example will not change the published example.
      </p>
    </div>
  );
}
