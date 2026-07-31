import React, { useState } from 'react';
import {
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
  Radio,
  RadioGroup,
  Textarea,
} from '@fluentui/react-components';
import {
  Add16Filled,
  Delete16Regular,
  Grid20Regular,
  Search20Regular,
  Sparkle16Filled,
} from '@fluentui/react-icons';
import {
  ANALYSIS_PERIODS,
  BCB_ROLES,
  COMPETITOR_CATALOGUE,
  CUSTOMER_SEGMENTS,
  EXISTING_MS_LICENSES,
  GEOGRAPHIES,
  INDUSTRIES,
  MS_BUNDLES,
  SALES_MOTIONS,
  SOFTWARE_SOLUTIONS,
  currencySymbol,
} from '../../data/referenceData.js';
import { CASE_START_YEAR, formatCurrency } from '../../data/model.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import MultiSelect from '../shared/MultiSelect.jsx';
import Disclosure from '../shared/Disclosure.jsx';
import CompetitorMatrixDialog from './CompetitorMatrixDialog.jsx';
import styles from './CustomerDetails.module.css';

/**
 * Step 1 — the customer's estate as it is today.
 *
 * Everything about the *current* state is captured here and only here: what the
 * customer already buys from Microsoft, and what they buy from everyone else.
 * Step 2 proposes the future against it, so nothing on this step asks what the
 * customer should move to — the "new Microsoft product" mapping lives there.
 */
