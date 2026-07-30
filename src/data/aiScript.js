/* ---------------------------------------------------------------------------
   Scripted assistant behaviour.

   A deterministic keyword matcher dressed as an agent — there is no model here.
   It demonstrates three behaviours: POPULATE the form from a sentence, EXPLAIN
   why something is in the case, and COACH on what is missing.

   `resolveResponse` returns render-ready blocks plus side-effect actions, so the
   panel never parses prose to decide what the app should do.
   --------------------------------------------------------------------------- */

import { SECURITY_OUTCOMES, currencySymbol, skuById } from './referenceData.js';
import { formatCurrency, formatPercent } from './model.js';
import { DEMO_EXTRACTION } from './demoCase.js';

/* --------------------------- Suggested prompts ---------------------------- */

export const STEP_SUGGESTIONS = [
  [
    { label: 'Use the Contoso example', kind: 'demo' },
    { label: 'Which fields drive the numbers?' },
    { label: 'What does "Role of Security BCB" change?' },
  ],
  [
    { label: 'Which SKUs match the outcomes I selected?' },
    { label: 'Detect the competitor products in this estate' },
    { label: 'Why does "Year Contract Ends" matter?' },
  ],
  [
    { label: 'How did you calculate the ROI?' },
    { label: 'What is still missing from this case?' },
    { label: 'What if the CFO pushes back on the savings?' },
  ],
];

/* ------------------------------- Step intros ------------------------------- */

export function getStepIntro(stepIndex) {
  switch (stepIndex) {
    case 0:
      return {
        intent: 'INTRO_CUSTOMER',
        blocks: [
          {
            type: 'text',
            text: "I am the Security business case copilot. Describe the customer — who they are, their size, and what they run today — and I will populate the form from it.",
          },
          {
            type: 'callout',
            tone: 'insight',
            title: 'Every field shows its source',
            text: 'Every field I populate carries what it was drawn from, so you can check the ones that move the numbers before this reaches a customer.',
          },
        ],
      };
    case 1:
      return {
        intent: 'INTRO_SKU',
        blocks: [
          {
            type: 'text',
            text: 'This step is what the numbers are built from: the outcomes you are selling against, the SKUs and seats, what the customer already pays Microsoft, and what is being displaced.',
          },
          {
            type: 'callout',
            tone: 'coach',
            title: 'Year Contract Ends is the field people skip',
            text: 'A competitor contract running past the analysis period contributes nothing — the customer is still paying for it. Getting those years right is what stops a case overstating savings.',
          },
        ],
      };
    case 2:
      return {
        intent: 'INTRO_REPORT',
        blocks: [
          {
            type: 'text',
            text: 'Everything here derives from the two input steps. Change a seat count or a contract year and this recalculates immediately.',
          },
          {
            type: 'actions',
            items: [
              { label: 'How did you calculate the ROI?', kind: 'prompt' },
              { label: 'What is still missing from this case?', kind: 'prompt' },
            ],
          },
        ],
      };
    default:
      return null;
  }
}

/* ------------------------------- Matchers --------------------------------- */

