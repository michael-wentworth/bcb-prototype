/* ---------------------------------------------------------------------------
   Section-level AI actions.

   Deterministic text operations standing in for a model. They are written to be
   honest: every transformation visibly does what its label says to the text
   actually in the section, rather than swapping in canned prose that ignores
   what the author wrote. Generating into an empty section is the one case that
   uses scripted content, because there is nothing to work from.
   --------------------------------------------------------------------------- */

import { formatCurrency, formatPercent } from './mockData.js';

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
  { id: 'summarize', label: 'Summarize' },
  { id: 'expand', label: 'Expand' },
  { id: 'clarity', label: 'Improve clarity' },
];

export const actionsForNarrative = (text) =>
  String(text || '').trim() ? WRITE_ACTIONS : [{ id: 'generate', label: 'Generate with AI' }];

/* ------------------------------- generation -------------------------------- */

const GENERATED = {
  summary: (ctx) => {
    const c = ctx.businessCase;
    const company = ctx.profile.companyName || 'The customer';
    const seats = ctx.profile.employeeCount || '18,000';
    return `${company} operates ${c.vendorsConsolidated} separate security vendors across ${seats} employees. Endpoint, identity, SIEM and email protection each run on their own contract, console and renewal cycle.

Consolidating onto Microsoft 365 E5 brings those capabilities into licensing already in place at the seat level. The incremental investment is ${formatCurrency(
      c.investmentTotal,
    )} over three years against ${formatCurrency(
      c.benefitTotal,
    )} in modelled benefit: a ${formatPercent(c.roi)} return, ${formatCurrency(
      c.annualNetBenefit,
    )} in average annual net savings, and breakeven in month ${c.paybackMonths}.

The stronger argument is operational. Four consoles become one correlated incident graph, which is the outcome ${company} asked for.

Two inputs remain modelled rather than customer-validated: current security licensing spend and SIEM ingest volume.`;
  },

  recommendations: (ctx) => {
    const company = ctx.profile.companyName || 'the customer';
    return `**Approve the Microsoft 365 E5 uplift** for all ${
      ctx.profile.employeeCount || '18,000'
    } seats at the next Enterprise Agreement true-up. Owner: Procurement. Timing: Q1.

**Sequence the third-party cutovers to land at contract renewal**, so ${company} never pays twice for the same capability. Owner: Security Operations. Timing: Q2.

**Run a 90-day Security Copilot pilot** with the tier-1 SOC team before committing the full allocation. Owner: CISO office. Timing: Q2.`;
  },

  risks: () => `**Migration overrun.** A large identity and endpoint cutover slipping past the deployment window delays every benefit in the model. Mitigation: phase by business unit and budget a parallel-run period.

**Contract overlap.** If third-party renewals land before cutover completes, the customer pays twice and payback moves out. Mitigation: sequence the migration against renewal dates before committing to a date.

**Capability gap perception.** Teams attached to a best-of-breed tool will contest feature parity. Mitigation: scope a proof of concept on one business unit rather than arguing control by control.

**Benefit realisation.** Operational savings depend on the SOC changing how it works. Mitigation: give the efficiency benefit a named owner and review it at 90 days.`,
};

const EXPANSIONS = {
  summary:
    'The case does not depend on a single line item. Excluding the least-certain displacement still leaves the investment comfortably positive, which is the useful thing to be able to say when the numbers are challenged.',
  recommendations:
    '**Confirm the assumptions before committee.** Current security spend and SIEM ingest volume are modelled rather than customer-supplied, and both are cheap to verify. Owner: Account team. Timing: before the next review.',
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
    return { text: gen(ctx), note: 'Drafted it from the analysis.', fromScratch: true };
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
        note: 'Added a supporting paragraph at the end.',
        fromScratch: false,
      };
    case 'clarity':
      return {
        text: tighten(body),
        note: 'Removed hedges and wordy constructions.',
        fromScratch: false,
      };
    default:
      return null;
  }
}
