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
  OptionGroup,
} from '@fluentui/react-components';
import {
  Add16Filled,
  Checkmark16Regular,
  Delete16Regular,
  Sparkle16Filled,
} from '@fluentui/react-icons';
import {
  COMPETITOR_MATRIX,
  MICROSOFT_SKUS,
  displacementOptions,
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
    ensureSkuRow,
    updateSkuRow,
    updateSkuSeats,
    removeSkuRow,
    updateCompetitorRow,
    goToStep,
    ask,
  } = useAppState();

  const symbol = currencySymbol(currency);

  return (
    <div className={styles.root}>
      <StepMasthead
        description="The solution you are proposing: the outcomes it has to serve, the SKUs that serve them, and the vendors each one replaces."
      />

      {/* ---------------------- Outcomes and coverage ---------------------- */}
      <Outcomes
        outcomes={outcomes}
        skus={skus}
        users={customer.numberOfUsers}
        onToggle={toggleOutcome}
        onSetAll={setAllOutcomes}
        onEnsureSku={ensureSkuRow}
        onAsk={ask}
      />

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

      {/* ---------------------- Competitive displacement ------------------ */}
      <CompetitiveDisplacement
        competitors={competitors}
        businessCase={businessCase}
        symbol={symbol}
        onMap={updateCompetitorRow}
        skus={skus}
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
/**
 * Outcomes, and whether the proposal actually covers them.
 *
 * These were two cards: a grid of checkboxes, and a read-only "Why this
 * recommendation" further down that echoed the same selections back. That echo
 * announced it had "nothing to fill in", which is the tell — it sat between the
 * seller and the thing they needed to do, and the thing they needed to do was
 * scroll elsewhere and add a SKU by hand.
 *
 * Now one card answers one question: what does the customer want, and is
 * anything in the proposal delivering it. A gap is a button, not a sentence.
 */
function Outcomes({ outcomes, skus, users, onToggle, onSetAll, onEnsureSku, onAsk }) {
  const allSelected = outcomes.length === SECURITY_OUTCOMES.length;

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

  const covered = lines.filter((l) => l.served.length > 0).length;

  const add = (sku) =>
    onEnsureSku(
      {
        skuId: sku.id,
        solutionArea: sku.solutionArea,
        solutionPlay: sku.solutionPlay,
        pricePerMonth: String(sku.listPrice ?? ''),
      },
      users,
    );

  return (
    <Card className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>
            What security outcomes is the customer trying to achieve?
          </h2>
        </div>
        <Checkbox
          checked={allSelected}
          onChange={(_, d) => onSetAll(d.checked ? SECURITY_OUTCOMES.map((o) => o.id) : [])}
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
              onChange={() => onToggle(o.id)}
              aria-label={o.label}
            />
            <span className={styles.outcomeBody}>
              <span className={styles.outcomeLabel}>{o.label}</span>
              <span className={styles.outcomeDetail}>{o.detail}</span>
            </span>
          </label>
        ))}
      </div>

      {selected.length > 0 ? (
        <div className={styles.coverage}>
          <p className={styles.coverageHead}>
            {covered === selected.length
              ? `${selected.length} selected outcome${selected.length === 1 ? " is" : "s are"} covered by a product in the proposal.`
              : `${covered} of ${selected.length} selected outcomes covered. Add a product for the rest.`}
          </p>

          <ul className={styles.coverageList}>
            {lines.map((line) => (
              <li key={line.id} className={styles.coverageRow}>
                <span className={styles.coverageOutcome}>{line.label}</span>
                <span className={styles.coverageSkus}>
                  {line.served.map((sku) => (
                    <span key={sku.id} className={styles.coveredChip}>
                      <Checkmark16Regular aria-hidden="true" />
                      {sku.name}
                    </span>
                  ))}
                  {line.served.length === 0 && line.suggested.length === 0 ? (
                    <span className={styles.coverageGap}>Nothing in the catalogue covers this.</span>
                  ) : null}
                  {line.served.length === 0
                    ? line.suggested.map((sku) => (
                        <Button
                          key={sku.id}
                          size="small"
                          appearance="secondary"
                          icon={<Add16Filled />}
                          onClick={() => add(sku)}
                        >
                          {sku.name}
                        </Button>
                      ))
                    : null}
                </span>
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

          <div className={styles.rowActions}>
            <Button
              appearance="transparent"
              icon={<Sparkle16Filled className={styles.aiIcon} />}
              onClick={() => onAsk('Explain why these SKUs fit the outcomes I selected')}
            >
              Explain the fit
            </Button>
          </div>
        </div>
      ) : (
        <p className={styles.emptyNote}>
          Pick the outcomes this proposal has to serve. Each one will show the Microsoft product
          that delivers it, and you can add it here.
        </p>
      )}
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
function CompetitiveDisplacement({ competitors, skus, businessCase, symbol, onMap, onBack, onAsk }) {
  const [matrixOpen, setMatrixOpen] = useState(false);

  const rows = competitors.rows || [];
  const lineFor = (id) => businessCase.competitorLines.find((l) => l.id === id);

  const mapped = rows.filter((r) => (r.newMicrosoftProduct || '').trim());
  const anyOption = displacementOptions(skus).all;
  const annualSpend = (r) => lineFor(r.id)?.annualCost ?? (Number(r.competitorCost) || 0);
  const mappedSpend = mapped.reduce((sum, r) => sum + annualSpend(r), 0);

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
                        {/* Only what this case actually buys — the SKUs chosen
                            above, plus the components of any suite among them.
                            Offering the whole catalogue let a seller claim a
                            displacement by a product the case never pays for,
                            which books the competitor saving with no matching
                            Microsoft cost. Not freeform, for the same reason.

                            Grouped, not filtered: the products that serve this
                            competitor's capability come first, and the rest stay
                            selectable because a seller can have a reason we did
                            not anticipate. */}
                        <Combobox
                          placeholder={
                            anyOption.length
                              ? 'Select a Microsoft product'
                              : 'Add a Microsoft product above first'
                          }
                          disabled={anyOption.length === 0}
                          aria-label={`Microsoft product replacing ${r.currentProduct}`}
                          value={r.newMicrosoftProduct}
                          selectedOptions={
                            r.newMicrosoftProduct ? [r.newMicrosoftProduct] : []
                          }
                          onOptionSelect={(_, d) =>
                            onMap(r.id, { newMicrosoftProduct: d.optionText || d.optionValue })
                          }
                          className={styles.mapInput}
                        >
                          {(() => {
                            const o = displacementOptions(
                              skus,
                              r.newMicrosoftProduct,
                              r.softwareSolution,
                            );
                            if (!o.matched.length) {
                              return o.all.map((name) => (
                                <Option key={name} value={name}>
                                  {name}
                                </Option>
                              ));
                            }
                            return (
                              <>
                                <OptionGroup label={`Serves ${r.softwareSolution}`}>
                                  {o.matched.map((name) => (
                                    <Option key={name} value={name}>
                                      {name}
                                    </Option>
                                  ))}
                                </OptionGroup>
                                {o.other.length ? (
                                  <OptionGroup label="Also in this case">
                                    {o.other.map((name) => (
                                      <Option key={name} value={name}>
                                        {name}
                                      </Option>
                                    ))}
                                  </OptionGroup>
                                ) : null}
                              </>
                            );
                          })()}
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
