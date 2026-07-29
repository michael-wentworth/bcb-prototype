/* ---------------------------------------------------------------------------
   The business case calculation.

   Everything is derived from what the seller entered on the two input screens —
   SKU rows, the current bundle, and the competitor table. Nothing is seeded, so
   an empty form produces an empty case rather than a flattering default.

   The one piece of real modelling here is contract timing: a competitor product
   cannot be displaced until its contract ends, so its benefit starts in the
   analysis year after "Year Contract Ends". That is what stops a case claiming
   savings the customer is still contractually paying for.
   --------------------------------------------------------------------------- */

/** The year a case is assumed to start. Contract end years are relative to it. */
export const CASE_START_YEAR = 2026;

const num = (v) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/**
 * @param {object} input
 * @param {number} input.analysisPeriod  years in the horizon
 * @param {number} input.numberOfUsers
 * @param {Array}  input.skus            [{ skuId, seats: number[], pricePerMonth }]
 * @param {object} input.bundle          { bundleId, annualPerUser, additionalValue }
 * @param {object} input.competitors     { msrpDiscount, rows: [...] }
 */
export function buildBusinessCase({
  analysisPeriod = 3,
  numberOfUsers = 0,
  skus = [],
  bundle = {},
  competitors = {},
} = {}) {
  const years = Math.max(1, Math.min(5, Number(analysisPeriod) || 3));
  const users = num(numberOfUsers);
  const horizonMonths = years * 12;

  /* ------------------------- Microsoft investment ------------------------- */

  // Per-year cost of every SKU row: seats for that year x monthly price x 12.
  const microsoftByYear = Array.from({ length: years }, (_, y) =>
    skus.reduce((sum, row) => {
      const seats = num(row.seats?.[y]);
      return sum + seats * num(row.pricePerMonth) * 12;
    }, 0),
  );
  const investmentTotal = microsoftByYear.reduce((a, b) => a + b, 0);

  /* ------------------------------- Benefits ------------------------------- */

  // What the customer already pays Microsoft.
  //
  // Deliberately NOT a benefit. If they are buying an add-on they keep paying
  // for the bundle, so counting it as a saving would inflate every case. It is
  // baseline context — it shows up in the spend comparison, not in the ROI.
  const bundleAnnual = num(bundle.annualPerUser) * users;

  // Extra Microsoft products or negotiated savings, entered as an annual value.
  const additionalAnnual = num(bundle.additionalValue);
  const additionalTotal = additionalAnnual * years;

  const discount = Math.min(100, Math.max(0, num(competitors.msrpDiscount))) / 100;

  /**
   * Each competitor row becomes an annual saving once its contract lapses.
   * `firstYear` is 1-based within the analysis horizon.
   */
  const competitorLines = (competitors.rows || []).map((row) => {
    const annualCost = num(row.competitorCost) * (1 - discount);
    const endYear = num(row.yearContractEnds) || CASE_START_YEAR;
    const offset = endYear - CASE_START_YEAR;
    const firstYear = Math.max(1, offset + 2); // pay until the contract ends
    const yearsOfBenefit = Math.max(0, years - firstYear + 1);
    return {
      ...row,
      annualCost,
      firstYear,
      yearsOfBenefit,
      benefitTotal: annualCost * yearsOfBenefit,
      displaceable: yearsOfBenefit > 0,
    };
  });

  const competitorByYear = Array.from({ length: years }, (_, y) =>
    competitorLines.reduce(
      (sum, line) => sum + (y + 1 >= line.firstYear ? line.annualCost : 0),
      0,
    ),
  );

  const competitorTotal = competitorByYear.reduce((a, b) => a + b, 0);
  const annualThirdPartySpend = competitorLines.reduce((s, l) => s + l.annualCost, 0);

  const benefitTotal = competitorTotal + additionalTotal;
  const netBenefit = benefitTotal - investmentTotal;
  const roi = investmentTotal > 0 ? netBenefit / investmentTotal : null;

  /* ------------------------------ Cash flow ------------------------------- */

  // Monthly, so payback can be reported in months the way sellers quote it.
  let cumulative = 0;
  const cashflow = Array.from({ length: horizonMonths }, (_, i) => {
    const month = i + 1;
    const yearIndex = Math.floor(i / 12);
    const cost = microsoftByYear[yearIndex] / 12;
    const benefit = competitorByYear[yearIndex] / 12 + additionalAnnual / 12;
    const net = benefit - cost;
    cumulative += net;
    return {
      month,
      benefit: Math.round(benefit),
      cost: Math.round(cost),
      net: Math.round(net),
      cumulative: Math.round(cumulative),
    };
  });

  // With no investment there is nothing to pay back — a cumulative of zero is
  // not a breakeven, it is an empty form.
  const breakeven = investmentTotal > 0 ? cashflow.find((m) => m.cumulative >= 0) : null;

  return {
    years,
    horizonMonths,
    hasInputs: skus.length > 0 || (competitors.rows || []).length > 0,

    microsoftByYear,
    competitorByYear,
    competitorLines,

    investmentTotal: Math.round(investmentTotal),
    benefitTotal: Math.round(benefitTotal),
    competitorTotal: Math.round(competitorTotal),
    additionalTotal: Math.round(additionalTotal),
    netBenefit: Math.round(netBenefit),
    annualNetBenefit: Math.round(netBenefit / years),
    roi,
    paybackMonths: breakeven ? breakeven.month : null,

    // Spend comparison: today is the competitor stack plus what they already
    // pay Microsoft; tomorrow keeps that bundle and adds the new SKUs.
    currentMicrosoftAnnual: Math.round(bundleAnnual),
    todayAnnualSpend: Math.round(annualThirdPartySpend + bundleAnnual),
    futureAnnualSpend: Math.round(bundleAnnual + investmentTotal / years),
    annualMicrosoftSpend: Math.round(investmentTotal / years),
    annualThirdPartySpend: Math.round(annualThirdPartySpend),
    vendorsConsolidated: competitorLines.filter((l) => l.displaceable).length,

    cashflow,
  };
}

/* ------------------------------- Formatters -------------------------------- */

export function formatCurrency(value, { compact = true, symbol = 'US$' } = {}) {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (!compact || abs < 1000) {
    return `${sign}${symbol}${Math.round(abs).toLocaleString('en-US')}`;
  }
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}${symbol}${trimZeros(m.toFixed(abs >= 10_000_000 ? 1 : 2))}M`;
  }
  return `${sign}${symbol}${Math.round(abs / 1000)}K`;
}

function trimZeros(s) {
  // Only trim inside the decimal part — "970" must not become "97".
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

export function formatPercent(ratio) {
  if (ratio == null || Number.isNaN(ratio)) return '—';
  return `${Math.round(ratio * 100)}%`;
}
