import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Combobox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Input,
  Option,
} from '@fluentui/react-components';
import { Add16Filled, Delete16Regular, Sparkle16Filled } from '@fluentui/react-icons';
import {
  COMPETITOR_MATRIX,
  MICROSOFT_SKUS,
  SECURITY_OUTCOMES,
  SOLUTION_AREAS,
  SOLUTION_PLAYS,
  currencySymbol,
  skuById,
} from '../../data/referenceData.js';
import { formatCurrency } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './SkuSelection.module.css';

/**
 * Step 2 — the proposed future.
 *
 * Everything the customer has today is captured on step 1; nothing on this screen
 * asks for it again. What is left is the recommendation itself: the outcomes it
 * has to serve, the SKUs that serve them, why those SKUs, and which incumbent
 * vendor each one displaces.
 */
export default function SkuSelection() {
  const {
    outcomes,
    skus,
    competitors,
    customer,
    currency,
    businessCase,
    toggleOutcome,
    setAllOutcomes,
    addSkuRow,
    updateSkuRow,
    updateSkuSeats,
    removeSkuRow,
    updateCompetitorRow,
    goToStep,
    ask,
  } = useAppState();

  const symbol = currencySymbol(currency);
  const allSelected = outcomes.length === SECURITY_OUTCOMES.length;

  return (
    <div className={styles.root}>
      <StepMasthead
        description="The solution you are proposing: the outcomes it has to serve, the SKUs that serve them, and the vendors each one replaces."
      />

      {/* ---------------------------- Outcomes ---------------------------- */}
      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>
              What security outcomes is the customer trying to achieve?
            </h2>
          </div>
          <Checkbox
            checked={allSelected}
            onChange={(_, d) => setAllOutcomes(d.checked ? SECURITY_OUTCOMES.map((o) => o.id) : [])}
            label="Select all"
            labelPosition="before"
          />
        </div>

        <div className={styles.outcomeGrid}>
          {SECURITY_OUTCOMES.map((o) => (
            <label
              key={o.id}
              className={`${styles.outcome} ${outcomes.includes(o.id) ? styles.outcomeOn : ''}`}
            >
              <Checkbox
                checked={outcomes.includes(o.id)}
                onChange={() => toggleOutcome(o.id)}
                aria-label={o.label}
              />
              <span className={styles.outcomeBody}>
                <span className={styles.outcomeLabel}>{o.label}</span>
                <span className={styles.outcomeDetail}>{o.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      {/* ------------------------------ SKUs ------------------------------ */}
      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Recommended Microsoft solution</h2>
            <p className={styles.cardLead}>
              The SKUs you are proposing, and the seats and price behind each one. This is the
              investment side of the case.
            </p>
          </div>
        </div>

        {skus.map((row, rowIndex) => {
          const catalog = skuById(row.skuId);
          return (
            <div key={row.id} className={styles.skuRow}>
              <div className={styles.skuHead}>
                <span className={styles.skuIndex}>SKU {rowIndex + 1}</span>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Delete16Regular />}
                  aria-label={`Remove SKU ${rowIndex + 1}`}
                  onClick={() => removeSkuRow(row.id)}
                  className={styles.skuRemove}
                />
              </div>

              <FormField label="Microsoft SKU">
                {(id) => (
                  <Dropdown
                    id={id}
                    placeholder="Select"
                    value={catalog?.name || ''}
                    selectedOptions={row.skuId ? [row.skuId] : []}
                    onOptionSelect={(_, d) => {
                      const sku = skuById(d.optionValue);
                      updateSkuRow(row.id, {
                        skuId: d.optionValue,
                        solutionArea: sku?.solutionArea || row.solutionArea,
                        solutionPlay: sku?.solutionPlay || row.solutionPlay,
                        pricePerMonth: row.pricePerMonth || String(sku?.listPrice ?? ''),
                      });
                    }}
                  >
                    {MICROSOFT_SKUS.map((s) => (
                      <Option key={s.id} value={s.id} text={s.name}>
                        {s.name}
                      </Option>
                    ))}
                  </Dropdown>
                )}
              </FormField>

              <div className={styles.skuMeta}>
                <FormField label="Solution area">
                  {(id) => (
                    <Dropdown
                      id={id}
                      placeholder="Select"
                      value={row.solutionArea}
                      selectedOptions={row.solutionArea ? [row.solutionArea] : []}
                      onOptionSelect={(_, d) => updateSkuRow(row.id, { solutionArea: d.optionValue })}
                    >
                      {SOLUTION_AREAS.map((a) => (
                        <Option key={a} value={a}>
                          {a}
                        </Option>
                      ))}
                    </Dropdown>
                  )}
                </FormField>
                <FormField label="Solution play">
                  {(id) => (
                    <Dropdown
                      id={id}
                      placeholder="Select"
                      value={row.solutionPlay}
                      selectedOptions={row.solutionPlay ? [row.solutionPlay] : []}
                      onOptionSelect={(_, d) => updateSkuRow(row.id, { solutionPlay: d.optionValue })}
                    >
                      {SOLUTION_PLAYS.map((p) => (
                        <Option key={p} value={p}>
                          {p}
                        </Option>
                      ))}
                    </Dropdown>
                  )}
                </FormField>
              </div>

              <p className={styles.seatsLabel}>How many seats will be required per year?</p>
              <div className={styles.seatsGrid}>
                {row.seats.map((seat, i) => (
                  <FormField key={i} label={`Year ${i + 1}`}>
                    {(id) => (
                      <Input
                        id={id}
                        value={seat}
                        onChange={(_, d) => updateSkuSeats(row.id, i, d.value)}
                        placeholder={customer.numberOfUsers || '1000'}
                      />
                    )}
                  </FormField>
                ))}
                <FormField label="Price per month">
                  {(id) => (
                    <Input
                      id={id}
                      value={row.pricePerMonth}
                      onChange={(_, d) => updateSkuRow(row.id, { pricePerMonth: d.value })}
                      placeholder="0"
                      contentBefore={symbol}
                    />
                  )}
                </FormField>
              </div>

              {row.pricePerMonth && row.seats[0] ? (
                <p className={styles.skuTotal}>
                  Year 1 cost{' '}
                  <strong>
                    {formatCurrency(Number(row.seats[0]) * Number(row.pricePerMonth) * 12, {
                      symbol,
                    })}
                  </strong>
                </p>
              ) : null}
            </div>
          );
        })}

        <div className={styles.rowActions}>
          <Button
            appearance="secondary"
            icon={<Add16Filled />}
            onClick={() => addSkuRow({}, customer.numberOfUsers)}
          >
            Add SKU
          </Button>
          <Button
            appearance="transparent"
            icon={<Sparkle16Filled className={styles.aiIcon} />}
            onClick={() => ask('Which SKUs match the outcomes I selected?')}
          >
            Suggest SKUs
          </Button>
        </div>
      </Card>

      {/* -------------------- Why this recommendation --------------------- */}
      <Rationale outcomes={outcomes} skus={skus} onAsk={ask} />

      {/* ---------------------- Competitive displacement ------------------ */}
      <CompetitiveDisplacement
        competitors={competitors}
        businessCase={businessCase}
        symbol={symbol}
        onMap={updateCompetitorRow}
        onBack={() => goToStep(0)}
        onAsk={ask}
      />

      <StepFooter />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Why this recommendation — derived, never typed.
 *
 * Each selected outcome carries the SKUs it implies. Crossing that against the
 * SKUs actually chosen gives both halves of the argument: which outcomes the
 * proposal covers, and which it does not cover yet.
 */
function Rationale({ outcomes, skus, onAsk }) {
  const chosenIds = useMemo(
    () => Array.from(new Set(skus.map((r) => r.skuId).filter(Boolean))),
    [skus],
  );

  const selected = useMemo(
    () => SECURITY_OUTCOMES.filter((o) => outcomes.includes(o.id)),
    [outcomes],
  );

  const lines = useMemo(
    () =>
      selected.map((o) => ({
        ...o,
        served: o.implies.filter((id) => chosenIds.includes(id)).map(skuById).filter(Boolean),
        suggested: o.implies.filter((id) => !chosenIds.includes(id)).map(skuById).filter(Boolean),
      })),
    [selected, chosenIds],
  );

  // A SKU nobody asked for still costs money — worth naming rather than hiding.
  const unattached = useMemo(
    () =>
      chosenIds
        .filter((id) => !selected.some((o) => o.implies.includes(id)))
        .map(skuById)
        .filter(Boolean),
    [chosenIds, selected],
  );

  const missing =
    selected.length === 0 && chosenIds.length === 0
      ? 'Select the security outcomes above, then add the SKUs you are proposing. This card writes itself once both are in.'
      : selected.length === 0
        ? 'No security outcomes are selected yet. Pick the outcomes this proposal has to serve and each SKU below will be tied back to one.'
        : chosenIds.length === 0
          ? 'No Microsoft SKU has been chosen yet. Add at least one to the recommended solution above and it will be matched to the outcomes you selected.'
          : null;

  return (
    <Card className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>Why this recommendation</h2>
          <p className={styles.cardLead}>
            Every outcome the customer named, and the products in the proposal that answer it. This
            is derived from your selections above — there is nothing to fill in here.
          </p>
        </div>
      </div>

      {missing ? (
        <p className={styles.emptyNote}>{missing}</p>
      ) : (
        <>
          <ul className={styles.rationaleList}>
            {lines.map((line) => (
              <li key={line.id} className={styles.rationaleRow}>
                <div className={styles.rationaleOutcome}>
                  <span className={styles.rationaleLabel}>{line.label}</span>
                  <span className={styles.rationaleDetail}>{line.detail}</span>
                </div>
                <div className={styles.rationaleSkus}>
                  {line.served.length > 0 ? (
                    line.served.map((s) => (
                      <span key={s.id} className={styles.chip}>
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span className={styles.rationaleGap}>
                      Nothing in the proposal covers this yet
                      {line.suggested.length > 0
                        ? ` — ${line.suggested.map((s) => s.name).join(' or ')} would serve it.`
                        : '.'}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {unattached.length > 0 ? (
            <p className={styles.emptyNote}>
              {unattached.map((s) => s.name).join(', ')}{' '}
              {unattached.length === 1 ? 'is' : 'are'} in the proposal but not tied to any outcome
              the customer named. Either select the outcome it serves, or be ready to justify it on
              its own.
            </p>
          ) : null}
        </>
      )}

      <div className={styles.rowActions}>
        <Button
          appearance="transparent"
          icon={<Sparkle16Filled className={styles.aiIcon} />}
          onClick={() => onAsk('Explain why these SKUs fit the outcomes I selected')}
        >
          Explain the fit
        </Button>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Competitive displacement — one row per competitor captured on step 1.
 *
 * The rows themselves are current state and are not editable here; the only
 * field this screen owns is the Microsoft product each vendor gives way to.
 */
function CompetitiveDisplacement({ competitors, businessCase, symbol, onMap, onBack, onAsk }) {
  const [matrixOpen, setMatrixOpen] = useState(false);

  const rows = competitors.rows || [];
  const lineFor = (id) => businessCase.competitorLines.find((l) => l.id === id);

  const mapped = rows.filter((r) => (r.newMicrosoftProduct || '').trim());
  const annualSpend = (r) => lineFor(r.id)?.annualCost ?? (Number(r.competitorCost) || 0);
  const mappedSpend = mapped.reduce((sum, r) => sum + annualSpend(r), 0);
  const discounted = Number(competitors.msrpDiscount) > 0;

  return (
    <Card className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>Competitive displacement</h2>
          <p className={styles.cardLead}>
            What each incumbent vendor gives way to. The products and their costs come from the
            customer environment you captured on step 1 — the Microsoft replacement is the decision
            you make here.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <>
          <p className={styles.emptyNote}>
            No competitor products have been captured for this customer, so there is nothing to
            displace. Add them to the competitive environment on step 1 and they will appear here
            ready to map.
          </p>
          <div className={styles.rowActions}>
            <Button appearance="secondary" onClick={onBack}>
              Go to customer environment
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.summaryRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {mapped.length} of {rows.length}
              </span>
              <span className={styles.statLabel}>
                competitor products mapped to a Microsoft replacement
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{formatCurrency(mappedSpend, { symbol })}</span>
              <span className={styles.statLabel}>
                annual competitor spend those mappings carry
                {discounted ? `, net of the ${competitors.msrpDiscount}% MSRP discount` : ''}
              </span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Current product</th>
                  <th scope="col" className={styles.numeric}>
                    Annual spend
                  </th>
                  <th scope="col">Replaced by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  return (
                    <tr key={r.id}>
                      <td>
                        <span className={styles.cellMain}>{r.currentProduct}</span>
                        <span className={styles.cellSub}>{r.softwareSolution || '—'}</span>
                      </td>
                      <td className={styles.numeric}>
                        {formatCurrency(annualSpend(r), { symbol })}
                      </td>
                      <td className={styles.mapCell}>
                        <Combobox
                          freeform
                          placeholder="Select or type a Microsoft product"
                          aria-label={`Microsoft product replacing ${r.currentProduct}`}
                          value={r.newMicrosoftProduct}
                          selectedOptions={
                            r.newMicrosoftProduct ? [r.newMicrosoftProduct] : []
                          }
                          onOptionSelect={(_, d) =>
                            onMap(r.id, { newMicrosoftProduct: d.optionText || d.optionValue })
                          }
                          onChange={(e) =>
                            onMap(r.id, { newMicrosoftProduct: e.target.value })
                          }
                          className={styles.mapInput}
                        >
                          {MICROSOFT_SKUS.map((s) => (
                            <Option key={s.id} value={s.name}>
                              {s.name}
                            </Option>
                          ))}
                        </Combobox>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.rowActions}>
            <Button appearance="secondary" onClick={() => setMatrixOpen(true)}>
              View competitor matrix
            </Button>
            <Button
              appearance="transparent"
              icon={<Sparkle16Filled className={styles.aiIcon} />}
              onClick={() => onAsk('What are we displacing, and what is it worth?')}
            >
              Read back the displacement
            </Button>
          </div>
        </>
      )}

      <Dialog open={matrixOpen} onOpenChange={(_, d) => setMatrixOpen(d.open)}>
        <DialogSurface className={styles.matrixSurface}>
          <DialogBody>
            <DialogTitle>Competitor matrix</DialogTitle>
            <DialogContent>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Software solution</th>
                      <th scope="col">Common competitors</th>
                      <th scope="col">Microsoft product</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPETITOR_MATRIX.map((m) => (
                      <tr key={m.solution}>
                        <td>{m.solution}</td>
                        <td>{m.competitors}</td>
                        <td>{m.microsoft}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Card>
  );
}
