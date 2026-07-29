/* ---------------------------------------------------------------------------
   Scripted assistant behaviour.

   This is a deterministic keyword matcher dressed as an agent — there is no
   model behind it. It exists to demonstrate three behaviours the FY27 vision
   rests on:

     POPULATE  extract structured fields from a sentence and fill the workflow
     EXPLAIN   justify a recommendation with the evidence it was drawn from
     COACH     name what is missing and what it would be worth

   `resolveResponse` returns render-ready blocks plus side-effect actions, so
   the panel never has to parse prose to decide what the app should do.
   --------------------------------------------------------------------------- */

import {
  COACHING_GAPS,
  DETECTED_VENDORS,
  DISPLACEMENTS,
  EXTRACTED_PROFILE,
  SKU_RECOMMENDATIONS,
  formatCurrency,
  formatPercent,
} from './mockData.js';

const sku = (id) => SKU_RECOMMENDATIONS.find((s) => s.id === id);
const displacement = (id) => DISPLACEMENTS.find((d) => d.id === id);

/* --------------------------- Suggested prompts ---------------------------- */

export const STAGE_SUGGESTIONS = [
  [
    { label: 'Use the Contoso example', kind: 'demo' },
    { label: 'What data do you still need from me?' },
    { label: 'How do similar manufacturers license security?' },
  ],
  [
    { label: 'Why are you recommending E5?' },
    { label: 'Why Security Copilot for this customer?' },
    { label: 'What did you decide not to recommend?' },
  ],
  [
    { label: 'Explain the consolidation opportunity' },
    { label: 'How defensible is the Splunk displacement?' },
    { label: 'How will CrowdStrike respond to this?' },
  ],
  [
    { label: 'How did you calculate the ROI?' },
    { label: 'Draft an executive summary I can send' },
    { label: 'What if the CFO pushes back on the savings?' },
  ],
];

/* ------------------------------ Stage intros ------------------------------ */

