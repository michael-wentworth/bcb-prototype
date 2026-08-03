import React from 'react';
import { Button, Card, Input } from '@fluentui/react-components';
import { Dismiss16Regular } from '@fluentui/react-icons';
import { areaById } from '../../data/capabilities.js';
import { competitorChoices } from '../../data/capabilityModel.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './Capability.module.css';

/**
 * Step 4 — what it replaces.
 *
 * The inversion the whole redesign rests on. The old flow asked a seller to
 * inventory the customer's vendors and then work out which ones Microsoft could
 * displace; this asks "who do you use for identity governance" against a list of
 * the four or five vendors that actually sell it.
 *
 * Only capabilities the future state genuinely adds appear here. Everything
 * retained is already covered and everything strategic has nothing to displace,
 * so neither is worth a seller's attention — which is what keeps this step to a
 * handful of questions rather than a full estate audit.
 */
export default function CompetitorMapping() {
  const {
    capabilityCase,
    capabilityCompetitors,
    currency,
    addCapabilityRow,
    updateCapabilityRow,
    removeCapabilityRow,
  } = useAppState();

  const groups = competitorChoices(capabilityCase.delta);
  const rows = capabilityCompetitors.rows;
  const rowFor = (capId) => rows.find((r) => r.capabilityId === capId);
  const symbol = currency === 'USD' ? '$' : '';

  const pick = (capId, vendor) => {
    const existing = rowFor(capId);
    if (existing && existing.product === vendor) {
      removeCapabilityRow(existing.id);
      return;
    }
    if (existing) {
      updateCapabilityRow(existing.id, 'product', vendor);
      return;
    }
    addCapabilityRow({ capabilityId: capId, product: vendor });
  };

  if (groups.length === 0) {
    return (
      <div className={styles.root}>
        <StepMasthead description="Only the capabilities the future state adds, and only the vendors that sell them." />
        <Card className={styles.card}>
          <p className={styles.empty}>
            Nothing to map. Either no future state is selected yet, or everything it adds is
            net-new with no market equivalent to displace.
          </p>
        </Card>
        <StepFooter hint="No consolidation opportunities in this case." />
      </div>
    );
  }

  const named = rows.filter((r) => r.product).length;

  return (
    <div className={styles.root}>
      <StepMasthead description="Only the capabilities the future state adds, grouped the way a seller thinks about them. Skip anything the customer does not buy from someone else — a blank is an honest answer." />

      {groups.map((g) => (
        <Card key={`${g.area}:${g.group}`} className={styles.card}>
          <div>
            <h2 className={styles.cardTitle}>{g.group}</h2>
            <p className={styles.cardLead}>
              {areaById(g.area)?.label} · {g.capabilities.length} capabilit
              {g.capabilities.length === 1 ? 'y' : 'ies'} the future state would add
            </p>
          </div>

          <div className={styles.mapGroup}>
            {g.capabilities.map((c) => {
              const row = rowFor(c.id);
              return (
                <div key={c.id}>
                  <div className={styles.mapCap}>
                    <span>
                      <span className={styles.mapCapName}>{c.name}</span>
                      <span className={styles.mapCapProduct}>{c.product}</span>
                    </span>
                    <div>
                      <div className={styles.vendorRow}>
                        {c.competitors.map((v) => (
                          <button
                            key={v}
                            type="button"
                            className={`${styles.vendor} ${row?.product === v ? styles.vendorOn : ''}`}
                            aria-pressed={row?.product === v}
                            onClick={() => pick(c.id, v)}
                          >
                            {v}
                          </button>
                        ))}
                        <span className={styles.vendorNone}>
                          {row?.product ? '' : 'or leave blank if they have none'}
                        </span>
                      </div>

                      {/* The cost and the contract year only appear once a vendor
                          is named. Asking for them up front would be asking a
                          seller to price a product the customer may not own. */}
                      {row?.product ? (
                        <div className={styles.costRow}>
                          <span className={styles.costLabel}>What do they pay for it?</span>
                          <Input
                            size="small"
                            value={row.annualCost}
                            onChange={(_, d) => updateCapabilityRow(row.id, 'annualCost', d.value)}
                            placeholder="Annual cost"
                            contentBefore={symbol}
                            aria-label={`Annual cost for ${row.product}`}
                          />
                          <Input
                            size="small"
                            value={row.yearContractEnds}
                            onChange={(_, d) =>
                              updateCapabilityRow(row.id, 'yearContractEnds', d.value)
                            }
                            placeholder="Contract ends"
                            aria-label={`Contract end year for ${row.product}`}
                          />
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={<Dismiss16Regular />}
                            aria-label={`Remove ${row.product}`}
                            onClick={() => removeCapabilityRow(row.id)}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <StepFooter
        hint={
          named
            ? `${named} incumbent${named === 1 ? '' : 's'} named. A saving only counts from the year after its contract lapses.`
            : 'Name an incumbent anywhere it applies, or continue — the case will argue on capability alone.'
        }
      />
    </div>
  );
}
