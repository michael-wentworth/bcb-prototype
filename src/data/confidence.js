/* ---------------------------------------------------------------------------
   Business case confidence.

   How complete the case is, not how good the deal is. A case can carry a 300%
   ROI and score badly here, and that is the point: the number answers "how much
   of this did anyone actually establish", so a seller can see what is still an
   assumption before a CFO finds it for them.

   Two rules the figure lives or dies by.

   First, every factor is measured against STATE, never against what a field
   displays. Step 2 shows the headcount in every empty seat box and the list
   price in every empty rate box, so a score read off the rendered form would
   report a perfect case where the seller entered nothing.

   Second, a factor that cannot apply is dropped from the denominator rather than
   scored zero. A case with no incumbents named should not be marked down four
   times for the four contract-shaped questions it was never asked.
   --------------------------------------------------------------------------- */

import { entitlementById } from './capabilities.js';

const blank = (v) => String(v ?? '').trim() === '';
const num = (v) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/* The model parses this field with a numeric coercion and falls back to the case
   start year, so "next year" and "TBC" are read as a blank would be. Scoring
   them as answered would credit an answer the arithmetic never receives. */
const YEAR = /^\s*\d{4}\s*$/;
const usableYear = (v) => YEAR.test(String(v ?? ''));

/* Which step fixes it, so "Improve confidence" can go somewhere useful. */
const CUSTOMER_STEP = 0;
const PRODUCT_STEP = 1;

/**
 * Provenance only ever counts against a value, never for its absence.
 *
 * confirmMeta upgrades a key that already exists, so a case filled in by hand
 * carries no fieldMeta at all. Deducting for missing meta would score an honest
 * manual case below a copilot-populated one, which is exactly backwards.
 */
const unreviewed = (meta, key) => {
  const m = meta?.[key];
  return !!m && m.source === 'ai' && m.confidence !== 'confirmed';
};

/**
 * The factors, in the order they are worth fixing.
 *
 * `weight` sums to 100 across all ten. `applies` drops a factor out of both
 * numerator and denominator when the case cannot answer it yet.
 */
