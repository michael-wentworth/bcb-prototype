/* ---------------------------------------------------------------------------
   The capability delta, and the money that follows from it.

   Two things happen here and nowhere else.

   First the delta: current capabilities against future capabilities, split into
   the four categories the business case argues from. The split is not cosmetic —
   each bucket carries a different claim, and mixing them is how a case ends up
   asserting a saving against something the customer was never paying for.

   Second the arithmetic. The investment is the *incremental* license cost, not
   the full future bill: the customer is already paying for their current estate
   and will keep paying for the part that carries over. Counting the whole future
   license as new spend understates the case; counting none of it overstates it.
   --------------------------------------------------------------------------- */

import { CAPABILITIES, STRATEGIC, annualOf, capabilityById, entitlementById } from './capabilities.js';

/** Every capability the catalogue says a vendor sells. */
export const capabilitiesSoldBy = (vendor) =>
  CAPABILITIES.filter((c) => c.competitors.includes(vendor)).map((c) => c.id);

export const CASE_START_YEAR = 2026;

const num = (v) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Every capability a selection grants, deduped.
 *
 * The selection is a mix of base bundles, add-on suites and individual products
 * — entitlementById resolves all three, so a case assembled from single SKUs
 * produces exactly the same delta as one assembled from a bundle that happens to
 * contain them.
 */
export function grantsOf(entitlementIds = []) {
  const out = new Set();
  entitlementIds.filter(Boolean).forEach((id) => {
    const e = entitlementById(id);
    if (e) e.grants.forEach((c) => out.add(c));
  });
  return out;
}

/** Annual per-user list cost of a selection. */
export function annualPerUserOf(entitlementIds = []) {
  return entitlementIds
    .filter(Boolean)
    .reduce((sum, id) => sum + annualOf(entitlementById(id)), 0);
}

/**
 * A capability has a market equivalent when someone else sells it. That is what
 * separates a consolidation play from a net-new one, and it is a property of the
 * catalogue rather than of the customer.
 */
export const hasMarketEquivalent = (id) => {
  if (STRATEGIC.has(id)) return false;
  const c = capabilityById(id);
  return !!c && c.competitors.length > 0;
};

/**
 * The delta.
 *
 * `competitorRows` is optional and only sharpens the answer: before step 4 has
 * run, everything with a market equivalent is a *potential* consolidation. Once
 * the seller names a product against a capability, that capability moves from
 * "new Microsoft capability" to confirmed displacement — which is the difference
 * between "you would gain DLP" and "you would stop paying Forcepoint for DLP".
 */
export function capabilityDelta(currentLicenses = [], futureLicenses = [], contracts = []) {
  const current = grantsOf(currentLicenses);
  const future = grantsOf(futureLicenses);

  const named = new Set(
    contracts.filter((c) => c.vendor).flatMap((c) => c.capabilityIds || []),
  );

  const retained = [];
  const strategic = [];
  const consolidation = [];
  const newMicrosoft = [];
  const potentialConsolidation = [];

  CAPABILITIES.forEach(({ id }) => {
    const inFuture = future.has(id);
    if (!inFuture) return;
    if (current.has(id)) {
      retained.push(id);
      return;
    }
    // gained
    if (!hasMarketEquivalent(id)) {
      strategic.push(id);
      return;
    }
    potentialConsolidation.push(id);
    if (named.has(id)) consolidation.push(id);
    else newMicrosoft.push(id);
  });

  /* Capabilities the customer owns today and would lose. Downgrades are rare but
     a model that cannot express one will quietly report a gain for a move that
     is actually a trade. */
  const lost = [...current].filter((id) => !future.has(id));

  return {
    current: [...current],
    future: [...future],
    retained,
    newMicrosoft,
    consolidation,
    potentialConsolidation,
    strategic,
    lost,
    gained: [...newMicrosoft, ...consolidation, ...strategic],
  };
}

/** The capabilities step 4 should ask about — and only those. */
export function capabilitiesToMap(delta) {
  return delta.potentialConsolidation.map(capabilityById).filter(Boolean);
}

/**
 * Group the mappable capabilities the way step 4 presents them: by capability,
 * with the market alternatives underneath. This is the inversion the redesign is
 * built on — the old flow asked "which vendors do you have", this one asks "who
 * do you use for identity governance", which a seller can answer.
 */
export function competitorChoices(delta) {
  const byGroup = new Map();
  capabilitiesToMap(delta).forEach((c) => {
    const key = `${c.area}:${c.group}`;
    if (!byGroup.has(key)) byGroup.set(key, { area: c.area, group: c.group, capabilities: [] });
    byGroup.get(key).capabilities.push(c);
  });
  return [...byGroup.values()];
}

/* ------------------------------- the money -------------------------------- */

/**
 * Business value from a completed delta.
 *
 * Timing discipline carries over from the licensing model: a competitor contract
 * cannot be switched off mid-term, so its saving starts the year *after* it
 * lapses. It is the single most common way one of these cases overstates itself.
 */
/**
 * What one contract is worth, and whether it can be counted at all.
 *
 * A contract is per vendor, not per capability - the customer gets one Okta
 * invoice, not six. Keying the row on capability let the same contract be
 * entered against every capability it covers, and the model summed all of them:
 * one CrowdStrike line at $1.35M produced $8.1M of savings across the three
 * capabilities it genuinely serves.
 *
 * The partial-cover rule is the other half. If the catalogue says a vendor also
 * sells something the future state does not deliver, the customer probably
 * cannot cancel the contract, so nothing is counted until the seller confirms
 * this customer does not use it for that.
 */
