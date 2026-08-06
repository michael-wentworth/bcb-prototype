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

/* Every money and count field on this form is free text, so "1,350,000" and
   "$1.35m" both arrive as strings. Exported because any consumer reading a raw
   contract off state has to strip the same formatting — a bare Number() there
   returns NaN and poisons whatever it feeds. */
export const num = (v) => {
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

/**
 * Every capability the future state delivers, grouped the way the table reads,
 * with each one marked as already owned or newly gained.
 *
 * Wider than competitorChoices on purpose. A table of only the new capabilities
 * answers "what changes" but never "what will they have", and the second is the
 * question the customer is actually buying an answer to. Retained rows also have
 * a true answer for who supplies them today — Microsoft already does — which an
 * empty vendor dropdown was quietly failing to say.
 *
 * Iterated over CAPABILITIES rather than the delta so ordering is the catalogue's
 * and does not shift when a license selection changes.
 */
export function futureCapabilityGroups(delta) {
  const future = new Set(delta.future);
  const retained = new Set(delta.retained);
  const mappable = new Set(delta.potentialConsolidation);
  const byGroup = new Map();
  CAPABILITIES.filter((c) => future.has(c.id)).forEach((c) => {
    const key = `${c.area}:${c.group}`;
    if (!byGroup.has(key)) byGroup.set(key, { area: c.area, group: c.group, capabilities: [] });
    byGroup.get(key).capabilities.push({
      ...c,
      retained: retained.has(c.id),
      mappable: mappable.has(c.id),
    });
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
export function evaluateContract(contract, futureCaps, displaceable, years, strategicFuture = new Set()) {
  const sold = capabilitiesSoldBy(contract.vendor);
  const linked = (contract.capabilityIds || []).filter((id) => displaceable.has(id));
  /* Named against something the move adds, but which the model calls net-new.
     Worth separating from "covers nothing this move adds": the two are identical
     in the arithmetic and mean opposite things to whoever is reading. */
  const strategicLinked = (contract.capabilityIds || []).filter((id) => strategicFuture.has(id));
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
    strategicLinked,
    reason:
      linked.length === 0 && strategicLinked.length > 0
        ? `${strategicLinked.map((id) => capabilityById(id)?.name).filter(Boolean).join(', ')} counts as net-new rather than a displacement, so this carries no saving.`
        : linked.length === 0
          ? 'Covers nothing the future state adds, so the spend continues.'
          : blocked
            ? `Also covers ${uncovered.map((id) => capabilityById(id)?.name).filter(Boolean).join(', ')}, which the future state does not deliver — confirm the customer does not use it for that.`
            : yearsSaved === 0
              ? 'The contract ends after the analysis period.'
              : null,
  };
}

export function buildCapabilityCase({
  analysisPeriod = 3,
  numberOfUsers = 0,
  currentLicenses = [],
  futureLicenses = [],
  contracts = [],
  /* Seats per license per year, and the rate per license. Both hold overrides
     only — a blank falls back to the headcount and the catalogue price — so the
     autofilled figure a seller sees is always current rather than a stale copy
     taken when the license was first picked.

     Seats are per year because a rollout is: 1,200 seats in year one and 5,000
     by year three is a different case from 5,000 on day one, and a flat
     multiplication cannot tell them apart. */
  seatsByLicense = {},
  rateByLicense = {},
} = {}) {
  const years = Math.max(1, Math.min(5, Number(analysisPeriod) || 3));
  const users = num(numberOfUsers);
  const delta = capabilityDelta(currentLicenses, futureLicenses, contracts);

  const currentPerUser = annualPerUserOf(currentLicenses);
  const futurePerUser = annualPerUserOf(futureLicenses);
  const listUplift = Math.max(0, futurePerUser - currentPerUser);

  /* Blank means "not overridden", so the default is read live rather than
     copied into state when the license is picked. */
  const rateOf = (id) => {
    const set = String(rateByLicense[id] ?? '').trim();
    return set === '' ? entitlementById(id)?.pupm || 0 : num(set);
  };
  const seatsOf = (id, y) => {
    const set = String(seatsByLicense[id]?.[y] ?? '').trim();
    return set === '' ? users : num(set);
  };
  const usingList = futureLicenses.every((id) => String(rateByLicense[id] ?? '').trim() === '');

  const currentAnnual = currentPerUser * users;
  const futureByYear = Array.from({ length: years }, (_, y) =>
    futureLicenses.reduce((sum, id) => sum + rateOf(id) * 12 * seatsOf(id, y), 0));
  const futureAnnual = futureByYear[0] || 0;

  /* The current spend continues either way, so only the difference is the
     investment. Floored at zero per year: a year where the future state costs
     less than today is a saving on a different line, not a negative cost here. */
  const microsoftByYear = futureByYear.map((f) => Math.max(0, f - currentAnnual));
  const investmentTotal = microsoftByYear.reduce((a, b) => a + b, 0);
  const incrementalAnnual = microsoftByYear[0] || 0;
  const incrementalPerUser = users > 0 ? incrementalAnnual / users : 0;

  /* One line per contract. A vendor cannot appear twice, so the same spend
     cannot be counted twice however it was entered. */
  const futureCaps = grantsOf(futureLicenses);
  const displaceable = new Set(delta.consolidation);
  const strategicFuture = new Set(delta.strategic);
  const competitorLines = contracts
    .filter((c) => c.vendor)
    .map((c) => evaluateContract(c, futureCaps, displaceable, years, strategicFuture));

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
  let spent = 0;
  let paybackMonths = null;
  for (let m = 1; m <= years * 12; m += 1) {
    const yearIndex = Math.ceil(m / 12) - 1;
    const benefit = competitorByYear[yearIndex] / 12;
    const cost = microsoftByYear[yearIndex] / 12;
    cumulative += benefit - cost;
    spent += cost;
    cashflow.push({ month: m, benefit, cost, net: benefit - cost, cumulative });
    /* `spent > 0` matters now that seats ramp: a year one costing nothing leaves
       the curve sitting at zero, which reads as "paid back in month 1" when
       nothing has been paid at all. Payback only means something once there is
       an investment to recover. */
    if (paybackMonths === null && spent > 0 && cumulative >= 0 && investmentTotal > 0) {
      paybackMonths = m;
    }
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
    futureByYear,
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
