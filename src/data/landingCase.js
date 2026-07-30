/* ---------------------------------------------------------------------------
   The worked example behind the landing page.

   Every figure the landing page prints is COMPUTED HERE from the real engine
   against the real seeded Contoso case — none of it is typed in. That is the
   whole point of the page: it claims the tool shows its working, so a number on
   the marketing page that had drifted from the number the tool produces would
   be the one error that discredits everything around it.

   Change model.js or the Contoso case in caseLibrary.js and this page follows.

   Figures are USD. The page states that once rather than qualifying every value,
   and nothing on it displays a second dollar-based currency.
   --------------------------------------------------------------------------- */

import { buildBusinessCase, formatCurrency, formatPercent, CASE_START_YEAR } from './model.js';
import { MY_CASES } from './caseLibrary.js';
import { skuById } from './referenceData.js';

const CONTOSO = MY_CASES.find((c) => c.id === 'case-contoso');
const input = CONTOSO.input;

const compute = (rows) =>
  buildBusinessCase({
    analysisPeriod: input.caseSetup.analysisPeriod,
    numberOfUsers: input.customer.numberOfUsers,
    skus: input.skus,
    bundle: input.bundle,
    competitors: { ...input.competitors, rows },
  });

const base = compute(input.competitors.rows);

/* ------------------------------- formatting -------------------------------- */

export const money = (v) => formatCurrency(v, { compact: true });
export const exact = (v) => formatCurrency(v, { compact: false });
export const pct = (v) => formatPercent(v);

/* -------------------------------- headline --------------------------------- */

export const CASE = {
  customer: input.customer.accountName,
  users: Number(input.customer.numberOfUsers),
  industry: input.customer.industry,
  years: base.years,
  startYear: CASE_START_YEAR,
  roi: base.roi,
  annualNetBenefit: base.annualNetBenefit,
  netBenefit: base.netBenefit,
  paybackMonths: base.paybackMonths,
  investmentTotal: base.investmentTotal,
  benefitTotal: base.benefitTotal,
  competitorTotal: base.competitorTotal,
  additionalTotal: base.additionalTotal,
  vendorsConsolidated: base.vendorsConsolidated,
  vendorCount: input.competitors.rows.length,
  microsoftByYear: base.microsoftByYear,
  competitorByYear: base.competitorByYear,
  cashflow: base.cashflow,
  // Today is the third-party stack plus the Microsoft bundle they already own;
  // tomorrow keeps that bundle and adds the new SKUs. Both include the bundle,
  // which is what stops the comparison reading as a larger saving than it is.
  todayAnnualSpend: base.todayAnnualSpend,
  futureAnnualSpend: base.futureAnnualSpend,
};

/** The month the cumulative position first turns positive, and by how little. */
const breakeven = base.cashflow.find((m) => m.cumulative >= 0);
export const BREAKEVEN = breakeven
  ? { month: breakeven.month, cumulative: breakeven.cumulative }
  : null;

/* --------------------------------- ledger ---------------------------------- */

/**
 * One row per competitor product, carrying what it costs, when it can actually
 * be displaced, and therefore what it contributes. `yearsOfBenefit` is the
 * column that makes the case honest, so it is shown rather than folded away.
 */
export const LEDGER = base.competitorLines.map((line) => ({
  id: line.id,
  product: line.currentProduct,
  replacedBy: line.newMicrosoftProduct,
  category: line.softwareSolution,
  annualCost: line.annualCost,
  endYear: Number(line.yearContractEnds),
  firstYear: line.firstYear,
  yearsOfBenefit: line.yearsOfBenefit,
  total: line.benefitTotal,
}));

/** What Microsoft is being bought, and what it costs across the horizon. */
export const INVESTMENT = input.skus.map((row) => {
  const seats = Number(row.seats[0]) || 0;
  const perMonth = Number(row.pricePerMonth) || 0;
  return {
    id: row.id,
    name: skuById(row.skuId)?.name || row.skuId,
    seats,
    perMonth,
    annual: seats * perMonth * 12,
    total: seats * perMonth * 12 * base.years,
  };
});

/* -------------------------------- scenarios -------------------------------- */