const has = (input, ...terms) => terms.some((t) => input.includes(t));

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
      'Selecting outcomes and SKUs',
      'Estimating the competitor estate',
    ],
    delay: 2800,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: "I filled the whole case in — customer details, outcomes, SKUs and competitor products. Everything landed in the same fields you would have typed into, so it is all editable.",
        },
        {
          type: 'fields',
          items: [
            { label: 'Account', value: DEMO_EXTRACTION.customer.accountName, confidence: 'high', basis: 'Stated directly' },
            { label: 'Users', value: '18,000', confidence: 'high', basis: 'Stated directly' },
            { label: 'Industry', value: DEMO_EXTRACTION.customer.industry, confidence: 'high', basis: 'Matched to account record' },
            { label: 'Geography', value: 'North America', confidence: 'medium', basis: 'Inferred from account footprint' },
          ],
        },
        {
          type: 'callout',
          tone: 'coach',
          title: 'Two things worth checking',
          text: 'I inferred the Splunk and Proofpoint lines from install-base signal rather than anything you said, and I guessed the contract end years. Both change the numbers — correct them on step 2 before this goes out.',
        },
        {
          type: 'actions',
          items: [{ label: 'Go to SKU Selection', kind: 'navigate', step: 1 }],
        },
      ],
      actions: [{ type: 'fillCase' }],
    }),
  },

  /* ----------------------------- EXPLAIN ---------------------------- */
  {
    id: 'OUTCOMES_TO_SKUS',
    test: (input) => has(input, 'which sku', 'match the outcome', 'suggest sku', 'shortlist'),
    thinking: ['Mapping outcomes to SKUs'],
    delay: 1800,
    build: (input, ctx) => {
      const selected = SECURITY_OUTCOMES.filter((o) => ctx.outcomes.includes(o.id));
      if (selected.length === 0) {
        return {
          blocks: [
            {
              type: 'text',
              text: 'Nothing selected yet. Tick the outcomes the customer actually cares about and I will map them to SKUs — or just add the SKUs directly if you already know what you are selling.',
            },
          ],
        };
      }
      const implied = [...new Set(selected.flatMap((o) => o.implies))]
        .map((id) => skuById(id)?.name)
        .filter(Boolean);
      return {
        blocks: [
          {
            type: 'text',
            text: `Your ${selected.length} selected outcome${selected.length === 1 ? ' maps' : 's map'} to these:`,
          },
          { type: 'bullets', items: implied.map((n) => `**${n}**`) },
          {
            type: 'callout',
            tone: 'coach',
            title: 'Seats and price are still yours',
            text: 'I can tell you which SKUs fit the outcomes. I cannot tell you what the customer negotiated — enter the seats per year and the price you expect to land.',
          },
        ],
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
          text: 'Because savings only start when the old contract actually stops. A competitor product whose contract runs past your analysis period contributes nothing to the case — the customer is still paying for it.',
        },
        {
          type: 'bullets',
          items: [
            'Benefit begins the year **after** the contract ends.',
            `Your analysis period is **${ctx.caseSetup.analysisPeriod} year${Number(ctx.caseSetup.analysisPeriod) === 1 ? '' : 's'}**, so anything ending later is excluded and flagged in the table.`,
            'This is the single most common way a business case overstates savings.',
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
          text: 'It changes who the report is written for, and what it exposes:',
        },
        {
          type: 'bullets',
          items: [
            '**Customer-facing pitch** — written for the customer, with internal-only pricing detail hidden.',
            '**Internal planning** — full detail, including discounting and margin commentary.',
            '**Partner enablement** — written for a partner seller taking it to their own customer.',
          ],
        },
      ],
    }),
  },
  {
    id: 'DETECT_COMPETITORS',
    test: (input) => has(input, 'detect the competitor', 'competitor products in this estate'),
    thinking: ['Scanning install-base signal', 'Mapping onto Microsoft products'],
    delay: 2000,
    build: (input, ctx) => ({
      blocks: [
        {
          type: 'text',
          text: ctx.customer.accountName
            ? 'I have added the four products I can see against this account, with estimated annual cost and contract end years. Both figures are estimates — correct them before this reaches a customer.'
            : 'I need an account name and the current security stack before I can infer an estate. Fill those in on step 1, or add the competitor rows here.',
        },
        ctx.customer.accountName
          ? {
              type: 'callout',
              tone: 'warning',
              title: 'Estimated, not sourced',
              text: 'Contract end years in particular are guesses. They gate the entire savings calculation, so they are worth a phone call.',
            }
          : null,
      ].filter(Boolean),
      actions: ctx.customer.accountName ? [{ type: 'fillCase' }] : [],
    }),
  },

  /* ------------------------------ COACH ----------------------------- */
  {
    id: 'WHATS_MISSING',
    test: (input) =>
      has(input, 'missing', 'still need', 'what else', 'gap', 'stronger', 'improve', 'validat'),
    thinking: ['Scanning the case for gaps'],
    delay: 1900,
    build: (input, ctx) => {
      const gaps = [];
      if (!ctx.customer.numberOfUsers) gaps.push('**Number of Users** — nothing can be priced without it.');
      if (!ctx.caseSetup.name) gaps.push('**Business Case Name** — the identifier this case is saved under.');
      if (ctx.outcomes.length === 0) gaps.push('**Security outcomes** — what the customer is actually trying to fix.');
      if (ctx.skus.length === 0) gaps.push('**At least one SKU** — there is no investment to return on yet.');
      if (ctx.skus.some((s) => !s.pricePerMonth)) gaps.push('**Price per month** — missing on one or more SKUs, so those rows add no cost to the model.');
      if ((ctx.competitors.rows || []).length === 0)
        gaps.push('**Competitor products** — without them the case rests on soft benefit alone.');
      const outOfHorizon = ctx.businessCase.competitorLines.filter((l) => !l.displaceable);
      if (outOfHorizon.length > 0)
        gaps.push(
          `**${outOfHorizon.length} competitor contract${outOfHorizon.length === 1 ? '' : 's'}** — ending too late to contribute a saving inside your analysis period.`,
        );

      return {
        blocks: [
          {
            type: 'text',
            text: gaps.length
              ? 'Here is what would move this case forward, in the order I would fix them:'
              : 'Nothing structural is missing. You have enough here to present the case.',
          },
          gaps.length ? { type: 'bullets', items: gaps } : null,
          {
            type: 'callout',
            tone: 'coach',
            title: 'The two that always matter',
            text: 'Customer-confirmed competitor spend and contract dates. Everything else in this model is arithmetic; those two are the assumptions a CFO will test.',
          },
        ].filter(Boolean),
      };
    },
  },
  {
    id: 'EXPLAIN_ROI',
    test: (input) =>
      has(input, 'roi', 'payback', 'calculat', 'how did you get', 'math', 'assumption', 'breakeven'),
    thinking: ['Retrieving the ledger', 'Recomputing the cash flow'],
    delay: 2200,
    build: (input, ctx) => {
      const c = ctx.businessCase;
      const money = (v) => formatCurrency(v, { symbol: currencySymbol(ctx.currency) });
      if (!c.hasInputs) {
        return {
          blocks: [
            {
              type: 'text',
              text: 'There is nothing to calculate yet — no SKUs and no competitor products. Add either of those on step 2 and I will walk you through the arithmetic.',
            },
          ],
        };
      }
      return {
        blocks: [
          {
            type: 'text',
            text: `${c.years}-year nominal, no discount rate. It is a substitution model: the benefit is mostly spend that stops.`,
          },
          {
            type: 'metrics',
            items: [
              { label: 'Total benefit', value: money(c.benefitTotal), caption: `${c.years} year${c.years === 1 ? '' : 's'}` },
              { label: 'Microsoft investment', value: money(c.investmentTotal), caption: `${c.years} year${c.years === 1 ? '' : 's'}` },
              { label: 'Net', value: money(c.netBenefit), caption: 'benefit − investment', tone: c.netBenefit >= 0 ? 'positive' : 'neutral' },
            ],
          },
          {
            type: 'text',
            // hasInputs is true with competitor rows and no SKUs, so the division
            // has to be branched: at zero investment the model returns a null ROI
            // and this would otherwise read "US$500,000 ÷ US$0 = —", stating a
            // division that never happened.
            text:
              c.investmentTotal > 0
                ? `${money(c.netBenefit)} ÷ ${money(c.investmentTotal)} = ${formatPercent(c.roi)}. Of the benefit, ${money(c.competitorTotal)} is competitor spend that stops and ${money(c.additionalTotal)} is additional products and savings. The existing Microsoft bundle is not counted — the customer keeps paying it.`
                : `There is no Microsoft investment in this case yet, so there is no return to divide — add the SKUs and their pricing on step 2. The benefit side already stands at ${money(c.benefitTotal)}: ${money(c.competitorTotal)} of competitor spend that stops and ${money(c.additionalTotal)} of additional products and savings.`,
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
              ? 'Costs start immediately, but each competitor saving only begins once its contract lapses. That staggering is what sets the payback month.'
              : c.investmentTotal > 0
                ? 'Within the current horizon the investment is never recovered. Either the analysis period is too short for the contract end dates, or the SKU pricing needs revisiting.'
                : 'Payback measures how long an investment takes to return. With nothing on the Microsoft side of the ledger there is no period to measure.',
          },
        ],
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
        { type: 'text', text: 'Three you should expect, and what I would say to each:' },
        {
          type: 'objections',
          items: [
            {
              objection: '"Your savings assume we actually turn the incumbent off."',
              response:
                'Correct, and that is what the Year Contract Ends field is for. Every saving in this case is dated to a contract lapse rather than assumed on day one — show them the table.',
            },
            {
              objection: '"Defender is not as good as our best-of-breed tool."',
              response:
                'Move from feature parity to operational outcome. The case is not that one control wins; it is that correlated signal across the estate closes incidents faster. Offer a proof of concept on one business unit.',
            },
            {
              objection: '"This is a licensing exercise dressed up as strategy."',
              response:
                'Lead with the outcomes the customer told you they cared about, not with the savings. The consolidation is the mechanism; the outcomes are the goal.',
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
        {
          type: 'text',
          text: 'Four inputs move the result more than everything else combined:',
        },
        {
          type: 'bullets',
          items: [
            '**Number of Users** — every per-user price multiplies through it.',
            '**Analysis Period** — sets how many years of saving the case can count.',
            '**Competitor Cost** — the largest single benefit line in most cases.',
            '**Year Contract Ends** — a saving starts only when that contract lapses, so this decides how much of it lands inside the horizon.',
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
            '**Populate** — describe the customer and I fill the form, with confidence on each field.',
            '**Explain** — ask why anything is in the case and I show what it was drawn from.',
            '**Coach** — ask what is missing and I name the gaps and what closing them is worth.',
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
        text: 'Describe the customer — their size and what they run today — and I can fill this step from it.',
      },
      { type: 'actions', items: [{ label: 'Use the Contoso example', kind: 'demo' }] },
    ],
  },
  {
    blocks: [
      {
        type: 'text',
        text: 'On this step I can map outcomes to SKUs, explain how contract timing feeds the model, or estimate the competitor estate.',
      },
      {
        type: 'actions',
        items: [
          { label: 'Which SKUs match the outcomes I selected?', kind: 'prompt' },
          { label: 'Why does "Year Contract Ends" matter?', kind: 'prompt' },
        ],
      },
    ],
  },
  {
    blocks: [
      {
        type: 'text',
        text: 'From here I can walk through the maths, stress-test the numbers, or draft any section of the written case.',
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