export function evaluateContract(contract, futureCaps, displaceable, years) {
  const sold = capabilitiesSoldBy(contract.vendor);
  const linked = (contract.capabilityIds || []).filter((id) => displaceable.has(id));
  const uncovered = sold.filter((id) => !futureCaps.has(id));
  const blocked = uncovered.length > 0 && !contract.soleUseConfirmed;

  const annualCost = num(contract.annualCost);
  const endYear = num(contract.yearContractEnds) || CASE_START_YEAR;
  const firstYear = Math.max(1, endYear - CASE_START_YEAR + 2);
  const yearsSaved = Math.max(0, years - firstYear + 1);

  const counts = linked.length > 0 && !blocked && yearsSaved > 0;
  return {
    ...contract,
    sold,
    linked,
    uncovered,
    blocked,
    annualCost,
    endYear,
    firstYear,
    yearsSaved: counts ? yearsSaved : 0,
    saved: counts ? annualCost * yearsSaved : 0,
    displaceable: counts,
    reason:
      linked.length === 0
        ? 'None of the capabilities this covers are added by the future state, so the spend continues.'
        : blocked
          ? `Also covers ${uncovered.map((id) => capabilityById(id)?.name).filter(Boolean).join(', ')}, which the future state does not deliver - confirm they do not use it for that.`
          : yearsSaved === 0
            ? 'The contract ends after the analysis period, so no saving lands inside it.'
            : null,
  };
}

export function buildCapabilityCase({
  analysisPeriod = 3,
  numberOfUsers = 0,
  currentLicenses = [],
  futureLicenses = [],
  contracts = [],
  /* Per user per month, and the seller's number rather than the catalogue's.
     List prices are the wrong basis for an enterprise case — an estate of this
     size does not pay rate card, and quoting one would overstate the investment
     badly enough to sink a case that is actually sound. Blank falls back to the
     list delta so the model always has something to work with. */
  negotiatedUplift = '',
} = {}) {
  const years = Math.max(1, Math.min(5, Number(analysisPeriod) || 3));
  const users = num(numberOfUsers);
  const delta = capabilityDelta(currentLicenses, futureLicenses, contracts);

  const currentPerUser = annualPerUserOf(currentLicenses);
  const futurePerUser = annualPerUserOf(futureLicenses);
  const listUplift = Math.max(0, futurePerUser - currentPerUser);
  const negotiated = String(negotiatedUplift ?? '').trim();
  const usingList = negotiated === '';
  const incrementalPerUser = usingList ? listUplift : num(negotiated) * 12;

  const currentAnnual = currentPerUser * users;
  const futureAnnual = futurePerUser * users;
  const incrementalAnnual = incrementalPerUser * users;

  const microsoftByYear = Array.from({ length: years }, () => incrementalAnnual);
  const investmentTotal = incrementalAnnual * years;

  /* One line per contract. A vendor cannot appear twice, so the same spend
     cannot be counted twice however it was entered. */
  const futureCaps = grantsOf(futureLicenses);
  const displaceable = new Set(delta.consolidation);
  const competitorLines = contracts
    .filter((c) => c.vendor)
    .map((c) => evaluateContract(c, futureCaps, displaceable, years));

  const competitorByYear = Array.from({ length: years }, (_, y) =>
    competitorLines.reduce((sum, l) => sum + (y + 1 >= l.firstYear ? l.saved / Math.max(l.yearsSaved, 1) : 0), 0),
  );
  const competitorTotal = competitorLines.reduce((sum, l) => sum + l.saved, 0);

  const benefitTotal = competitorTotal;
  const netBenefit = benefitTotal - investmentTotal;
  const roi = investmentTotal > 0 ? netBenefit / investmentTotal : null;

  /* Month-by-month, so payback is read off the curve rather than interpolated
     from annual totals. */
  const cashflow = [];
  let cumulative = 0;
  let paybackMonths = null;
  for (let m = 1; m <= years * 12; m += 1) {
    const yearIndex = Math.ceil(m / 12) - 1;
    const benefit = competitorByYear[yearIndex] / 12;
    const cost = microsoftByYear[yearIndex] / 12;
    cumulative += benefit - cost;
    cashflow.push({ month: m, benefit, cost, net: benefit - cost, cumulative });
    if (paybackMonths === null && cumulative >= 0 && investmentTotal > 0) paybackMonths = m;
  }

  return {
    years,
    users,
    delta,
    currentPerUser,
    futurePerUser,
    listUplift,
    incrementalPerUser,
    usingList,
    currentAnnual,
    futureAnnual,
    incrementalAnnual,
    microsoftByYear,
    competitorByYear,
    investmentTotal,
    competitorTotal,
    benefitTotal,
    netBenefit,
    roi,
    paybackMonths,
    cashflow,
    competitorLines,
    counts: {
      retained: delta.retained.length,
      newMicrosoft: delta.newMicrosoft.length,
      consolidation: delta.consolidation.length,
      strategic: delta.strategic.length,
      displaced: competitorLines.filter((l) => l.displaceable).length,
    },
    hasInputs: futureLicenses.length > 0 && users > 0,
  };
}