export function getStageIntro(stageIndex, ctx) {
  switch (stageIndex) {
    case 0:
      return {
        intent: 'INTRO_PROFILE',
        blocks: [
          {
            type: 'text',
            text: "I'm your business case copilot. Describe the customer in your own words — who they are, what they run today, and what they're trying to fix — and I'll build the profile for you.",
          },
          {
            type: 'callout',
            tone: 'insight',
            title: 'You review, I type',
            text: 'Everything I populate is editable, and every field shows where the value came from and how confident I am.',
          },
        ],
      };
    case 1:
      return {
        intent: 'INTRO_SKUS',
        blocks: [
          {
            type: 'text',
            text: `Based on ${ctx.profile.companyName || 'the customer'} running ${
              ctx.profile.currentLicensing || 'Microsoft 365 E3'
            } across ${
              ctx.profile.employeeCount || '18,000'
            } seats with vendor consolidation as a stated goal, I've put four solutions forward and held one back.`,
          },
          {
            type: 'bullets',
            items: [
              '**Microsoft 365 E5** — the anchor. The uplift absorbs three tools they buy separately today.',
              '**Defender XDR** and **Sentinel** — the consolidation targets for endpoint, email and SIEM.',
              '**Security Copilot** — what turns a cost story into a capability story.',
            ],
          },
          {
            type: 'callout',
            tone: 'coach',
            title: 'Held back deliberately',
            text: 'I left the full Entra Suite out of the headline case. Entra ID P2 already covers the Okta displacement inside E5, and adding more surface area weakens the numbers you have to defend.',
          },
          {
            type: 'actions',
            items: [
              { label: 'Why are you recommending E5?', kind: 'prompt' },
              { label: 'What did you decide not to recommend?', kind: 'prompt' },
            ],
          },
        ],
      };
    case 2:
      return {
        intent: 'INTRO_DISPLACEMENT',
        blocks: [
          {
            type: 'callout',
            tone: 'insight',
            title: 'Vendor consolidation opportunity identified',
            text: 'Consolidating into the Microsoft security stack may reduce operational complexity and licensing costs. I mapped four third-party products onto three Microsoft platforms.',
          },
          {
            type: 'mapping',
            items: DISPLACEMENTS.map((d) => ({
              from: d.from.vendor,
              to: d.to.family,
              confidence: d.confidence,
            })),
          },
          {
            type: 'text',
            text: `That is ${formatCurrency(
              DISPLACEMENTS.reduce((s, d) => s + d.from.annualSpend, 0),
            )} of annual third-party spend in scope. Toggle any mapping off and I'll re-run the case — the Proofpoint line in particular is inferred, not confirmed.`,
          },
        ],
      };
    case 3:
      return {
        intent: 'INTRO_RESULTS',
        blocks: [
          {
            type: 'text',
            text: `The case is assembled. Over three years it returns ${formatPercent(
              ctx.businessCase.roi,
            )} on an incremental investment of ${formatCurrency(
              ctx.businessCase.investmentTotal,
            )}, breaking even in month ${ctx.businessCase.paybackMonths}.`,
          },
          {
            type: 'callout',
            tone: 'coach',
            title: 'Before this reaches a CFO',
            text: 'Two inputs are still modelled rather than customer-validated: current security spend and Splunk ingest volume. Confirm both and this moves from a directional case to a defensible one.',
          },
          {
            type: 'actions',
            items: [
              { label: 'How did you calculate the ROI?', kind: 'prompt' },
              { label: 'Draft an executive summary I can send', kind: 'prompt' },
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

/**
 * Ordered intent table. First match wins, so put the specific tests above the
 * general ones.
 */
const INTENTS = [
  /* ---------------------------- POPULATE ---------------------------- */
  {
    id: 'EXTRACT_PROFILE',
    test: (input, ctx) =>
      !ctx.profilePopulated &&
      (has(input, 'contoso', 'crowdstrike', 'okta', 'splunk', 'proofpoint') ||
        /\b\d{1,3}[,.]?\d{3}\b/.test(input) ||
        has(input, 'employees', 'seats', 'headcount', 'e3', 'e5')),
    thinking: [
      'Reading the description',
      'Matching to account records',
      'Classifying industry and geography',
      'Populating the customer profile',
    ],
    delay: 2600,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: "I picked six attributes out of that and filled in the profile. Here's what I captured and how sure I am:",
        },
        {
          type: 'fields',
          items: EXTRACTED_PROFILE.filter((f) => f.key !== 'businessObjectives').map((f) => ({
            label: labelFor(f.key),
            value: f.value,
            confidence: f.confidence,
            basis: f.basis,
          })),
        },
        {
          type: 'text',
          text: 'I also detected the third-party estate — this is what drives the consolidation story later:',
        },
        {
          type: 'vendors',
          items: DETECTED_VENDORS,
        },
        {
          type: 'callout',
          tone: 'coach',
          title: 'Two of those are inferred, not stated',
          text: 'You told me about CrowdStrike and Okta. I added Splunk and Proofpoint from install-base signal for comparable manufacturing estates — worth confirming before either number reaches a customer.',
        },
        {
          type: 'actions',
          items: [
            { label: 'What data do you still need from me?', kind: 'prompt' },
            { label: 'Continue to SKU selection', kind: 'navigate', stage: 1 },
          ],
        },
      ],
      actions: [{ type: 'populateProfile' }],
    }),
  },
  {
    id: 'EXTRACT_PROFILE_REPEAT',
    test: (input, ctx) => ctx.profilePopulated && has(input, 'contoso', 'employees', 'crowdstrike'),
    thinking: ['Reconciling with the captured profile'],
    delay: 1300,
    build: (input, ctx) => ({
      blocks: [
        {
          type: 'text',
          text: `I already have ${
            ctx.profile.companyName || 'that customer'
          } captured with ${ctx.profile.employeeCount} seats on ${ctx.profile.currentLicensing}. Nothing in that changes what I extracted — edit any field directly if a detail is off, and I'll re-run the downstream numbers.`,
        },
      ],
    }),
  },

  /* ----------------------------- EXPLAIN ---------------------------- */
  {
    id: 'WHY_E5',
    test: (input) =>
      has(input, 'e5') &&
      (has(input, 'why', 'recommend', 'justify', 'explain', 'rationale') || input.trim() === 'e5'),
    thinking: ['Retrieving recommendation rationale', 'Checking supporting evidence'],
    delay: 1900,
    build: () => {
      const s = sku('m365e5');
      return {
        blocks: [
          { type: 'text', text: s.rationale },
          {
            type: 'text',
            text: 'The evidence I weighted, in order:',
          },
          { type: 'bullets', items: s.evidence },
          {
            type: 'callout',
            tone: 'insight',
            title: 'The part that makes it defensible',
            text: `E5 displaces ${s.displaces.join(
              ', ',
            )}. That reframes the uplift as a substitution rather than net-new spend, which is the argument a CFO actually responds to.`,
          },
          {
            type: 'actions',
            items: [
              { label: 'How much of the uplift is offset?', kind: 'prompt' },
              { label: 'Show me the consolidation map', kind: 'navigate', stage: 2 },
            ],
          },
        ],
      };
    },
  },
  {
    id: 'UPLIFT_OFFSET',
    test: (input) => has(input, 'offset', 'uplift') && has(input, 'how much', 'offset', 'cover'),
    thinking: ['Comparing displaced spend against incremental licensing'],
    delay: 1800,
    build: (input, ctx) => ({
      blocks: [
        {
          type: 'text',
          text: `Fully — and then some. The retiring third-party contracts run at ${formatCurrency(
            ctx.businessCase.annualThirdPartySpend,
          )} a year. The incremental Microsoft run-rate that replaces them is ${formatCurrency(
            ctx.businessCase.annualMicrosoftSpend,
          )} a year.`,
        },
        {
          type: 'metrics',
          items: [
            {
              label: 'Third-party spend today',
              value: formatCurrency(ctx.businessCase.annualThirdPartySpend),
              caption: 'per year',
            },
            {
              label: 'Incremental Microsoft',
              value: formatCurrency(ctx.businessCase.annualMicrosoftSpend),
              caption: 'per year',
            },
            {
              label: 'Net licensing reduction',
              value: formatCurrency(ctx.businessCase.annualLicensingReduction),
              caption: 'per year',
              tone: 'positive',
            },
          ],
        },
        {
          type: 'text',
          text: 'Everything above that line — analyst time, identity administration, vendor overhead — is upside on top of the licensing arithmetic.',
        },
      ],
    }),
  },
  {
    id: 'WHY_COPILOT',
    test: (input) => has(input, 'copilot'),
    thinking: ['Retrieving recommendation rationale'],
    delay: 1700,
    build: () => {
      const s = sku('securitycopilot');
      return {
        blocks: [
          { type: 'text', text: s.rationale },
          { type: 'bullets', items: s.evidence },
          {
            type: 'callout',
            tone: 'coach',
            title: 'Position this one carefully',
            text: 'Copilot is the only line in the case that adds cost without displacing a vendor. Lead with the security operations objective the customer stated, not with the savings — otherwise it reads as a bolt-on.',
          },
        ],
      };
    },
  },
  {
    id: 'WHY_SENTINEL',
    test: (input) => has(input, 'sentinel', 'splunk', 'siem'),
    thinking: ['Checking SIEM displacement confidence', 'Reviewing ingest assumptions'],
    delay: 1900,
    build: () => {
      const d = displacement('splunk');
      return {
        blocks: [
          { type: 'text', text: sku('sentinel').rationale },
          {
            type: 'callout',
            tone: 'warning',
            title: 'This is the softest number in the case',
            text: `${d.commentary} It carries ${formatCurrency(
              d.benefit3yr,
            )} of the three-year benefit, so it is the line most worth validating.`,
          },
          {
            type: 'actions',
            items: [
              { label: 'What if we remove the Splunk displacement?', kind: 'prompt' },
              { label: 'What data do you still need from me?', kind: 'prompt' },
            ],
          },
        ],
      };
    },
  },
  {
    id: 'NOT_RECOMMENDED',
    test: (input) =>
      has(input, 'not recommend', "didn't recommend", 'decide not', 'rule out', 'leave out', 'entra suite', 'held back'),
    thinking: ['Reviewing rejected options'],
    delay: 1600,
    build: () => {
      const s = sku('entrasuite');
      return {
        blocks: [
          {
            type: 'text',
            text: `One: **${s.name}**. ${s.rationale}`,
          },
          {
            type: 'callout',
            tone: 'insight',
            title: 'Why that matters',
            text: 'A case that recommends everything is a case nobody believes. Naming what you deliberately excluded — and why — is usually the fastest way to earn the room.',
          },
        ],
      };
    },
  },
  {
    id: 'EXPLAIN_CONSOLIDATION',
    test: (input) =>
      has(input, 'consolidat', 'vendor sprawl', 'displace', 'crowdstrike', 'okta', 'proofpoint', 'mapping'),
    thinking: ['Mapping current estate to Microsoft platforms', 'Scoring capability coverage'],
    delay: 2000,
    build: (input, ctx) => ({
      blocks: [
        {
          type: 'callout',
          tone: 'insight',
          title: 'Vendor consolidation opportunity identified',
          text: 'Consolidating into the Microsoft security stack may reduce operational complexity and licensing costs.',
        },
        {
          type: 'text',
          text: `Four products collapse onto three platforms, and ${
            DISPLACEMENTS.filter((d) => d.to.note.includes('E5')).length
          } of the four are already inside the E5 uplift rather than a separate purchase:`,
        },
        {
          type: 'mapping',
          items: DISPLACEMENTS.map((d) => ({
            from: `${d.from.vendor} ${d.from.product}`,
            to: d.to.product,
            confidence: d.confidence,
          })),
        },
        {
          type: 'text',
          text: `The operational argument is usually stronger than the licensing one: four consoles, four renewal cycles and four integration surfaces become one. Modelled at ${formatCurrency(
            ctx.businessCase.annualThirdPartySpend,
          )} of annual third-party spend in scope.`,
        },
      ],
    }),
  },

  /* ------------------------------ COACH ----------------------------- */
  {
    id: 'COACH_GAPS',
    test: (input) =>
      has(input, 'missing', 'still need', 'what else', 'confidence', 'stronger', 'gap', 'improve', 'weak'),
    thinking: ['Scanning the case for gaps', 'Ranking by impact on confidence'],
    delay: 2000,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'Three things would move this case forward. In order of what they are worth:',
        },
        {
          type: 'gaps',
          items: COACHING_GAPS,
        },
        {
          type: 'callout',
          tone: 'coach',
          title: 'The one that matters most',
          text: 'Current security licensing costs would improve the confidence of this business case. Right now the displaced spend is benchmarked from comparable estates — a single number from the customer replaces four estimates.',
        },
      ],
    }),
  },
  {
    id: 'WHY_RENEWALS',
    test: (input) => has(input, 'renewal'),
    thinking: ['Checking contract timing implications'],
    delay: 1500,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'Because savings only start when the old contract actually stops. If CrowdStrike renews two months after the E5 uplift lands, Contoso double-pays for that period and the payback month moves out.',
        },
        {
          type: 'bullets',
          items: [
            'Renewal dates let you sequence the migration so displacement lands at contract boundaries.',
            'They also tell you how much runway you have — a renewal six months out is a forcing function you can use.',
            'The current model assumes clean cutover with no overlap, which is the optimistic read.',
          ],
        },
      ],
    }),
  },
  {
    id: 'SOC_MODEL',
    test: (input) => has(input, 'soc', 'analyst', 'efficiency', 'headcount', 'mttr'),
    thinking: ['Retrieving operational benefit assumptions'],
    delay: 1700,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'Conservatively, and from benchmarks rather than from Contoso. The model assumes correlated XDR signal removes a share of manual cross-console triage, and that Copilot compresses investigation write-up time for tier-1 and tier-2.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Modelled 3-year value', value: '$980K', caption: 'SOC efficiency' },
            { label: 'Confidence', value: 'Medium', caption: 'benchmark-derived' },
          ],
        },
        {
          type: 'callout',
          tone: 'coach',
          title: 'Give me SOC headcount and this sharpens',
          text: 'With actual team size and shift coverage I can replace the benchmark with a bottom-up number, which is far easier to defend in the room.',
        },
      ],
    }),
  },

  /* --------------------------- The numbers -------------------------- */
  {
    id: 'EXPLAIN_ROI',
    test: (input) =>
      has(input, 'roi', 'payback', 'calculat', 'how did you get', 'how do you get', 'math', 'assumption', 'derive', 'breakeven', 'break even'),
    thinking: ['Retrieving the benefit ledger', 'Recomputing the cash flow', 'Checking payback month'],
    delay: 2300,
    build: (input, ctx) => {
      const c = ctx.businessCase;
      return {
        blocks: [
          {
            type: 'text',
            text: 'Three-year nominal, no discount rate applied. It is a substitution model, not a growth model — the benefit is mostly spend that stops.',
          },
          {
            type: 'metrics',
            items: [
              { label: 'Total benefit', value: formatCurrency(c.benefitTotal), caption: '3 years' },
              {
                label: 'Incremental investment',
                value: formatCurrency(c.investmentTotal),
                caption: '3 years',
              },
              {
                label: 'Net benefit',
                value: formatCurrency(c.netBenefit),
                caption: '3 years',
                tone: 'positive',
              },
            ],
          },
          {
            type: 'text',
            text: `${formatCurrency(c.netBenefit)} ÷ ${formatCurrency(
              c.investmentTotal,
            )} = ${formatPercent(c.roi)}. Of the benefit, ${formatCurrency(
              c.displacementBenefit,
            )} is retiring third-party contracts and ${formatCurrency(
              c.operationalBenefit,
            )} is operational efficiency.`,
          },
          {
            type: 'callout',
            tone: 'insight',
            title: `Why payback is month ${c.paybackMonths} and not month 3`,
            text: 'Benefit is phased across a nine-month deployment — an 18,000-seat identity and endpoint migration does not deliver value on day one. Costs start immediately, benefits ramp. That curve is what puts breakeven where it is.',
          },
          {
            type: 'actions',
            items: [
              { label: 'What if the CFO pushes back on the savings?', kind: 'prompt' },
              { label: 'What if we remove the Splunk displacement?', kind: 'prompt' },
            ],
          },
        ],
      };
    },
  },
  {
    id: 'SENSITIVITY',
    test: (input) =>
      has(input, 'what if', 'sensitivity', 'conservative', 'worst case', 'remove', 'without', 'drop'),
    thinking: ['Re-running the model without the line', 'Comparing against the base case'],
    delay: 2000,
    build: (input, ctx) => {
      const c = ctx.businessCase;
      return {
        blocks: [
          {
            type: 'text',
            text: 'Toggle any mapping off in the displacement stage and the case recalculates live — the dashboard is wired to the ledger, not to fixed numbers.',
          },
          {
            type: 'text',
            text: `For reference, dropping the two inferred lines — Splunk and Proofpoint — takes the case from ${formatPercent(
              c.roi,
            )} to roughly 106% ROI. Still comfortably positive, which is the useful thing to be able to say out loud in the meeting.`,
          },
          {
            type: 'callout',
            tone: 'insight',
            title: 'Lead with the floor, not the ceiling',
            text: 'Presenting the conservative case first and then showing the upside tends to survive scrutiny better than defending the highest number in the room.',
          },
          {
            type: 'actions',
            items: [{ label: 'Open the displacement map', kind: 'navigate', stage: 2 }],
          },
        ],
      };
    },
  },
  {
    id: 'OBJECTIONS',
    test: (input) =>
      has(input, 'objection', 'pushback', 'push back', 'cfo', 'cio', 'ciso', 'challenge', 'respond', 'counter', 'risk'),
    thinking: ['Anticipating objections', 'Preparing responses'],
    delay: 2100,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'Three you should expect, and what I would say to each:',
        },
        {
          type: 'objections',
          items: [
            {
              objection: '"Your savings assume we actually turn CrowdStrike off."',
              response:
                'Correct — and that is the right thing to interrogate. Tie the benefit to contract renewal dates so the saving is scheduled, not assumed. Offer a phased cutover with a parallel-run period costed into the deployment line.',
            },
            {
              objection: '"Defender is not as good as a best-of-breed EDR."',
              response:
                'Move the conversation from feature parity to operational outcome. The case is not that Defender beats Falcon on a single control — it is that correlated signal across endpoint, identity and email closes incidents faster than four consoles do. Offer a proof of concept on a business unit.',
            },
            {
              objection: '"This looks like a licensing exercise dressed up as strategy."',
              response:
                'Lead with the security operations objective the customer stated themselves, not with the savings. The consolidation is the mechanism; improved SOC outcomes are the goal. Security Copilot is your evidence that this is a capability play.',
            },
          ],
        },
      ],
    }),
  },
  {
    id: 'COMPETITIVE_RESPONSE',
    test: (input) => has(input, 'crowdstrike will', 'how will crowdstrike', 'competitor'),
    thinking: ['Reviewing competitive plays'],
    delay: 1700,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'Expect a discount defence and a best-of-breed argument — usually in that order.',
        },
        {
          type: 'bullets',
          items: [
            'A steep renewal discount is the standard first move. It shortens their contract value but protects the footprint, so the saving you are quoting may compress.',
            'The second move is capability depth on a narrow control set. Do not fight it head-on — the consolidation argument is about the estate, not one control.',
            'Your durable advantage is the seat: E5 capabilities are already paid for, so the comparison is incremental spend versus a full standalone contract.',
          ],
        },
      ],
    }),
  },

  /* ----------------------------- Reporting -------------------------- */
  {
    id: 'EXEC_SUMMARY',
    test: (input) =>
      has(input, 'summar', 'email', 'exec', 'draft', 'write', 'narrative', 'talk track', 'story'),
    thinking: ['Assembling the executive narrative', 'Formatting for a non-technical reader'],
    delay: 2400,
    build: (input, ctx) => {
      const c = ctx.businessCase;
      return {
        blocks: [
          { type: 'text', text: "Here's a draft you can send as-is or trim:" },
          {
            type: 'draft',
            title: 'Subject: Security consolidation — the business case',
            body: `${ctx.profile.companyName || 'Contoso'} operates four separate security vendors across ${
              ctx.profile.employeeCount || '18,000'
            } employees. Endpoint, identity, SIEM and email protection each run on their own contract, console and renewal cycle.

Consolidating onto Microsoft 365 E5 — which ${
              ctx.profile.companyName || 'Contoso'
            } already licenses at E3 — brings those four capabilities into licensing already in place at the seat level. The incremental investment is ${formatCurrency(
              c.investmentTotal,
            )} over three years against ${formatCurrency(c.benefitTotal)} in modelled benefit.

That is a ${formatPercent(c.roi)} return, ${formatCurrency(
              c.annualNetBenefit,
            )} in average annual net savings, and breakeven in month ${c.paybackMonths}.

The stronger argument is operational. Four consoles become one correlated incident graph, and Security Copilot compresses investigation time for the SOC team — which is the outcome ${
              ctx.profile.companyName || 'Contoso'
            } asked for.

Two inputs remain modelled rather than customer-validated: current security licensing spend and SIEM ingest volume. Confirming both would move this from a directional case to a committed one.`,
          },
          {
            type: 'callout',
            tone: 'coach',
            title: 'One deliberate choice',
            text: 'I put the caveat in the last paragraph rather than burying it. Executives who find the gap themselves discount the whole document; executives handed the gap tend to trust the rest of it.',
          },
        ],
      };
    },
  },
  {
    id: 'BENCHMARK',
    test: (input) => has(input, 'benchmark', 'peer', 'similar', 'comparable', 'industry', 'other customers'),
    thinking: ['Querying comparable accounts', 'Filtering to manufacturing, 10k–25k seats'],
    delay: 2000,
    build: () => ({
      blocks: [
        {
          type: 'text',
          text: 'Across comparable discrete manufacturing accounts in the 10,000–25,000 seat band:',
        },
        {
          type: 'metrics',
          items: [
            { label: 'On E5 or E5 Security', value: '58%', caption: 'of the peer set' },
            { label: 'Running 3+ security vendors', value: '71%', caption: 'of the peer set' },
            { label: 'Median consolidation ROI', value: '190%', caption: '3-year' },
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Contoso sits above the median',
          text: 'Mostly because four vendors is more sprawl than the peer median, so there is more to collapse. That is a useful framing — the opportunity is larger precisely because the current state is worse.',
        },
      ],
    }),
  },

  /* ---------------------------- Meta / help ------------------------- */
  {
    id: 'CAPABILITIES',
    test: (input) => has(input, 'what can you do', 'help me', 'how do you work', 'who are you'),
    thinking: ['Summarising capabilities'],
    delay: 1300,
    build: () => ({
      blocks: [
        { type: 'text', text: 'I work alongside the case rather than in place of it. Three things:' },
        {
          type: 'bullets',
          items: [
            '**Populate** — describe the customer in a sentence and I fill the workflow, with confidence on every field.',
            '**Explain** — ask why any recommendation is there and I show the evidence I weighted.',
            '**Coach** — I flag what is missing and tell you what it would be worth to go get it.',
          ],
        },
        {
          type: 'text',
          text: 'You stay in control of every field. I would rather be corrected early than be confidently wrong in front of a customer.',
        },
      ],
    }),
  },
];