export function buildConfidence({
  capabilityCase,
  customer = {},
  caseSetup = {},
  currentLicenses = [],
  futureLicenses = [],
  seatsByLicense = {},
  rateByLicense = {},
  contracts = [],
  fieldMeta = {},
} = {}) {
  const c = capabilityCase || {};
  const delta = c.delta || { potentialConsolidation: [], consolidation: [], newMicrosoft: [], retained: [] };
  const lines = c.competitorLines || [];
  const years = Math.max(1, Math.min(5, Number(caseSetup.analysisPeriod) || 3));

  /* Named vendors only. A contract with no vendor never becomes a line, so a
     ratio over lines would be blind to it. */
  const named = contracts.filter((ct) => ct.vendor);

  const factors = [];
  const add = (f) => factors.push(f);

  /* -------------------------------- the case ------------------------------ */

  add({
    id: 'future-state',
    weight: 15,
    label: 'Future state',
    applies: true,
    score: futureLicenses.length === 0 ? 0 : unreviewed(fieldMeta, 'futurePath') ? 0.5 : 1,
    step: PRODUCT_STEP,
    gap:
      futureLicenses.length === 0
        ? 'No future state chosen, so there is nothing to price.'
        : 'The licensing move came from the copilot and has not been reviewed.',
  });

  /* Empty is a legal answer — "not on a Microsoft bundle" — and state cannot
     tell it apart from never having been asked. Scored low rather than zero,
     with the gap text naming what it costs: with no current bundle the whole
     future bill counts as new spend and nothing lands in retained. */
  add({
    id: 'current-bundle',
    weight: 12,
    label: 'Current Microsoft bundle',
    applies: true,
    score: currentLicenses.length === 0 ? 0.25 : unreviewed(fieldMeta, 'currentLicenses') ? 0.5 : 1,
    step: PRODUCT_STEP,
    gap:
      currentLicenses.length === 0
        ? 'No current bundle, so the entire future bill counts as new spend and nothing counts as already owned.'
        : 'The current bundle came from the copilot and has not been reviewed.',
  });

  add({
    id: 'seat-count',
    weight: 12,
    label: 'Number of users',
    applies: true,
    score: num(customer.numberOfUsers) <= 0 ? 0 : unreviewed(fieldMeta, 'numberOfUsers') ? 0.6 : 1,
    step: CUSTOMER_STEP,
    gap:
      num(customer.numberOfUsers) <= 0
        ? 'Without a seat count nothing can be priced.'
        : 'The seat count came from the copilot and has not been confirmed.',
  });

  /* Three tiers, not two. An override is a real number; an untouched price from
     the price sheet is a defensible list figure; an untouched price we
     estimated ourselves is our own guess and earns nothing. */
  const rateScore = (id) => {
    if (!blank(rateByLicense[id])) return 1;
    return entitlementById(id)?.source === 'estimate' ? 0 : 0.4;
  };
  add({
    id: 'negotiated-rate',
    weight: 12,
    label: 'Negotiated rate per license',
    applies: true,
    score: futureLicenses.length ? mean(futureLicenses.map(rateScore)) : 0,
    step: PRODUCT_STEP,
    gap: 'Some licenses are still priced at list. Nobody at this seat count pays rate card.',
  });

  /* Deliberately light. A flat headcount across the horizon is often the right
     answer — it is just never a stated one. */
  const seatSlots = futureLicenses.flatMap((id) =>
    Array.from({ length: years }, (_, y) => !blank(seatsByLicense[id]?.[y])),
  );
  add({
    id: 'seat-ramp',
    weight: 6,
    label: 'Seats per year',
    applies: years > 1 && futureLicenses.length > 0,
    score: seatSlots.length ? seatSlots.filter(Boolean).length / seatSlots.length : 0,
    step: PRODUCT_STEP,
    gap: 'Seats default to the headcount every year. A phased rollout would change the investment.',
  });

  /* ----------------------------- the incumbents --------------------------- */

  /* The highest weight, because it counts questions nobody asked rather than
     answers nobody gave. Every capability here is one the customer may well be
     paying somebody for, and the case is claiming no saving on it. */
  add({
    id: 'incumbent-coverage',
    weight: 15,
    label: 'Incumbents named',
    applies: delta.potentialConsolidation.length > 0,
    score: delta.potentialConsolidation.length
      ? delta.consolidation.length / delta.potentialConsolidation.length
      : 0,
    step: PRODUCT_STEP,
    gap: `${delta.newMicrosoft.length} gained capabilit${delta.newMicrosoft.length === 1 ? 'y has' : 'ies have'} no incumbent named, so the case claims no saving on ${delta.newMicrosoft.length === 1 ? 'it' : 'them'}.`,
  });

  /* Kept separate from coverage and never multiplied by it: many vendors with
     no costs is a different conversation from few vendors with good ones. */
  /* Applicable as soon as the move adds a displaceable capability, not only
     once a contract exists. Gating on contracts let a low score be raised by
     deleting the very rows that were dragging it down: with Contoso's three
     uncosted vendors the figure read 59%, and deleting all three read 71%. */
  const askableContracts = named.length > 0 || delta.potentialConsolidation.length > 0;
  add({
    id: 'contract-cost',
    weight: 12,
    label: 'Competitor spend',
    applies: askableContracts,
    score: named.length ? named.filter((ct) => num(ct.annualCost) > 0).length / named.length : 0,
    step: PRODUCT_STEP,
    gap: 'A named vendor with no annual cost sits in the table contributing nothing.',
  });

  /* Read off the raw contract. The model substitutes the case start year for a
     blank, so by the time a line exists the gap is unrecoverable — and the
     substitution is not neutral: it forfeits year one of that saving. */
  add({
    id: 'contract-end',
    weight: 8,
    label: 'Contract end dates',
    applies: askableContracts,
    score: named.length ? named.filter((ct) => usableYear(ct.yearContractEnds)).length / named.length : 0,
    step: PRODUCT_STEP,
    gap: 'A blank end year is treated as this year, which quietly gives up the first year of that saving.',
  });

  const askable = lines.filter((l) => (l.uncovered || []).length > 0);
  add({
    id: 'partial-cover',
    weight: 5,
    label: 'Partial-cover confirmations',
    applies: askable.length > 0,
    score: askable.length ? askable.filter((l) => l.soleUseConfirmed).length / askable.length : 0,
    step: PRODUCT_STEP,
    gap: 'A contract that also covers something this move does not deliver stays uncounted until you confirm it.',
  });

  /* A contract linked only to net-new capabilities is a resolved answer, not a
     gap — the seller said where it applies and the model said it cannot be
     priced. Penalising it would mark down the one case that was done properly. */
  /* Two kinds of contract earn nothing and are nobody's mistake: one covering a
     capability Microsoft adds as net-new, and one covering a capability the
     customer already owns. Contoso's Okta line is the second — E3 already
     grants Entra ID P1 — and it is in the fixture precisely to show the model
     refusing a saving it cannot defend. Marking it down would dock the case for
     being done correctly. */
  const retainedSet = new Set(delta.retained || []);
  const answered = (l) =>
    (l.strategicLinked || []).length > 0 ||
    ((l.capabilityIds || []).length > 0 &&
      (l.capabilityIds || []).every((id) => retainedSet.has(id)));
  const dead = lines.filter(
    (l) =>
      !answered(l) &&
      ((l.capabilityIds || []).length === 0 ||
        (l.linked || []).length === 0 ||
        (l.yearsSaved === 0 && !l.blocked && (l.linked || []).length > 0)),
  );
  add({
    id: 'dead-weight',
    weight: 3,
    label: 'Contracts that cannot contribute',
    applies: lines.length > 0,
    score: lines.length ? 1 - dead.length / lines.length : 0,
    step: PRODUCT_STEP,
    gap: 'Some contracts cannot produce a saving as entered — unlinked, or lapsing outside the horizon.',
  });

  /* ------------------------------- the total ------------------------------ */

  const live = factors.filter((f) => f.applies);
  const denominator = live.reduce((sum, f) => sum + f.weight, 0);
  const numerator = live.reduce((sum, f) => sum + f.weight * Math.max(0, Math.min(1, f.score)), 0);

  /* The model's own gate. Below it there is no case to be confident about, and
     a percentage would be a number about nothing. */
  const started = c.hasInputs === true;
  const percent = !started || denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);

  const gaps = live
    .filter((f) => f.score < 1)
    .sort((a, b) => b.weight * (1 - b.score) - a.weight * (1 - a.score))
    .map((f) => ({
      id: f.id,
      label: f.label,
      detail: f.gap,
      step: f.step,
      /* What closing it completely would add, in points of the final figure. */
      worth: Math.round((f.weight * (1 - f.score)) / denominator * 100),
    }));

  return {
    started,
    percent,
    factors: live,
    gaps,
    /* Where "Improve confidence" should land: whichever step fixes the most. */
    nextStep: gaps.length ? gaps[0].step : null,
    band: percent >= 80 ? 'high' : percent >= 55 ? 'medium' : 'low',
  };
}
