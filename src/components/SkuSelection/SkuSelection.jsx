import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
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
  MS_BUNDLES,
  SECURITY_OUTCOMES,
  SOFTWARE_SOLUTIONS,
  SOLUTION_AREAS,
  SOLUTION_PLAYS,
  currencySymbol,
  skuById,
} from '../../data/referenceData.js';
import { CASE_START_YEAR, formatCurrency } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './SkuSelection.module.css';

export default function SkuSelection() {
  const {
    outcomes,
    skus,
    bundle,
    competitors,
    caseSetup,
    customer,
    currency,
    businessCase,
    toggleOutcome,
    setAllOutcomes,
    addSkuRow,
    updateSkuRow,
    updateSkuSeats,
    removeSkuRow,
    setBundle,
    setCompetitorDiscount,
    addCompetitorRow,
    removeCompetitorRow,
    ask,
  } = useAppState();

  const symbol = currencySymbol(currency);
  const years = Number(caseSetup.analysisPeriod) || 3;
  const allSelected = outcomes.length === SECURITY_OUTCOMES.length;

  return (
    <div className={styles.root}>
      <StepMasthead
        description="What the customer is buying, what they already have, and what it replaces. Contract end dates decide how much of each saving lands inside the analysis period."
      />

      {/* ---------------------------- Outcomes ---------------------------- */}
      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>
              What security outcomes is the customer trying to achieve?
            </h2>
            <p className={styles.cardLead}>
              Select the areas where your customer is experiencing the most security challenges.
            </p>
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

        {outcomes.length > 0 ? (
          <Button
            size="small"
            appearance="transparent"
            className={styles.askLink}
            icon={<Sparkle16Filled className={styles.aiIcon} />}
            onClick={() => ask('Which SKUs match the outcomes I selected?')}
          >
            Ask which SKUs match these outcomes
          </Button>
        ) : null}
      </Card>

      {/* ------------------------------ SKUs ------------------------------ */}
      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Select a SKU</h2>
            <p className={styles.cardLead}>
              Choose the Microsoft SKU(s) to model, then set the number of seats required per year.
            </p>
          </div>
          <Badge appearance="tint" color={skus.length ? 'brand' : 'informative'}>
            {skus.length} SKU{skus.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {skus.length === 0 ? (
          <p className={styles.empty}>
            No SKUs yet. Add one below to start building the Microsoft side of the case.
          </p>
        ) : null}

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
                <FormField label="Solution Area">
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
                <FormField label="Solution Play">
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

      {/* ------------------------- Current bundle ------------------------- */}
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Build from a current bundle</h2>
        <p className={styles.cardLead}>
          What the customer already pays Microsoft. This offsets the uplift rather than counting as
          new spend.
        </p>
        <div className={styles.bundleGrid}>
          <FormField label="Choose your customer's current Microsoft Bundle">
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select"
                value={MS_BUNDLES.find((b) => b.id === bundle.bundleId)?.name || ''}
                selectedOptions={bundle.bundleId ? [bundle.bundleId] : []}
                onOptionSelect={(_, d) => setBundle('bundleId', d.optionValue)}
              >
                {MS_BUNDLES.map((b) => (
                  <Option key={b.id} value={b.id} text={b.name}>
                    {b.name}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField label="Annual license price" help={`Per-user cost, ${currency}`}>
            {(id) => (
              <Input
                id={id}
                value={bundle.annualPerUser}
                onChange={(_, d) => setBundle('annualPerUser', d.value)}
                placeholder="0"
                contentBefore={symbol}
              />
            )}
          </FormField>

          <FormField
            label="Do you own any additional Microsoft products or have any licensing savings from Microsoft?"
            help="Enter total annual value of extra products / savings"
            span
          >
            {(id) => (
              <Input
                id={id}
                value={bundle.additionalValue}
                onChange={(_, d) => setBundle('additionalValue', d.value)}
                placeholder="0"
                contentBefore={symbol}
              />
            )}
          </FormField>
        </div>
      </Card>

      {/* ----------------------- Competitor products ---------------------- */}
      <CompetitorProducts
        competitors={competitors}
        symbol={symbol}
        years={years}
        businessCase={businessCase}
        onDiscount={setCompetitorDiscount}
        onAdd={addCompetitorRow}
        onRemove={removeCompetitorRow}
        onAsk={ask}
      />

      <StepFooter hint="Next: the report you present, built from exactly what is above." />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CompetitorProducts({
  competitors,
  symbol,
  years,
  businessCase,
  onDiscount,
  onAdd,
  onRemove,
  onAsk,
}) {
  const blank = {
    softwareSolution: '',
    currentProduct: '',
    competitorCost: '',
    newMicrosoftProduct: '',
    yearContractEnds: '',
  };
  const [draft, setDraft] = useState(blank);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const canAdd = draft.currentProduct.trim() && draft.competitorCost;
  const lineFor = (id) => businessCase.competitorLines.find((l) => l.id === id);

  return (
    <Card className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>Competitor Products</h2>
          <p className={styles.cardLead}>
            Search for a competitor product or enter one that is not in our database. New
            competitors are saved to this customer account only.
          </p>
        </div>
      </div>

      <div className={styles.discountRow}>
        <FormField
          label="What discount from competitor retail pricing (MSRP) does your customer receive?"
          help="0 – 100 %"
        >
          {(id) => (
            <Input
              id={id}
              value={competitors.msrpDiscount}
              onChange={(_, d) => onDiscount(d.value)}
              placeholder="0"
              contentAfter="%"
              className={styles.discountInput}
            />
          )}
        </FormField>
      </div>

      <p className={styles.subHead}>Add a competitor product</p>
      <p className={styles.cardLead}>
        Pick a Microsoft software solution and describe the competitor product being replaced.
      </p>

      <div className={styles.compForm}>
        <FormField label="Software Solution">
          {(id) => (
            <Dropdown
              id={id}
              placeholder="Select"
              value={draft.softwareSolution}
              selectedOptions={draft.softwareSolution ? [draft.softwareSolution] : []}
              onOptionSelect={(_, d) => setDraft({ ...draft, softwareSolution: d.optionValue })}
            >
              {SOFTWARE_SOLUTIONS.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Dropdown>
          )}
        </FormField>
        <FormField label="Current Product">
          {(id) => (
            <Input
              id={id}
              value={draft.currentProduct}
              onChange={(_, d) => setDraft({ ...draft, currentProduct: d.value })}
              placeholder="e.g. CrowdStrike"
            />
          )}
        </FormField>
        <FormField label="Competitor Cost" help="Annual, at MSRP">
          {(id) => (
            <Input
              id={id}
              value={draft.competitorCost}
              onChange={(_, d) => setDraft({ ...draft, competitorCost: d.value })}
              placeholder="0"
              contentBefore={symbol}
            />
          )}
        </FormField>
        <FormField label="New Microsoft Product">
          {(id) => (
            <Input
              id={id}
              value={draft.newMicrosoftProduct}
              onChange={(_, d) => setDraft({ ...draft, newMicrosoftProduct: d.value })}
              placeholder="e.g. Defender for Endpoint"
            />
          )}
        </FormField>
        <FormField label="Year Contract Ends" help="Savings start the year after">
          {(id) => (
            <Input
              id={id}
              value={draft.yearContractEnds}
              onChange={(_, d) => setDraft({ ...draft, yearContractEnds: d.value })}
              placeholder={String(CASE_START_YEAR)}
            />
          )}
        </FormField>
      </div>

      <div className={styles.rowActions}>
        <Button
          appearance="primary"
          icon={<Add16Filled />}
          disabled={!canAdd}
          onClick={() => {
            onAdd(draft);
            setDraft(blank);
          }}
        >
          Add
        </Button>
        <Button appearance="secondary" onClick={() => setMatrixOpen(true)}>
          View competitor matrix
        </Button>
        <Button
          appearance="transparent"
          icon={<Sparkle16Filled className={styles.aiIcon} />}
          onClick={() => onAsk('Detect the competitor products in this estate')}
        >
          Detect with AI
        </Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Software Solution</th>
              <th scope="col">Current Product</th>
              <th scope="col" className={styles.numeric}>
                Competitor Cost
              </th>
              <th scope="col">New Microsoft Product</th>
              <th scope="col">Year Contract Ends</th>
              <th scope="col">In horizon</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {competitors.rows.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.tableEmpty}>
                  No competitor products added yet.
                </td>
              </tr>
            ) : (
              competitors.rows.map((r) => {
                const line = lineFor(r.id);
                return (
                  <tr key={r.id}>
                    <td>{r.softwareSolution || '—'}</td>
                    <td>
                      <span className={styles.cellMain}>{r.currentProduct}</span>
                    </td>
                    <td className={styles.numeric}>
                      {formatCurrency(Number(r.competitorCost), { symbol })}
                    </td>
                    <td>{r.newMicrosoftProduct || '—'}</td>
                    <td>{r.yearContractEnds || '—'}</td>
                    <td>
                      {line?.displaceable ? (
                        <span className={styles.inHorizon}>
                          {line.yearsOfBenefit} of {years} yrs
                        </span>
                      ) : (
                        <span className={styles.outHorizon}>Outside horizon</span>
                      )}
                    </td>
                    <td>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete16Regular />}
                        aria-label={`Remove ${r.currentProduct}`}
                        onClick={() => onRemove(r.id)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {competitors.rows.some((r) => !lineFor(r.id)?.displaceable) ? (
        <p className={styles.horizonNote}>
          A contract ending after the analysis period contributes nothing to this case — the
          customer is still paying for it. Extend the analysis period or correct the end year.
        </p>
      ) : null}

      <Dialog open={matrixOpen} onOpenChange={(_, d) => setMatrixOpen(d.open)}>
        <DialogSurface className={styles.matrixSurface}>
          <DialogBody>
            <DialogTitle>Competitor matrix</DialogTitle>
            <DialogContent>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Software Solution</th>
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