export default function CustomerDetails() {
  const {
    customer,
    fieldMeta,
    environment,
    caseSetup,
    bundle,
    competitors,
    businessCase,
    currency,
    effectiveDevices,
    setCustomer,
    setEnvironment,
    setCaseSetup,
    setBundle,
    setCompetitorDiscount,
    addCompetitorRow,
    updateCompetitorRow,
    removeCompetitorRow,
    ask,
  } = useAppState();

  const symbol = currencySymbol(currency);
  const years = Number(caseSetup.analysisPeriod) || 3;

  return (
    <div className={styles.root}>
      <StepMasthead
        description="What the customer runs today — their Microsoft footprint and the competitor products in the estate. Every number in the report is measured against it."
      />

      {/* ------------------------ Customer Information ------------------------ */}
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Customer information</h2>

        <div className={styles.grid}>
          <FormField label="Account name" required meta={fieldMeta.accountName}>
            {(id) => (
              <>
                <Input
                  id={id}
                  value={customer.accountName}
                  onChange={(_, d) => setCustomer('accountName', d.value)}
                  placeholder="Search by account name"
                  contentAfter={<Search20Regular />}
                  disabled={customer.notForCustomer}
                />
                <button type="button" className={styles.addLink}>
                  + Add new account
                </button>
              </>
            )}
          </FormField>

        </div>

        <Checkbox
          className={styles.notCustomer}
          checked={customer.notForCustomer}
          onChange={(_, d) => setCustomer('notForCustomer', d.checked)}
          label="This calculation is not for a customer"
        />

        <div className={styles.grid}>
          <FormField label="Industry" meta={fieldMeta.industry}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select industry"
                value={customer.industry}
                selectedOptions={customer.industry ? [customer.industry] : []}
                onOptionSelect={(_, d) => setCustomer('industry', d.optionValue)}
              >
                {INDUSTRIES.map((i) => (
                  <Option key={i} value={i}>
                    {i}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField label="Geography (region)" required meta={fieldMeta.geography}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select region"
                value={GEOGRAPHIES.find((g) => g.id === customer.geography)?.label || ''}
                selectedOptions={customer.geography ? [customer.geography] : []}
                onOptionSelect={(_, d) => setCustomer('geography', d.optionValue)}
              >
                {GEOGRAPHIES.map((g) => (
                  <Option key={g.id} value={g.id} text={g.label}>
                    {g.label}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField label="Currency">
            {(id) => <Input id={id} value={customer.geography ? currency : '—'} disabled />}
          </FormField>

          <FormField label="Customer segment" meta={fieldMeta.segment}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select segment"
                value={customer.segment}
                selectedOptions={customer.segment ? [customer.segment] : []}
                onOptionSelect={(_, d) => setCustomer('segment', d.optionValue)}
              >
                {CUSTOMER_SEGMENTS.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField label="Primary sales motion" meta={fieldMeta.salesMotion}>
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select sales motion"
                value={customer.salesMotion}
                selectedOptions={customer.salesMotion ? [customer.salesMotion] : []}
                onOptionSelect={(_, d) => setCustomer('salesMotion', d.optionValue)}
              >
                {SALES_MOTIONS.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>

          <FormField
            label="Number of users"
            required
            help="Sets baseline Microsoft spend and seeds the per-year seat defaults"
            meta={fieldMeta.numberOfUsers}
          >
            {(id) => (
              <Input
                id={id}
                value={customer.numberOfUsers}
                onChange={(_, d) => setCustomer('numberOfUsers', d.value)}
                placeholder="e.g. 5000"
              />
            )}
          </FormField>

        </div>

        <div className={styles.roleBlock}>
          <span className={styles.roleLabel}>
            Role of Security BCB
          </span>
          <RadioGroup
            layout="horizontal"
            value={customer.bcbRole}
            onChange={(_, d) => setCustomer('bcbRole', d.value)}
          >
            {BCB_ROLES.map((r) => (
              <Radio key={r.id} value={r.id} label={r.label} />
            ))}
          </RadioGroup>
          {customer.bcbRole ? (
            <p className={styles.roleDetail}>
              {BCB_ROLES.find((r) => r.id === customer.bcbRole)?.detail}
            </p>
          ) : null}
        </div>

        <FormField label="Description" meta={fieldMeta.description}>
          {(id) => (
            <Textarea
              id={id}
              className={styles.textarea}
              value={customer.description}
              onChange={(_, d) => setCustomer('description', d.value)}
              placeholder="Optional notes about this customer or engagement"
              resize="vertical"
            />
          )}
        </FormField>

        {/* Opportunity identifiers, the close date, the seller alias and the two
            unused counts. None reaches the model, the report or a recommendation
            — they are CRM plumbing, and several are things a seller cannot answer
            without opening MSX. The fields that shape the report's STORY rather
            than its arithmetic — industry, segment, sales motion, BCB role and
            the description — stay above, because burying them is what would keep
            them permanently unwired. */}
        <Disclosure label="Additional details" count={7}>
          <div className={styles.grid}>
          <FormField label="Opportunity ID" meta={fieldMeta.opportunityId}>
            {(id) => (
              <>
                <Input
                  id={id}
                  value={customer.opportunityId}
                  onChange={(_, d) => setCustomer('opportunityId', d.value)}
                  placeholder="e.g. 7-3F56BL3EVL"
                  contentAfter={<Search20Regular />}
                  disabled={customer.notForCustomer}
                />
                <button type="button" className={styles.addLink}>
                  + Add new opportunity ID
                </button>
              </>
            )}
          </FormField>

          <FormField label="Opportunity name" meta={fieldMeta.opportunityName}>
            {(id) => (
              <>
                <Input
                  id={id}
                  value={customer.opportunityName}
                  onChange={(_, d) => setCustomer('opportunityName', d.value)}
                  placeholder="Search opportunity name"
                  contentAfter={<Search20Regular />}
                  disabled={customer.notForCustomer}
                />
                <button type="button" className={styles.addLink}>
                  + Add new opportunity name
                </button>
              </>
            )}
          </FormField>
          <FormField label="TPID" meta={fieldMeta.tpid}>
            {(id) => (
              <Input
                id={id}
                value={customer.tpid}
                onChange={(_, d) => setCustomer('tpid', d.value)}
                placeholder="e.g. 1234567"
                disabled={customer.notForCustomer}
              />
            )}
          </FormField>

          <FormField label="Opportunity close date">
            {(id) => (
              <Input
                id={id}
                type="date"
                value={customer.closeDate}
                onChange={(_, d) => setCustomer('closeDate', d.value)}
                disabled={customer.notForCustomer}
              />
            )}
          </FormField>

          {/* Seller alias sits with the other engagement facts. It used to close the
              old "Customer environment" card, which no longer exists — and it is
              about the seller, not about anything the customer runs. */}
          <FormField label="Seller alias">
            {(id) => <Input id={id} value={environment.sellerAlias} disabled />}
          </FormField>

          <FormField label="Customer website" span={false}>
            {(id) => (
              <Input
                id={id}
                value={customer.website}
                onChange={(_, d) => setCustomer('website', d.value)}
                placeholder="e.g. contoso.com"
              />
            )}
          </FormField>

          <FormField
            label="Number of devices"
            help={
              effectiveDevices > 0 && !customer.numberOfDevices
                ? `Defaults to 1.2 × users — ${effectiveDevices.toLocaleString('en-US')} devices`
                : 'Endpoint count for Defender-related calculations'
            }
          >
            {(id) => (
              <Input
                id={id}
                value={customer.numberOfDevices}
                onChange={(_, d) => setCustomer('numberOfDevices', d.value)}
              />
            )}
          </FormField>
          </div>
        </Disclosure>
      </Card>

      {/* ------------------------ Microsoft environment ----------------------- */}
      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Microsoft environment</h2>
          <p className={styles.cardLead}>
            What the customer already owns and already pays Microsoft. This offsets the uplift in
            step 2 rather than counting as new spend.
          </p>
        </div>

        <div className={styles.grid}>
          <FormField
            label="Existing MS licenses"
                        help="Drives SKU recommendations and upsell logic"
          >
            {(id) => (
              <MultiSelect
                id={id}
                options={EXISTING_MS_LICENSES}
                selected={environment.existingLicenses}
                onChange={(v) => setEnvironment('existingLicenses', v)}
                placeholder="Search license"
              />
            )}
          </FormField>

          <FormField label="Current Microsoft bundle">
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

      {/* ----------------------- Competitive environment ---------------------- */}
      <CompetitiveEnvironment
        environment={environment}
        competitors={competitors}
        symbol={symbol}
        years={years}
        businessCase={businessCase}
        onEnvironment={setEnvironment}
        onDiscount={setCompetitorDiscount}
        onAdd={addCompetitorRow}
        onUpdate={updateCompetitorRow}
        onRemove={removeCompetitorRow}
        onAsk={ask}
      />

      {/* ------------------------- Business Case Setup ------------------------ */}
      <Card className={styles.card}>
        <h2 className={styles.cardTitle}>Business case setup</h2>
        <div className={styles.grid}>
          <FormField
            label="Business case name"
            required
            help="Up to 100 characters."
          >
            {(id) => (
              <Input
                id={id}
                value={caseSetup.name}
                maxLength={100}
                onChange={(_, d) => setCaseSetup('name', d.value)}
                placeholder="Enter business case name"
              />
            )}
          </FormField>

          <FormField
            label="Analysis period (years)"
            required
            help="Determines the horizon for cost, benefit, ROI and reporting — and how many years of seats you enter per SKU"
          >
            {(id) => (
              <Dropdown
                id={id}
                placeholder="Select number of years"
                value={caseSetup.analysisPeriod ? `${caseSetup.analysisPeriod} years` : ''}
                selectedOptions={[String(caseSetup.analysisPeriod)]}
                onOptionSelect={(_, d) => setCaseSetup('analysisPeriod', Number(d.optionValue))}
              >
                {ANALYSIS_PERIODS.map((y) => (
                  <Option key={y} value={String(y)} text={`${y} years`}>
                    {y} {y === 1 ? 'year' : 'years'}
                  </Option>
                ))}
              </Dropdown>
            )}
          </FormField>
        </div>
      </Card>

      <StepFooter hint="Fill in what you know — you can move between steps freely and come back." />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The third-party half of the estate: which categories the customer buys
 * outside Microsoft, what they pay, and when each contract lapses.
 *
 * Capture only. Which Microsoft product replaces each of these is a decision,
 * not an observation, so it is made on step 2 — this table has no "new
 * Microsoft product" column.
 */
/**
 * Typeahead over the competitor catalogue.
 *
 * Deliberately not a Fluent Combobox: a combobox implies the value ends up in
 * the field, and here picking a product ADDS A ROW and clears the box. Modelling
 * that as a list of buttons under an input says what actually happens.
 */
function CompetitorSearch({ onPick, symbol }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = q
    ? COMPETITOR_CATALOGUE.filter(
        (c) => c.product.toLowerCase().includes(q) || c.solution.toLowerCase().includes(q),
      ).slice(0, 6)
    : [];

  return (
    <div className={styles.searchWrap}>
      <Input
        className={styles.searchInput}
        value={query}
        onChange={(_, d) => setQuery(d.value)}
        placeholder="Search for a competitor product"
        contentBefore={<Search20Regular />}
        aria-label="Search for a competitor product"
      />
      {q ? (
        <ul className={styles.results} role="listbox" aria-label="Matching products">
          {matches.length === 0 ? (
            <li className={styles.noResult}>
              Nothing matches. Use <strong>Add a product that is not listed</strong> below.
            </li>
          ) : (
            matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={styles.result}
                  onClick={() => {
                    onPick(c);
                    setQuery('');
                  }}
                >
                  <span className={styles.resultProduct}>{c.product}</span>
                  <span className={styles.resultMeta}>
                    {c.solution} · {formatCurrency(c.annualCost, { symbol, compact: true })}/yr
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function CompetitiveEnvironment({
  environment,
  competitors,
  symbol,
  years,
  businessCase,
  onEnvironment,
  onDiscount,
  onAdd,
  onUpdate,
  onRemove,
  onAsk,
}) {
  const blank = {
    softwareSolution: '',
    currentProduct: '',
    competitorCost: '',
    yearContractEnds: '',
  };
  const [draft, setDraft] = useState(blank);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const canAdd = draft.currentProduct.trim() && draft.competitorCost;

  /**
   * Seed a row from the catalogue. The end year defaults to the case start year
   * rather than being left blank — the model already treats blank as "ends this
   * year", so an empty field hides an assumption that is doing real work. On
   * screen the seller can see it and change it.
   */
  const addFromCatalogue = (c) =>
    onAdd({
      // Records that identity came from the catalogue, which is what makes the
      // name and category read-only below. Rows the seller or the copilot
      // created carry no catalogueId and stay fully editable.
      catalogueId: c.id,
      softwareSolution: c.solution,
      currentProduct: c.product,
      competitorCost: String(c.annualCost),
      // Deliberately NOT seeding newMicrosoftProduct, even though the catalogue
      // knows a sensible answer. Step 2 counts mapped rows and exists to make
      // that call; arriving pre-mapped would mean the seller never meets the
      // decision, and a displacement nobody chose is a price comparison.
      yearContractEnds: String(CASE_START_YEAR),
    });
  const lineFor = (id) => businessCase.competitorLines.find((l) => l.id === id);

  return (
    <Card className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Competitive environment</h2>
        <p className={styles.cardLead}>
          What the customer buys outside Microsoft today. Search for a competitor product or enter
          one that is not in our database — new competitors are saved to this customer account
          only.
        </p>
      </div>

      <div className={styles.grid}>

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

      {/* Three ways in, because sellers arrive knowing different amounts. Someone
          who knows the product name types it; someone scoping an unfamiliar
          estate browses the matrix; someone displacing something niche enters it
          by hand. The first two prefill an indicative cost so the row starts from
          a number, and all three land in the same table. */}
      <div className={styles.compFind}>
        <CompetitorSearch onPick={addFromCatalogue} symbol={symbol} />
        <Button appearance="secondary" icon={<Grid20Regular />} onClick={() => setMatrixOpen(true)}>
          Browse all {COMPETITOR_CATALOGUE.length}
        </Button>
        <Button
          appearance="transparent"
          icon={<Sparkle16Filled className={styles.aiIcon} />}
          onClick={() => onAsk('Detect the competitor products in this estate')}
        >
          Detect with AI
        </Button>
      </div>

      <Disclosure label="Add a product that is not listed" count={4}>
      <div className={styles.compForm}>
        <FormField label="Software solution">
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
        <FormField label="Current product">
          {(id) => (
            <Input
              id={id}
              value={draft.currentProduct}
              onChange={(_, d) => setDraft({ ...draft, currentProduct: d.value })}
              placeholder="e.g. CrowdStrike"
            />
          )}
        </FormField>
        <FormField label="Competitor cost" help="Annual, at MSRP">
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
        <FormField label="Year contract ends" help="Savings start the year after">
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
      </div>
      </Disclosure>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Software solution</th>
              <th scope="col">Current product</th>
              {/* At MSRP, before the discount above. Step 2 reports the same rows
                  net of that discount, which is the figure the model uses. */}
              <th scope="col" className={styles.numeric}>
                Competitor cost (MSRP)
              </th>
              <th scope="col">Year contract ends</th>
              <th scope="col">In horizon</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {competitors.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.tableEmpty}>
                  No competitor products added yet.
                </td>
              </tr>
            ) : (
              competitors.rows.map((r) => {
                const line = lineFor(r.id);
                return (
                  <tr key={r.id}>
                    {/* Identity — what is being displaced — versus the two
                        contract facts beside it. A catalogue row already answered
                        identity when the seller picked it from the list, so it
                        reads as text; editing it in place could only turn a
                        correct row into a wrong one. Rows the seller typed, or
                        the copilot inferred, stay editable because in those the
                        seller IS the source. */}
                    {r.catalogueId ? (
                      <>
                        <td className={styles.cellFixed}>{r.softwareSolution || '—'}</td>
                        <td className={styles.cellFixed}>
                          <span className={styles.cellMain}>{r.currentProduct}</span>
                          <span className={styles.cellSub}>From the catalogue</span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <Dropdown
                            size="small"
                            className={styles.cellSolution}
                            placeholder="—"
                            aria-label={`Software solution for ${r.currentProduct}`}
                            value={r.softwareSolution}
                            selectedOptions={r.softwareSolution ? [r.softwareSolution] : []}
                            onOptionSelect={(_, d) =>
                              onUpdate(r.id, { softwareSolution: d.optionValue })
                            }
                          >
                            {SOFTWARE_SOLUTIONS.map((sol) => (
                              <Option key={sol} value={sol}>
                                {sol}
                              </Option>
                            ))}
                          </Dropdown>
                        </td>
                        <td>
                          <Input
                            size="small"
                            className={styles.cellProduct}
                            aria-label="Competitor product name"
                            value={r.currentProduct}
                            onChange={(_, d) => onUpdate(r.id, { currentProduct: d.value })}
                          />
                        </td>
                      </>
                    )}
                    <td className={styles.numeric}>
                      <Input
                        size="small"
                        className={styles.cellCost}
                        aria-label={`Annual cost at MSRP for ${r.currentProduct}`}
                        value={r.competitorCost}
                        contentBefore={symbol}
                        onChange={(_, d) => onUpdate(r.id, { competitorCost: d.value })}
                      />
                    </td>
                    <td>
                      <Input
                        size="small"
                        className={styles.cellYear}
                        aria-label={`Year the ${r.currentProduct} contract ends`}
                        value={r.yearContractEnds}
                        placeholder={String(CASE_START_YEAR)}
                        onChange={(_, d) => onUpdate(r.id, { yearContractEnds: d.value })}
                      />
                    </td>
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

      {competitors.rows.length > 0 ? (
        <p className={styles.tableNote}>
          Catalogue costs are indicative — replace them with what the customer actually pays, and
          set each contract end year. To change a catalogue product itself, remove the row and add
          the right one. You will map these to Microsoft products in step 2.
        </p>
      ) : null}

      {competitors.rows.some((r) => !lineFor(r.id)?.displaceable) ? (
        <p className={styles.horizonNote}>
          A contract ending after the analysis period contributes nothing to this case — the
          customer is still paying for it. Extend the analysis period or correct the end year.
        </p>
      ) : null}

      <CompetitorMatrixDialog
        open={matrixOpen}
        onOpenChange={setMatrixOpen}
        onAdd={addFromCatalogue}
        symbol={symbol}
      />
    </Card>
  );
}