/**
 * The three states of the contract-timing control that sits under the headline.
 *
 * The third one is the reason the control exists: pushed out two years, this
 * case goes negative and reports no payback at all. A worked example that can
 * only ever look good proves nothing about the tool that produced it.
 */
const shifted = (rows) => rows.map((r) => ({ ...r, yearContractEnds: '2028' }));

/**
 * Pull whichever contract runs longest back to the first year. Selected by date
 * rather than by product name so the scenario keeps working if the seeded case
 * changes, and so no competitor brand is referenced to build it.
 */
const renewEarly = (rows) => {
  const latest = Math.max(...rows.map((r) => Number(r.yearContractEnds) || 0));
  let done = false;
  return rows.map((r) => {
    if (done || Number(r.yearContractEnds) !== latest) return r;
    done = true;
    return { ...r, yearContractEnds: String(CASE_START_YEAR) };
  });
};

const scenario = (id, label, note, rows) => {
  const r = compute(rows);
  return {
    id,
    label,
    note,
    roi: r.roi,
    paybackMonths: r.paybackMonths,
    annualNetBenefit: r.annualNetBenefit,
    benefitTotal: r.benefitTotal,
    competitorByYear: r.competitorByYear,
    // Moves with the scenario. Pushed to 2028 nothing is displaceable inside the
    // horizon, so this drops to 0 — a tile still reading "4 of 4" beside a
    // negative return would be the page contradicting itself in one glance.
    vendorsConsolidated: r.vendorsConsolidated,
  };
};

export const SCENARIOS = [
  scenario(
    'actual',
    'As it stands',
    'Three contracts lapse during 2026; the fourth runs a year longer.',
    input.competitors.rows,
  ),
  scenario(
    'early',
    'The longest contract ends sooner',
    'Bring that renewal forward a year and another year of spend becomes displaceable.',
    renewEarly(input.competitors.rows),
  ),
  scenario(
    'late',
    'Every contract runs to 2028',
    'Nothing can be switched off inside the analysis period, so there is nothing to save.',
    shifted(input.competitors.rows),
  ),
];

/* --------------------------- what is not counted --------------------------- */

/**
 * The existing Microsoft bundle, deliberately excluded from benefit. Counting it
 * is the commonest way this category of spreadsheet inflates a case, so the page
 * demonstrates the error rather than describing it.
 *
 * Modelled as an extra already-lapsed competitor line, which is exactly the
 * mistake being illustrated: treating money the customer keeps paying as money
 * they stop paying.
 */
const bundleAnnual = Number(input.bundle.annualPerUser) * Number(input.customer.numberOfUsers);

export const EXCLUDED = {
  bundleName: 'Microsoft 365 E3',
  annual: bundleAnnual,
  overHorizon: bundleAnnual * base.years,
  honestRoi: base.roi,
  inflatedRoi: compute([
    ...input.competitors.rows,
    { id: 'bundle', competitorCost: String(bundleAnnual), yearContractEnds: String(CASE_START_YEAR - 1) },
  ]).roi,
};

/* ------------------------------ the three cuts ----------------------------- */

/** What the model refuses to count, stated plainly. Each is enforced in model.js. */
export const REFUSALS = [
  {
    title: 'Spend the customer keeps paying',
    text: `The ${EXCLUDED.bundleName} licences underneath this estate cost ${exact(EXCLUDED.annual)} a year. They are not a saving, because the customer keeps paying them.`,
  },
  {
    title: 'Savings before the contract ends',
    text: 'A vendor cannot be switched off mid-term. Benefit starts the year after the contract lapses, which is why year one here is nil.',
  },
  {
    title: 'Anything beyond the horizon',
    // Benefit starts the year AFTER a contract lapses, so the last end year that
    // can contribute is startYear + years - 2. One ending in the final analysis
    // year is already too late — an off-by-one here would be the single error
    // that discredits a page whose whole claim is that the arithmetic is shown.
    text: `A contract ending in ${CASE_START_YEAR + base.years - 1} or later contributes nothing to a ${base.years}-year case, however large it is — the saving would start after the horizon closes.`,
  },
];
