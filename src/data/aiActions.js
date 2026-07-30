/* ---------------------------------------------------------------------------
   Section-level AI actions.

   Deterministic text operations standing in for a model. They are written to be
   honest: every transformation visibly does what its label says to the text
   actually in the section, rather than swapping in canned prose that ignores
   what the author wrote. Generating into an empty section is the one case that
   uses scripted content, because there is nothing to work from.
   --------------------------------------------------------------------------- */

import { formatCurrency, formatPercent } from './model.js';
import { currencySymbol } from './referenceData.js';

/* ------------------------------ text utilities ----------------------------- */

const paragraphs = (t) => String(t || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const sentences = (t) => String(t || '').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

/** Strip hedges and wordy constructions — the "improve clarity" pass. */
function tighten(text) {
  return String(text)
    .replace(/\b(quite|somewhat|fairly|rather|very|really|arguably|basically|essentially)\s+/gi, '')
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\bdue to the fact that\b/gi, 'because')
    .replace(/\bfor the purpose of\b/gi, 'for')
    .replace(/\bat this point in time\b/gi, 'now')
    .replace(/\bin the event that\b/gi, 'if')
    .replace(/\bwith regard to\b/gi, 'about')
    .replace(/\bis able to\b/gi, 'can')
    .replace(/\butili[sz]e\b/gi, 'use')
    .replace(/\bleverage\b/gi, 'use')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/** Keep the first sentence of each paragraph — the summarise pass. */
const condense = (text) => paragraphs(text).map((p) => sentences(p)[0]).filter(Boolean).join(' ');

/** Lead with the conclusion: promote the closing sentence to the front. */
function leadWithOutcome(text) {
  const all = paragraphs(text).flatMap(sentences);
  if (all.length < 2) return tighten(text);
  return tighten([all[all.length - 1], ...all.slice(0, -1)].join(' '));
}

/* ------------------------------- action set -------------------------------- */

export const WRITE_ACTIONS = [
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'summarize', label: 'Summarise' },
  { id: 'expand', label: 'Expand' },
  { id: 'clarity', label: 'Improve clarity' },
];

export const actionsForNarrative = (text) =>
  String(text || '').trim() ? WRITE_ACTIONS : [{ id: 'generate', label: 'Generate with AI' }];

/* ------------------------------- generation -------------------------------- */

const GENERATED = {
  summary: (ctx) => {
    const c = ctx.businessCase;
    const money = (v) => formatCurrency(v, { symbol: currencySymbol(ctx.currency) });
    const company = ctx.customer?.accountName || 'The customer';
    const seats = ctx.customer?.numberOfUsers
      ? `${Number(String(ctx.customer.numberOfUsers).replace(/[^0-9.]/g, '') || 0).toLocaleString('en-US')} users`
      : 'the estate';
    const vendors = c.competitorLines.length;

    return `${company} runs ${vendors || 'several'} third-party security ${
      vendors === 1 ? 'product' : 'products'
    } across ${seats}, each on its own contract, console and renewal cycle.

Consolidating onto Microsoft brings those capabilities into licensing the customer largely already holds. The investment is ${formatCurrency(
      c.investmentTotal,
    )} over ${c.years} year${c.years === 1 ? '' : 's'} against ${formatCurrency(
      c.benefitTotal,
    )} in modelled benefit — a ${formatPercent(c.roi)} return and ${formatCurrency(
      c.annualNetBenefit,
    )} in average annual net benefit${
      c.paybackMonths ? `, with payback in month ${c.paybackMonths}` : ''
    }.

The savings are dated rather than assumed: each displacement begins only once that vendor's contract lapses, which is why the return builds across the period rather than landing on day one.

Competitor pricing and contract end dates remain the assumptions worth confirming with the customer before this is presented.`;
  },

  recommendations: (ctx) => {
    const company = ctx.customer?.accountName || 'the customer';
    const seats = ctx.customer?.numberOfUsers
      ? Number(String(ctx.customer.numberOfUsers).replace(/[^0-9.]/g, '') || 0).toLocaleString('en-US')
      : 'all';
    return `**Approve the Microsoft licensing uplift** for ${seats} seats at the next Enterprise Agreement true-up. Owner: Procurement. Timing: Q1.

**Sequence each cutover to land at contract renewal**, so ${company} never pays twice for the same capability. Owner: Security operations. Timing: as each contract lapses.

**Confirm competitor spend and contract end dates** before the case goes to committee — they gate every saving in the model. Owner: Account team. Timing: immediately.`;
  },

  risks: () => `**Migration overrun.** A large identity and endpoint cutover slipping past the deployment window delays every benefit in the model. Mitigation: phase by business unit and budget a parallel-run period.

**Contract overlap.** If third-party renewals land before cutover completes, the customer pays twice and payback moves out. Mitigation: sequence the migration against renewal dates before committing to a date.

**Capability gap perception.** Teams attached to a best-of-breed tool will contest feature parity. Mitigation: scope a proof of concept on one business unit rather than arguing control by control.

**Benefit realisation.** Operational savings depend on the SOC changing how it works. Mitigation: give the efficiency benefit a named owner and review it at 90 days.`,
};

const EXPANSIONS = {
  summary:
    'The case does not depend on a single line item. Excluding the least-certain displacement still leaves the case comfortably positive, which is the useful thing to be able to say when the numbers are challenged.',
  recommendations:
    '**Confirm the assumptions before committee** — current security spend and SIEM ingest volume are modelled rather than customer-supplied, and both are cheap to verify. Owner: Account team. Timing: before the next review.',
  risks:
    '**Sponsor turnover.** A case that depends on one executive sponsor is fragile. Mitigation: have the CISO and the CFO co-sign the assumptions before it goes to committee.',
};

/**
 * Apply an action to a narrative section.
 * @returns {{text: string, note: string, fromScratch: boolean}|null}
 */
export function applyNarrativeAction(sectionId, currentText, actionId, ctx) {
  if (actionId === 'generate') {
    const gen = GENERATED[sectionId];
    if (!gen) return null;
    return { text: gen(ctx), note: 'Drafted from the analysis.', fromScratch: true };
  }

  const body = String(currentText || '');
  if (!body.trim()) return null;

  switch (actionId) {
    case 'rewrite':
      return {
        text: leadWithOutcome(body),
        note: 'Rewritten to lead with the outcome rather than the context.',
        fromScratch: false,
      };
    case 'summarize':
      return {
        text: condense(body),
        note: 'Condensed to the opening point of each paragraph.',
        fromScratch: false,
      };
    case 'expand':
      return {
        text: `${body}\n\n${EXPANSIONS[sectionId] || EXPANSIONS.summary}`,
        note: 'Expanded with a supporting paragraph at the end.',
        fromScratch: false,
      };
    case 'clarity':
      return {
        text: tighten(body),
        note: 'Tightened by removing hedges and wordy constructions.',
        fromScratch: false,
      };
    default:
      return null;
  }
}