/* ---------------------------- Stage fallbacks ----------------------------- */

const FALLBACKS = [
  {
    blocks: [
      {
        type: 'text',
        text: "I can work with that once the profile is in place. The fastest path is to describe the customer in a sentence — size, what they run today, what they're trying to fix — and I'll populate the workflow from it.",
      },
      {
        type: 'actions',
        items: [{ label: 'Use the Contoso example', kind: 'demo' }],
      },
    ],
  },
  {
    blocks: [
      {
        type: 'text',
        text: "I've kept that against the case. On this stage I'm most useful explaining why a recommendation is there, or what I deliberately left out.",
      },
      {
        type: 'actions',
        items: [
          { label: 'Why are you recommending E5?', kind: 'prompt' },
          { label: 'What did you decide not to recommend?', kind: 'prompt' },
        ],
      },
    ],
  },
  {
    blocks: [
      {
        type: 'text',
        text: "Noted. On the displacement map I can speak to how defensible each mapping is, or how the incumbent vendors are likely to respond.",
      },
      {
        type: 'actions',
        items: [
          { label: 'Explain the consolidation opportunity', kind: 'prompt' },
          { label: 'How will CrowdStrike respond to this?', kind: 'prompt' },
        ],
      },
    ],
  },
  {
    blocks: [
      {
        type: 'text',
        text: "I've added that to the case notes. From here I can walk through the maths, stress-test the numbers, or draft the narrative for you.",
      },
      {
        type: 'actions',
        items: [
          { label: 'How did you calculate the ROI?', kind: 'prompt' },
          { label: 'Draft an executive summary I can send', kind: 'prompt' },
        ],
      },
    ],
  },
];

/* -------------------------------- Resolver -------------------------------- */

const DEFAULT_THINKING = ['Reviewing the business case'];

/**
 * @param {string} rawInput   what the seller typed
 * @param {object} ctx        { stage, profile, profilePopulated, businessCase }
 */
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

  const fallback = FALLBACKS[ctx.stage] || FALLBACKS[0];
  return {
    intent: 'FALLBACK',
    thinking: DEFAULT_THINKING,
    delay: 1200,
    blocks: fallback.blocks,
    actions: [],
  };
}

function labelFor(key) {
  const labels = {
    companyName: 'Company name',
    industry: 'Industry',
    employeeCount: 'Employee count',
    geography: 'Geography',
    currentLicensing: 'Current licensing',
    businessObjectives: 'Business objectives',
  };
  return labels[key] || key;
}
