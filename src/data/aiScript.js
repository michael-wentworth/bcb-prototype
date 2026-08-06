/* ---------------------------------------------------------------------------
   Scripted assistant behaviour.

   A deterministic keyword matcher dressed as an agent — there is no model here.
   It demonstrates three behaviours: POPULATE the form from a sentence, EXPLAIN
   why something is in the case, and COACH on what is missing.

   `resolveResponse` returns render-ready blocks plus side-effect actions, so the
   panel never parses prose to decide what the app should do.
   --------------------------------------------------------------------------- */

import { currencySymbol } from './referenceData.js';
import { capabilityById, licenseById } from './capabilities.js';
import { formatCurrency, formatPercent } from './model.js';
import { DEMO_EXTRACTION } from './demoCase.js';

/* --------------------------- Suggested prompts ---------------------------- */

// Each step offers only what that step can actually answer. Step 1 holds the
// whole current estate now — the Microsoft bundle and the competitor contracts —
// so estate detection and the contract-year question belong to it, and step 2 is
// left with the proposal: which SKUs fit, and what they displace.
export const STEP_SUGGESTIONS = [
  [
    { label: 'Use the Contoso example', kind: 'demo' },
    { label: 'Which fields drive the numbers?' },
    { label: 'What competitor products are in this estate?' },
  ],
  [
    { label: 'What would this path add?' },
    { label: 'Why is the investment only the difference?' },
    { label: 'Why is nothing a displacement yet?' },
  ],
  [
    { label: 'How did you calculate the ROI?' },
    { label: 'What is still missing from this case?' },
    { label: 'What if the CFO pushes back on the savings?' },
  ],
];

/* ------------------------------- Step intros -------------------------------

   ONE text block per step, and nothing else. An intro fires before the seller
   has typed anything, so it is the worst possible moment to spend their
   attention on advice about a field they have not reached yet.

   Coaching that used to sit here as extra callouts now lives in STEP_SUGGESTIONS
   above — the contract-year warning and the displacement mapping are both a chip
   away, on the step they belong to, and they arrive when the seller asks rather
   than as a wall to read past. Move a field between steps and it is tempting to
   drag its callout along with it; put the coaching in a chip instead, or this
   grows back to three paragraphs. */

export function getStepIntro(stepIndex) {
  const line = [
    'Describe the customer and I will fill in this step.',
    'Pick what the customer owns today and where the customer is going.',
    'Change a license or a contract year and everything here recalculates.',
  ][stepIndex];
  if (!line) return null;
  return { intent: `INTRO_STEP_${stepIndex}`, blocks: [{ type: 'text', text: line }] };
}

/* ------------------------------- Matchers --------------------------------- */

const has = (input, ...terms) => terms.some((t) => input.includes(t));

/* Naming helpers. Every answer below talks about licenses and capabilities
   rather than SKU rows, because that is what the form now collects. */
