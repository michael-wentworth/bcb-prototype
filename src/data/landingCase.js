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
/**
 * What the same case reports when no contract lapses inside the horizon.
 *
 * This used to drive an interactive control on the page. It is now a stated
 * fact, because a landing page asking a stranger to operate a widget before
 * they know what the product is reads as odd — but the point it made is worth
 * keeping. A tool that can only ever produce a flattering answer proves nothing
 * about the answer it produced, and this one will report a case that fails.
 *
 * The last analysis year is used as the end date: benefit starts the year AFTER
 * a contract lapses, so one ending then is already outside the horizon.
 */
const stressYear = String(CASE_START_YEAR + base.years - 1);
const stressed = compute(
  input.competitors.rows.map((r) => ({ ...r, yearContractEnds: stressYear })),
);

export const STRESS = {
  year: stressYear,
  roi: stressed.roi,
  paybackMonths: stressed.paybackMonths,
  annualNetBenefit: stressed.annualNetBenefit,
  vendorsConsolidated: stressed.vendorsConsolidated,
};

/* ------------------------------ steady state ------------------------------- */

/**
 * What the case runs at once every contract has lapsed.
 *
 * The headline ROI is a blended figure over the whole horizon, and the first
 * year drags it down hard because nothing can be switched off yet. The final
 * year is the rate the customer actually lives with afterwards, and it is the
 * more useful number for anyone deciding whether to start — so the page states
 * both rather than only the one that flatters least.
 */
const lastYear = base.years - 1;

/* Counts the same benefit the headline ROI counts. It used to total displaced
   contracts alone while CASE.roi included the additional-value line, so the page
   printed two percentages side by side that were measuring different things —
   and the smaller one looked like the conservative version of the larger rather
   than a different sum. */
const steadySaves = base.competitorByYear[lastYear] + Math.round(base.additionalTotal / base.years);
const steadyCosts = base.microsoftByYear[lastYear];
export const STEADY = {
  saves: steadySaves,
  costs: steadyCosts,
  net: steadySaves - steadyCosts,
  ratio: steadyCosts > 0 ? (steadySaves - steadyCosts) / steadyCosts : null,
};

/** The Microsoft side as one destination: what is bought, and what it costs a year. */
export const CONSOLIDATION = {
  products: INVESTMENT.map((s) => s.name),
  annualCost: Math.round(base.investmentTotal / base.years),
  vendorCount: LEDGER.length,
};

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
    text: `The ${EXCLUDED.bundleName} licenses underneath this estate cost ${exact(EXCLUDED.annual)} a year. They are not a saving, because the customer keeps paying them.`,
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