const capNames = (ids = []) => ids.map((id) => capabilityById(id)?.name).filter(Boolean);
const licenseNames = (ids = []) => ids.map((id) => licenseById(id)?.name).filter(Boolean);
const list = (items) => {
  if (items.length <= 1) return items[0] || '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

const INTENTS = [
  /* ---------------------------- POPULATE ---------------------------- */
  {
    id: 'EXTRACT_CASE',
    test: (input, ctx) =>
      !ctx.customer.accountName &&
      (has(input, 'contoso', 'crowdstrike', 'okta', 'splunk') ||
        /\b\d{1,3}[,.]?\d{3}\b/.test(input) ||
        has(input, 'employees', 'seats', 'e3', 'e5')),
    thinking: [
      'Reading the description',
      'Matching to account records',
      'Reading the licensing move',
      'Estimating the competitor estate',
    ],
    delay: 2800,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'I filled in the whole case: customer details, the licensing move and the competitor contracts it displaces.',
        },
        {
          type: 'fields',
          items: [
            { label: 'Account', value: DEMO_EXTRACTION.customer.accountName, confidence: 'high', basis: 'Stated directly' },
            {
              label: 'Users',
              value: Number(DEMO_EXTRACTION.customer.numberOfUsers).toLocaleString(),
              confidence: 'high',
              basis: 'Stated directly',
            },
            { label: 'Industry', value: DEMO_EXTRACTION.customer.industry, confidence: 'high', basis: 'Matched to account record' },
            /* Must match case-contoso's currentLicenses and futureLicenses in
               caseLibrary.js — this block is what the copilot claims it did, and
               the fill puts that case into state a moment later. */
            { label: 'On today', value: 'Microsoft 365 E3', confidence: 'high', basis: 'Stated directly' },
            { label: 'Moving to', value: 'Microsoft 365 E5', confidence: 'high', basis: 'Stated directly' },
          ],
        },
        {
          type: 'callout',
          tone: 'coach',
          title: 'Two things worth checking',
          /* What was actually inferred, which is only the money. The prompt
             names all three products outright, so claiming to have found them
             in install-base signal credited the copilot with work the seller
             did — and it still named Splunk, which this case dropped when it
             became a plain E5 move with no SIEM to displace. */
          text: 'You named the products. I estimated the annual cost and contract end year for each, so correct those on product selection.',
        },
        {
          type: 'actions',
          items: [{ label: 'Go to product selection', kind: 'navigate', step: 1 }],
        },
      ],
      actions: [{ type: 'fillCase' }],
    }),
  },

  /* ----------------------------- EXPLAIN ---------------------------- */
  {
    id: 'EXPLAIN_FIT',
    /* "Why this?" answered from the delta rather than from a static outcome
       map. The old version reasoned about security outcomes, which the flow
       stopped collecting when it became capability-led — so it answered a
       question the form no longer asks. */
    test: (input) =>
      has(
        input,
        'explain the fit',
        'explain why',
        'why these sku',
        'why these product',
        'why this recommendation',
        'right recommendation',
        'why is this the right',
        'why this solution',
        'what would this path add',
        'justify',
      ),
    thinking: ['Reading the capability delta'],
    delay: 2000,
    build: (input, ctx) => {
      const c = ctx.capabilityCase;
      if (!c || c.delta.future.length === 0) {
        return {
          blocks: [
            {
              type: 'text',
              text: 'Nothing to justify yet. Pick where the customer is going.',
            },
            { type: 'actions', items: [{ label: 'Go to product selection', kind: 'navigate', step: 1 }] },
          ],
        };
      }
      const d = c.delta;
      const named = capNames(d.consolidation);
      const blocks = [
        {
          type: 'text',
          text: `${list(licenseNames(ctx.futureLicenses))} adds ${d.gained.length} new capabilities on top of the ${d.retained.length} the customer already owns.`,
        },
        {
          type: 'bullets',
          items: [
            `**Already owned**: ${d.retained.length}`,
            `**Gained with a market equivalent**: ${d.potentialConsolidation.length}`,
            `**Net-new**: ${d.strategic.length}`,
          ],
        },
      ];
      if (named.length) {
        blocks.push({
          type: 'text',
          text: `${named.length} of those are confirmed displacements: ${list(named)}.`,
        });
      } else {
        blocks.push({
          type: 'callout',
          tone: 'coach',
          title: 'Nothing is a displacement yet',
          text: 'A gained capability becomes a saving only once you name the incumbent supplying it.',
        });
      }
      return { blocks };
    },
  },
  {
    id: 'WHAT_IS_BOUGHT',
    /* "What are we actually buying" — the future licenses and what each one
       carries. Was a SKU shortlist derived from selected outcomes; there are no
       outcomes now, and the future state is an explicit choice rather than
       something to infer. */
    test: (input) =>
      has(input, 'which sku', 'which product', 'what are we buying', 'what does this buy', 'shortlist', 'what should i add'),
    thinking: ['Reading the future state'],
    delay: 1800,
    build: (input, ctx) => {
      const c = ctx.capabilityCase;
      const future = ctx.futureLicenses || [];
      if (future.length === 0) {
        return {
          blocks: [
            {
              type: 'text',
              text: 'Nothing selected yet. Choose an upgrade path or individual SKUs.',
            },
            { type: 'actions', items: [{ label: 'Go to product selection', kind: 'navigate', step: 1 }] },
          ],
        };
      }
      const currentCaps = new Set(c.delta.current);
      return {
        blocks: [
          { type: 'text', text: `${future.length} license${future.length === 1 ? '' : 's'} in the future state:` },
          {
            type: 'bullets',
            items: future.map((id) => {
              const sku = licenseById(id);
              if (!sku) return `**${id}**`;
              const adds = sku.grants.filter((g) => !currentCaps.has(g)).length;
              return adds > 0
                ? `**${sku.name}**: adds ${adds} new capabilit${adds === 1 ? 'y' : 'ies'}`
                : `**${sku.name}**: already owned`;
            }),
          },
          c.usingList
            ? {
                type: 'callout',
                tone: 'coach',
                title: 'Still priced at list',
                text: 'No negotiated rate set, so the investment is at rate card and overstated. Set the rate per license on step 2.',
              }
            : null,
        ].filter(Boolean),
      };
    },
  },
  {
    id: 'DISPLACEMENT_MAP',
    // One line per contract, because a contract is what the customer is billed
    // for. Reads the capability case rather than the old competitor rows.
    test: (input) =>
      has(input, 'displac', 'what are we replacing', 'what does this replace', 'which vendor'),
    thinking: ['Reading the contracts', 'Checking what each one covers'],
    delay: 1800,
    build: (input, ctx) => {
      const c = ctx.capabilityCase;
      const lines = c?.competitorLines || [];
      const money = (v) => formatCurrency(v, { symbol: currencySymbol(ctx.currency) });

      if (lines.length === 0) {
        return {
          blocks: [
            {
              type: 'text',
              text: 'No incumbents named yet. Add them on step 2 with a cost and a contract end year.',
            },
            { type: 'actions', items: [{ label: 'Go to product selection', kind: 'navigate', step: 1 }] },
          ],
        };
      }

      const counting = lines.filter((l) => l.displaceable);
      const idle = lines.filter((l) => !l.displaceable);
      return {
        blocks: [
          {
            type: 'text',
            text: `${counting.length} of ${lines.length} contract${lines.length === 1 ? '' : 's'} ${counting.length === 1 ? 'carries' : 'carry'} a saving, worth ${money(c.competitorTotal)} across ${c.years} years.`,
          },
          counting.length
            ? {
                type: 'bullets',
                items: counting.map(
                  (l) =>
                    `**${l.vendor}** → ${list(capNames(l.capabilityIds))}. ${money(l.annualCost)} a year, ending ${l.endYear}, ${money(l.saved)} inside the horizon.`,
                ),
              }
            : null,
          idle.length
            ? {
                type: 'callout',
                tone: 'coach',
                title: `${idle.length} contract${idle.length === 1 ? '' : 's'} contribute${idle.length === 1 ? 's' : ''} nothing`,
                text: idle.map((l) => `${l.vendor}: ${l.reason || 'no saving lands inside the horizon.'}`).join(' '),
              }
            : null,
        ].filter(Boolean),
      };
    },
  },
  {
    id: 'CONTRACT_YEARS',
    test: (input) => has(input, 'year contract ends', 'contract end', 'why does year'),
    thinking: ['Checking how contract timing feeds the model'],
    delay: 1700,
    build: (input, ctx) => ({
      blocks: [
        {
          type: 'text',
          text: 'Savings only start when the old contract stops.',
        },
        {
          type: 'bullets',
          items: [
            'Benefit begins the year **after** the contract ends.',
            `Your analysis period is **${ctx.caseSetup.analysisPeriod} year${Number(ctx.caseSetup.analysisPeriod) === 1 ? '' : 's'}**, so anything ending later is excluded.`,
            'The most common way a business case overstates savings.',
          ],
        },
      ],
    }),
  },
  {
    id: 'BCB_ROLE',
    test: (input) => has(input, 'role of security bcb', 'customer-facing', 'internal planning'),
    thinking: ['Checking what the role setting changes'],
    delay: 1500,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'It changes who the report is for and what it shows:',
        },
        {
          type: 'bullets',
          items: [
            '**Customer-facing pitch**: internal pricing detail hidden',
            '**Internal planning**: full detail, including discounting and margin',
            '**Partner enablement**: written for a partner seller',
          ],
        },
      ],
    }),
  },
  {
    id: 'DETECT_COMPETITORS',
    test: (input) => has(input, 'detect the competitor', 'in this estate', 'what competitor', 'which competitor'),
    thinking: ['Scanning install-base signal', 'Mapping onto capabilities'],
    delay: 2000,
    build: (input, ctx) => {
      const lines = ctx.capabilityCase?.competitorLines || [];
      const sym = currencySymbol(ctx.currency);

      if (!ctx.customer.accountName) {
        return {
          blocks: [
            {
              type: 'text',
              text: 'I need an account name first. Add it above, or add the products by hand on step 2.',
            },
          ],
        };
      }

      /* The estate is already named. Re-running the fill would overwrite
         whatever the seller has since corrected, so this reads it back. */
      if (lines.length > 0) {
        const total = lines.reduce((sum, l) => sum + (Number(l.annualCost) || 0), 0);
        const years = [...new Set(lines.map((l) => l.endYear).filter(Boolean))].sort();
        return {
          blocks: [
            {
              type: 'text',
              text: `${lines.length} product${lines.length === 1 ? '' : 's'} on this account, worth ${sym}${(total / 1e6).toFixed(2)}M a year:`,
            },
            {
              type: 'bullets',
              items: lines.map((l) => {
                const covers = capNames(l.capabilityIds);
                return `**${l.vendor}**: ${covers.length ? list(covers) : 'not linked to a capability yet'}, ${sym}${Number(l.annualCost).toLocaleString()} a year, contract ends ${l.endYear || 'unknown'}`;
              }),
            },
            {
              type: 'callout',
              tone: 'warning',
              title: 'Estimated, not sourced',
              text: `Contract end years (${years.join(' and ')}) are guesses. They gate every saving, so confirm them with the customer.`,
            },
          ],
        };
      }

      return {
        blocks: [
          {
            type: 'text',
            text: 'Adding the products I can see on this account, with estimated annual cost and contract end years. Correct them on step 2.',
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Estimated, not sourced',
            text: 'Contract end years are guesses. They gate every saving, so confirm them with the customer.',
          },
        ],
        actions: [{ type: 'fillCase' }],
      };
    },
  },

  /* ------------------------------ COACH ----------------------------- */
  {
    id: 'WHATS_MISSING',
    test: (input) =>
      /* Not a bare 'improve': the populate prompt says "improve security
         operations", so re-sending it after the case was filled matched this
         intent and answered a question nobody asked. */
      has(input, 'missing', 'still need', 'what else', 'gap', 'stronger', 'improve this', 'improve the case', 'validat'),
    thinking: ['Scanning the case for gaps'],
    delay: 1900,
    build: (input, ctx) => {
      const c = ctx.capabilityCase;
      const gaps = [];

      if (!ctx.customer.numberOfUsers) gaps.push('**Number of users**: nothing can be priced without it');
      if (!ctx.caseSetup.name) gaps.push('**Business case name**: what this case is saved under');
      if ((ctx.futureLicenses || []).length === 0)
        gaps.push('**A future state**: pick an upgrade path or individual SKUs');
      if (c?.usingList && (ctx.futureLicenses || []).length > 0)
        gaps.push('**A negotiated rate**: the investment is at list and overstated');

      const lines = c?.competitorLines || [];
      if (lines.length === 0)
        gaps.push('**Incumbent products**: without them the case rests on capability alone');

      const unlinked = lines.filter((l) => (l.capabilityIds || []).length === 0);
      if (unlinked.length > 0)
        gaps.push(
          `**${unlinked.length} contract${unlinked.length === 1 ? '' : 's'} not linked to a capability**: ${list(unlinked.map((l) => l.vendor))}. Say what ${unlinked.length === 1 ? 'it covers' : 'they cover'} to count the saving.`,
        );

      const blocked = lines.filter((l) => l.blocked);
      if (blocked.length > 0)
        gaps.push(
          `**${blocked.length} contract${blocked.length === 1 ? '' : 's'} awaiting confirmation**: ${list(blocked.map((l) => l.vendor))} also cover${blocked.length === 1 ? 's' : ''} something this move does not deliver. Nothing counts until you confirm the customer does not use ${blocked.length === 1 ? 'it' : 'them'} for that.`,
        );

      /* Two different reasons a named contract earns nothing, and they were
         being reported as one. Okta ends well inside a 3-year horizon — it earns
         nothing because E3 already grants the identity it covers, which is not
         something a longer analysis period would fix. */
      const retainedOnly = lines.filter(
        (l) => !l.blocked && (l.linked || []).length === 0 && (l.capabilityIds || []).length > 0,
      );
      if (retainedOnly.length > 0)
        gaps.push(
          `**${retainedOnly.length} contract${retainedOnly.length === 1 ? '' : 's'} covering capabilities the customer already owns**: ${list(retainedOnly.map((l) => l.vendor))}. Nothing this move adds, so there is no displacement to price.`,
        );

      const late = lines.filter((l) => !l.blocked && (l.linked || []).length > 0 && !l.displaceable);
      if (late.length > 0)
        gaps.push(
          `**${late.length} contract${late.length === 1 ? '' : 's'} outside the horizon**: ${list(late.map((l) => l.vendor))}, ending too late for a ${c.years}-year analysis.`,
        );

      /* The mirror of the coverage check: something present that nothing asked
         for. Harder to notice on a form you have just filled in. */
      const untouched = c ? capNames(c.delta.newMicrosoft) : [];
      if (untouched.length > 3)
        gaps.push(
          `**${untouched.length} gained capabilities with no incumbent named**: each one is a consolidation opportunity`,
        );

      return {
        blocks: [
          {
            type: 'text',
            text:
              gaps.length === 0
                ? 'Nothing structural is missing.'
                : gaps.length === 1
                  ? 'One thing to fix:'
                  : 'Fix these in this order:',
          },
          gaps.length ? { type: 'bullets', items: gaps } : null,
          {
            type: 'callout',
            tone: 'coach',
            title: 'The two that always matter',
            text: 'Customer-confirmed competitor spend and contract dates are the assumptions a CFO will test.',
          },
        ].filter(Boolean),
      };
    },
  },
  {
    id: 'EXPLAIN_ROI',
    test: (input) =>
      has(input, 'roi', 'payback', 'calculat', 'how did you get', 'math', 'assumption', 'breakeven', 'only the difference'),
    thinking: ['Retrieving the ledger', 'Recomputing the cash flow'],
    delay: 2200,
    build: (input, ctx) => {
      const c = ctx.capabilityCase;
      const money = (v) => formatCurrency(v, { symbol: currencySymbol(ctx.currency) });
      if (!c || !c.hasInputs) {
        return {
          blocks: [
            {
              type: 'text',
              text: 'Nothing to calculate yet. The model needs a seat count and a future state.',
            },
          ],
        };
      }
      return {
        blocks: [
          { type: 'text', text: `${c.years}-year nominal, no discount rate` },
          {
            type: 'metrics',
            items: [
              { label: 'Licensing savings', value: money(c.competitorTotal), caption: 'Competitor spend that stops' },
              { label: 'Microsoft uplift', value: money(c.investmentTotal), caption: `${c.years} year${c.years === 1 ? '' : 's'}` },
              { label: 'Net', value: money(c.netBenefit), caption: 'Savings − uplift', tone: c.netBenefit >= 0 ? 'positive' : 'neutral' },
            ],
          },
          {
            type: 'text',
            text:
              c.investmentTotal > 0
                ? `${money(c.netBenefit)} ÷ ${money(c.investmentTotal)} = ${formatPercent(c.roi)}. The uplift counted is only the **difference** between what the customer pays today and what the customer would pay.`
                : `No Microsoft uplift yet, so there is no return to divide. Savings stand at ${money(c.competitorTotal)}.`,
          },
          {
            type: 'callout',
            tone: 'insight',
            title: c.paybackMonths
              ? `Why payback is month ${c.paybackMonths}`
              : c.investmentTotal > 0
                ? 'This case does not break even'
                : 'Nothing to pay back yet',
            text: c.paybackMonths
              ? 'Costs start immediately, but each saving begins the year after its contract lapses.'
              : c.investmentTotal > 0
                ? 'Either the analysis period is too short for the contract end dates, or too few incumbents are named.'
                : 'Nothing on the Microsoft side yet, so there is no period to measure.',
          },
        ].filter(Boolean),
      };
    },
  },
  {
    id: 'OBJECTIONS',
    test: (input) => has(input, 'objection', 'pushback', 'push back', 'cfo', 'cio', 'challenge', 'counter'),
    thinking: ['Anticipating objections'],
    delay: 2000,
    build: () => ({
      blocks: [
        { type: 'text', text: 'Three to expect:' },
        {
          type: 'objections',
          items: [
            {
              objection: '"Your savings assume we turn the incumbent off."',
              response:
                'Correct, and that is what the Year contract ends field is for. Every saving is dated to a contract lapse, not assumed on day one.',
            },
            {
              objection: '"Defender is not as good as our best-of-breed tool."',
              response:
                'The case is not that one control wins. It is that correlated signal across the estate closes incidents faster. Offer a proof of concept on one business unit.',
            },
            {
              objection: '"This is a licensing exercise dressed up as strategy."',
              response:
                'Lead with the outcomes the customer named, not with the savings. Consolidation is the mechanism, not the goal.',
            },
          ],
        },
      ],
    }),
  },
  {
    id: 'DRIVERS',
    test: (input) =>
      has(input, 'which fields', 'drive the numbers', 'what matters most', 'which inputs'),
    thinking: ['Tracing the model back to its inputs'],
    delay: 1300,
    build: () => ({
      blocks: [
        { type: 'text', text: 'Five inputs move the result:' },
        {
          type: 'bullets',
          items: [
            '**Number of users**: every per-user rate multiplies through it',
            '**Current bundle**: decides which capabilities are gained rather than already owned',
            '**Rate per license**: at list the uplift is overstated',
            '**Competitor cost**: the only benefit line in the model',
            '**Year contract ends**: a saving starts the year after the contract lapses',
          ],
        },
      ],
    }),
  },
  {
    id: 'CAPABILITIES',
    test: (input) => has(input, 'what can you do', 'help me', 'how do you work', 'who are you'),
    thinking: ['Summarising capabilities'],
    delay: 1300,
    build: () => ({
      blocks: [
        { type: 'text', text: 'Three things:' },
        {
          type: 'bullets',
          items: [
            '**Populate**: describe the customer and I fill the form',
            '**Explain**: ask why anything is in the case and I show what it was drawn from',
            '**Coach**: ask what is missing and I name the gaps',
          ],
        },
      ],
    }),
  },
];

/* ---------------------------- Step fallbacks ----------------------------- */

const FALLBACKS = [
  {
    blocks: [
      {
        type: 'text',
        text: 'Describe the customer and I can fill this step: size, Microsoft licensing today, and the security vendors the customer pays.',
      },
      { type: 'actions', items: [{ label: 'Use the Contoso example', kind: 'demo' }] },
    ],
  },
  {
    blocks: [
      {
        type: 'text',
        text: 'Try one of these:',
      },
      {
        type: 'actions',
        items: [
          { label: 'Which products match the outcomes I selected?', kind: 'prompt' },
          { label: 'What are we displacing, and what is it worth?', kind: 'prompt' },
        ],
      },
    ],
  },
  {
    blocks: [
      {
        type: 'text',
        text: 'I can draft any section of the written case.',
      },
      {
        type: 'actions',
        items: [
          { label: 'How did you calculate the ROI?', kind: 'prompt' },
          { label: 'What is still missing from this case?', kind: 'prompt' },
        ],
      },
    ],
  },
];

/* -------------------------------- Resolver -------------------------------- */

const DEFAULT_THINKING = ['Reviewing the business case'];

export function resolveResponse(rawInput, ctx) {
  const input = (rawInput || '').toLowerCase();

  for (const intent of INTENTS) {
    let matched = false;
    try {
      matched = intent.test(input, ctx);
    } catch {
      matched = false;
    }
    if (!matched) continue;

    const result = intent.build(input, ctx) || {};
    return {
      intent: intent.id,
      thinking: intent.thinking || DEFAULT_THINKING,
      delay: intent.delay || 1600,
      blocks: result.blocks || [],
      actions: result.actions || [],
    };
  }

  const fallback = FALLBACKS[ctx.step] || FALLBACKS[0];
  return {
    intent: 'FALLBACK',
    thinking: DEFAULT_THINKING,
    delay: 1200,
    blocks: fallback.blocks,
    actions: [],
  };
}
