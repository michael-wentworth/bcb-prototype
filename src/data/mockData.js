/* ---------------------------------------------------------------------------
   Mock data for the FY27 Agentic Business Case Builder vision prototype.

   Everything here is fictional and scripted. No API, no backend, no auth.

   The financial model is deliberately built as a single ledger that the
   dashboard derives from, rather than three hard-coded hero numbers. That way
   the ROI, the savings, the payback month and the cash-flow chart can never
   disagree with each other on stage — and toggling a vendor displacement in
   stage 3 flows through to the executive summary in stage 4.
   --------------------------------------------------------------------------- */

export const STAGES = [
  {
    id: 'profile',
    label: 'Customer Profile',
    caption: 'Understand the customer',
  },
  {
    id: 'skus',
    label: 'SKU Selection',
    caption: 'Recommend solutions',
  },
  {
    id: 'displacement',
    label: 'Competitive Displacement',
    caption: 'Consolidate vendors',
  },
  {
    id: 'results',
    label: 'Results & Report',
    caption: 'Present the case',
  },
];

/** The scripted prompt the demo is built around. */
export const DEMO_PROMPT =
  'Contoso has 18,000 employees and currently uses Microsoft 365 E3, CrowdStrike and Okta. They want to reduce vendor sprawl and improve security operations.';

/* ------------------------------- Stage 1 --------------------------------- */

export const PROFILE_FIELDS = [
  { key: 'companyName', label: 'Company name', type: 'text', icon: 'building' },
  { key: 'industry', label: 'Industry', type: 'select', icon: 'industry' },
  { key: 'employeeCount', label: 'Employee count', type: 'text', icon: 'people' },
  { key: 'geography', label: 'Geography', type: 'select', icon: 'globe' },
  {
    key: 'currentLicensing',
    label: 'Current Microsoft licensing',
    type: 'select',
    icon: 'certificate',
  },
  {
    key: 'businessObjectives',
    label: 'Business objectives',
    type: 'textarea',
    icon: 'target',
  },
];

export const INDUSTRY_OPTIONS = [
  'Manufacturing',
  'Financial Services',
  'Healthcare & Life Sciences',
  'Retail & Consumer Goods',
  'Energy & Resources',
  'Public Sector',
  'Professional Services',
  'Telecommunications',
];

export const GEOGRAPHY_OPTIONS = [
  'North America',
  'North America + EMEA',
  'EMEA',
  'Asia Pacific',
  'Global (multi-region)',
  'Latin America',
];

export const LICENSING_OPTIONS = [
  'Microsoft 365 E3',
  'Microsoft 365 E5',
  'Microsoft 365 F3',
  'Office 365 E3',
  'Office 365 E1',
  'Mixed / Not standardised',
];

/**
 * What the assistant "extracts" from the scripted prompt. Each field carries a
 * confidence level and the evidence it was drawn from — that pairing is the
 * whole trust-and-transparency story of the stage.
 */
export const EXTRACTED_PROFILE = [
  {
    key: 'companyName',
    value: 'Contoso',
    confidence: 'high',
    basis: 'Stated directly',
    evidence: '"Contoso has 18,000 employees…"',
  },
  {
    key: 'employeeCount',
    value: '18,000',
    confidence: 'high',
    basis: 'Stated directly',
    evidence: '"…has 18,000 employees…"',
  },
  {
    key: 'currentLicensing',
    value: 'Microsoft 365 E3',
    confidence: 'high',
    basis: 'Stated directly',
    evidence: '"…currently uses Microsoft 365 E3…"',
  },
  {
    key: 'industry',
    value: 'Manufacturing',
    confidence: 'high',
    basis: 'Matched to account record',
    evidence: 'Contoso Ltd. — discrete manufacturing, MSX account taxonomy',
  },
  {
    key: 'geography',
    value: 'North America + EMEA',
    confidence: 'medium',
    basis: 'Inferred from account footprint',
    evidence: 'Primary operations recorded across US, Germany and the UK',
  },
  {
    key: 'businessObjectives',
    value:
      'Reduce vendor sprawl across the security estate and modernise security operations. Consolidate endpoint, identity and SIEM tooling onto a single platform to lower operational complexity.',
    confidence: 'high',
    basis: 'Paraphrased from stated goals',
    evidence: '"…want to reduce vendor sprawl and improve security operations."',
  },
];

/** Third-party vendors the assistant detects in the same pass. */
export const DETECTED_VENDORS = [
  {
    id: 'crowdstrike',
    name: 'CrowdStrike Falcon',
    category: 'Endpoint protection',
    confidence: 'high',
    basis: 'Stated directly',
  },
  {
    id: 'okta',
    name: 'Okta Workforce Identity',
    category: 'Identity & access',
    confidence: 'high',
    basis: 'Stated directly',
  },
  {
    id: 'splunk',
    name: 'Splunk Enterprise Security',
    category: 'SIEM',
    confidence: 'medium',
    basis: 'Inferred — SIEM present in 84% of comparable manufacturing estates',
  },
  {
    id: 'proofpoint',
    name: 'Proofpoint Email Protection',
    category: 'Email security',
    confidence: 'low',
    basis: 'Inferred from install-base signal — needs confirmation',
  },
];

/** Fields the coach flags as missing. Drives the "COACH" AI behaviour. */
export const COACHING_GAPS = [
  {
    id: 'security-spend',
    title: 'Current security licensing costs',
    impact: 'high',
    text: 'Current security tooling spend would raise the confidence of this business case from Modelled to Customer-validated.',
    prompt: 'What data do you still need from me?',
  },
  {
    id: 'renewal-date',
    title: 'Third-party renewal dates',
    impact: 'medium',
    text: 'Knowing when the CrowdStrike and Okta contracts renew lets us time the displacement and avoid double-paying.',
    prompt: 'Why do renewal dates matter for this case?',
  },
  {
    id: 'soc-headcount',
    title: 'Security operations headcount',
    impact: 'medium',
    text: 'SOC team size sharpens the operational efficiency benefit, currently modelled from industry benchmarks.',
    prompt: 'How are you modelling SOC efficiency?',
  },
];

/* ------------------------------- Stage 2 --------------------------------- */

export const SKU_RECOMMENDATIONS = [
  {
    id: 'm365e5',
    name: 'Microsoft 365 E5',
    category: 'Productivity & security suite',
    badge: 'Primary recommendation',
    badgeTone: 'brand',
    fitScore: 96,
    summary:
      'Upgrade the existing 18,000 E3 seats to E5 to bring endpoint, identity, and threat protection into the seat the customer already owns.',
    seats: '18,000 seats',
    rationale:
      'We recommend Microsoft 365 E5 because the customer currently operates on E3, is pursuing vendor consolidation, and has expressed security modernisation goals. The E5 uplift absorbs capabilities Contoso is buying separately today — endpoint protection, identity governance, and email security — so the incremental spend replaces existing third-party spend rather than adding to it.',
    evidence: [
      'Currently licensed at Microsoft 365 E3 for all 18,000 employees',
      'Stated objective: reduce vendor sprawl',
      'Three security point-products in the estate today',
    ],
    displaces: ['CrowdStrike Falcon', 'Okta Workforce Identity', 'Proofpoint Email Protection'],
    recommended: true,
  },
  {
    id: 'defenderxdr',
    name: 'Microsoft Defender XDR',
    category: 'Extended detection & response',
    badge: 'Strong fit',
    badgeTone: 'success',
    fitScore: 92,
    summary:
      'Unified detection and response across endpoint, identity, email, and cloud apps — included in the E5 uplift and the direct replacement for Falcon.',
    seats: 'Included with E5',
    rationale:
      'Defender XDR correlates signal across endpoint, identity, email and SaaS in a single incident graph. Contoso runs CrowdStrike for endpoint and Proofpoint for email as separate consoles today, so analysts stitch incidents together manually. Consolidating removes that hand-off and is the single largest driver of the security operations efficiency benefit in this case.',
    evidence: [
      'CrowdStrike Falcon deployed for endpoint protection',
      'Separate email security console in the estate',
      'Stated objective: improve security operations',
    ],
    displaces: ['CrowdStrike Falcon', 'Proofpoint Email Protection'],
    recommended: true,
  },
  {
    id: 'securitycopilot',
    name: 'Microsoft Security Copilot',
    category: 'AI for security operations',
    badge: 'Strong fit',
    badgeTone: 'success',
    fitScore: 88,
    summary:
      'Natural-language investigation, incident summarisation, and guided response for the SOC — the multiplier on the analyst efficiency benefit.',
    seats: '8 security compute units',
    rationale:
      'Security Copilot compresses triage and investigation time for tier-1 and tier-2 analysts. Because Contoso has explicitly asked to improve security operations rather than only cut cost, Copilot is what turns a consolidation story into a capability story. It is modelled conservatively here at 8 SCUs on business-hours coverage.',
    evidence: [
      'Stated objective: improve security operations',
      'Manufacturing sector median MTTR sits above peer benchmark',
      'Consolidated Defender + Sentinel signal makes Copilot materially more effective',
    ],
    displaces: [],
    recommended: true,
  },
  {
    id: 'sentinel',
    name: 'Microsoft Sentinel',
    category: 'Cloud-native SIEM',
    badge: 'Recommended with displacement',
    badgeTone: 'brand',
    fitScore: 84,
    summary:
      'Cloud-native SIEM and SOAR to replace the existing Splunk deployment, with the E5 data grant offsetting ingest cost.',
    seats: 'Commitment tier — 300 GB/day',
    rationale:
      'Sentinel is recommended alongside the E5 uplift because the customer is carrying a separate SIEM. E5 includes a per-user daily data grant that materially reduces Sentinel ingest cost, which only lands if the E5 upgrade proceeds — the two recommendations reinforce each other.',
    evidence: [
      'SIEM inferred in the estate (medium confidence — confirm with customer)',
      'E5 data grant offsets a meaningful share of ingest',
      'Stated objective: reduce vendor sprawl',
    ],
    displaces: ['Splunk Enterprise Security'],
    recommended: true,
  },
  {
    id: 'entrasuite',
    name: 'Microsoft Entra Suite',
    category: 'Identity & network access',
    badge: 'Consider',
    badgeTone: 'neutral',
    fitScore: 61,
    summary:
      'Identity governance, verified ID and internet access beyond what the E5 uplift covers. Worth a conversation, but not required for this case.',
    seats: '18,000 seats',
    rationale:
      'Entra ID P2 arrives with the E5 uplift and covers the Okta displacement on its own. The full Entra Suite adds governance and secure network access on top. It is held out of the headline case so the numbers stay defensible — surface it as a phase-two expansion once identity has migrated.',
    evidence: [
      'Okta displacement is already covered by Entra ID P2 within E5',
      'No stated network access or governance requirement yet',
    ],
    displaces: [],
    recommended: false,
  },
];

/* ------------------------------- Stage 3 --------------------------------- */

/**
 * Displacement map. `annualSpend` is the modelled third-party cost that goes
 * away; `benefit3yr` is what flows into the business case ledger.
 */
export const DISPLACEMENTS = [
  {
    id: 'crowdstrike',
    from: {
      vendor: 'CrowdStrike',
      product: 'Falcon Complete',
      category: 'Endpoint protection',
      annualSpend: 1080000,
    },
    to: {
      product: 'Microsoft Defender for Endpoint',
      family: 'Defender',
      note: 'Included in the Microsoft 365 E5 uplift',
    },
    benefit3yr: 3240000,
    confidence: 'high',
    coverage: 'Full',
    commentary:
      'Direct capability overlap. Defender for Endpoint covers EDR, attack surface reduction and vulnerability management already licensed inside the E5 uplift.',
  },
  {
    id: 'okta',
    from: {
      vendor: 'Okta',
      product: 'Workforce Identity',
      category: 'Identity & access',
      annualSpend: 620000,
    },
    to: {
      product: 'Microsoft Entra ID P2',
      family: 'Entra',
      note: 'Included in the Microsoft 365 E5 uplift',
    },
    benefit3yr: 1860000,
    confidence: 'high',
    coverage: 'Full',
    commentary:
      'Entra ID P2 covers SSO, conditional access, identity protection and access reviews. Migration effort concentrates on non-Microsoft SaaS federation — budgeted in the deployment line.',
  },
  {
    id: 'splunk',
    from: {
      vendor: 'Splunk',
      product: 'Enterprise Security',
      category: 'SIEM',
      annualSpend: 780000,
    },
    to: {
      product: 'Microsoft Sentinel',
      family: 'Sentinel',
      note: 'Commitment tier, offset by the E5 data grant',
    },
    benefit3yr: 2340000,
    confidence: 'medium',
    coverage: 'Full',
    commentary:
      'Sentinel replaces SIEM and SOAR. Confirm ingest volume with the customer — this line moves most under a different data profile, so it is the first number to validate.',
  },
  {
    id: 'proofpoint',
    from: {
      vendor: 'Proofpoint',
      product: 'Email Protection',
      category: 'Email security',
      annualSpend: 410000,
    },
    to: {
      product: 'Microsoft Defender for Office 365',
      family: 'Defender',
      note: 'Included in the Microsoft 365 E5 uplift',
    },
    benefit3yr: 1230000,
    confidence: 'low',
    coverage: 'Full',
    commentary:
      'Inferred from install-base signal rather than stated by the customer. Held in the case at low confidence — confirm before this number reaches a CFO.',
  },
];

/** The three Microsoft platforms the current estate collapses into. */
export const MICROSOFT_FAMILIES = [
  {
    id: 'Defender',
    name: 'Microsoft Defender',
    description: 'Endpoint, email, identity and cloud app protection under one incident graph.',
    replaces: 2,
  },
  {
    id: 'Entra',
    name: 'Microsoft Entra',
    description: 'Workforce identity, conditional access and identity governance.',
    replaces: 1,
  },
  {
    id: 'Sentinel',
    name: 'Microsoft Sentinel',
    description: 'Cloud-native SIEM and SOAR with the Defender signal already wired in.',
    replaces: 1,
  },
];

/* ------------------------------- Stage 4 --------------------------------- */

/** Benefits that are not tied to a specific vendor displacement (3-year totals). */
export const OPERATIONAL_BENEFITS = [
  {
    id: 'soc-efficiency',
    label: 'Security operations efficiency',
    value: 980000,
    detail: 'Analyst triage and investigation time reclaimed through XDR correlation and Copilot.',
    confidence: 'medium',
  },
  {
    id: 'identity-admin',
    label: 'Identity administration & helpdesk',
    value: 520000,
    detail: 'Self-service access reviews, passwordless rollout and fewer credential resets.',
    confidence: 'medium',
  },
  {
    id: 'vendor-overhead',
    label: 'Vendor management & integration overhead',
    value: 300000,
    detail: 'Four fewer renewal cycles, security reviews and connector integrations to maintain.',
    confidence: 'high',
  },
];

/** Incremental Microsoft investment over the 3-year horizon. */
export const INVESTMENT_LINES = [
  {
    id: 'e5-uplift',
    label: 'Microsoft 365 E5 uplift from E3',
    value: 2190000,
    detail: '18,000 seats, net of Enterprise Agreement discount and existing E3 credit.',
    oneTime: false,
  },
  {
    id: 'sentinel',
    label: 'Microsoft Sentinel',
    value: 420000,
    detail: 'Commitment tier at 300 GB/day, net of the Microsoft 365 E5 data grant.',
    oneTime: false,
  },
  {
    id: 'copilot',
    label: 'Microsoft Security Copilot',
    value: 300000,
    detail: '8 security compute units on business-hours coverage.',
    oneTime: false,
  },
  {
    id: 'deployment',
    label: 'Deployment, migration & enablement',
    value: 360000,
    detail: 'One-time. Identity migration, endpoint cutover, SIEM parallel-run and SOC enablement.',
    oneTime: true,
  },
];

/**
 * Benefit realisation curve across the 36-month horizon. Front months are near
 * zero because an 18,000-seat migration does not deliver value on day one —
 * this curve is what puts payback at month 11 rather than month 3.
 */
export const REALIZATION_CURVE = [
  0, 0, 0, 0.08, 0.16, 0.32, 0.46, 0.58, 0.7, 0.8, 0.88, 0.94, 0.97, 0.99, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

/** Months the one-time deployment investment is spread across. */
export const ONE_TIME_SPREAD_MONTHS = 6;

export const VALUE_DRIVERS = [
  {
    id: 'tooling-cost',
    title: 'Reduced security tooling costs',
    detail:
      'Four third-party security contracts retire into licensing Contoso already pays for at the seat level.',
  },
  {
    id: 'consolidation',
    title: 'Vendor consolidation',
    detail:
      'The security estate collapses from four vendors and four consoles to a single Microsoft platform.',
  },
  {
    id: 'secops',
    title: 'Improved security operations efficiency',
    detail:
      'Correlated XDR signal plus Security Copilot compresses triage and investigation for the SOC.',
  },
  {
    id: 'identity',
    title: 'Streamlined identity management',
    detail:
      'One identity plane for conditional access, governance and lifecycle instead of two directories in sync.',
  },
];

/** Assumptions the case rests on. Surfaced so the numbers stay auditable. */
export const ASSUMPTIONS = [
  { label: 'Analysis horizon', value: '3 years' },
  { label: 'Seat count', value: '18,000' },
  { label: 'Discount rate', value: 'Not applied (nominal)' },
  { label: 'Deployment window', value: '9 months to steady state' },
  { label: 'E5 uplift basis', value: 'EA benchmark, net of E3 credit' },
  { label: 'Benefit realisation', value: 'Phased — see cash flow' },
];

/* ------------------------- Derived financial model ------------------------ */

const round = (n) => Math.round(n);

/**
 * Build the full business case from the ledger.
 *
 * @param {string[]} includedDisplacementIds displacements the seller has kept in
 * @returns {object} totals, per-month cash flow, and the headline metrics
 */
export function buildBusinessCase(includedDisplacementIds) {
  const included = DISPLACEMENTS.filter((d) => includedDisplacementIds.includes(d.id));

  const displacementBenefit = included.reduce((sum, d) => sum + d.benefit3yr, 0);
  const operationalBenefit = OPERATIONAL_BENEFITS.reduce((sum, b) => sum + b.value, 0);
  const benefitTotal = displacementBenefit + operationalBenefit;

  const oneTimeCost = INVESTMENT_LINES.filter((l) => l.oneTime).reduce((s, l) => s + l.value, 0);
  const runRateCost = INVESTMENT_LINES.filter((l) => !l.oneTime).reduce((s, l) => s + l.value, 0);
  const investmentTotal = oneTimeCost + runRateCost;

  const horizon = REALIZATION_CURVE.length;
  const curveSum = REALIZATION_CURVE.reduce((s, r) => s + r, 0);
  const monthlyBenefitAtFullRun = benefitTotal / curveSum;
  const monthlyRunRate = runRateCost / horizon;
  const monthlyOneTime = oneTimeCost / ONE_TIME_SPREAD_MONTHS;

  let cumulative = 0;
  const cashflow = REALIZATION_CURVE.map((realisation, i) => {
    const month = i + 1;
    const benefit = monthlyBenefitAtFullRun * realisation;
    const cost = monthlyRunRate + (month <= ONE_TIME_SPREAD_MONTHS ? monthlyOneTime : 0);
    const net = benefit - cost;
    cumulative += net;
    return {
      month,
      benefit: round(benefit),
      cost: round(cost),
      net: round(net),
      cumulative: round(cumulative),
    };
  });

  const netBenefit = benefitTotal - investmentTotal;
  const roi = investmentTotal > 0 ? netBenefit / investmentTotal : 0;
  const breakeven = cashflow.find((m) => m.cumulative >= 0);
  const paybackMonths = breakeven ? breakeven.month : null;

  const annualThirdPartySpend = included.reduce((s, d) => s + d.from.annualSpend, 0);
  const annualMicrosoftSpend = runRateCost / (horizon / 12);

  return {
    horizonMonths: horizon,
    benefitTotal: round(benefitTotal),
    displacementBenefit: round(displacementBenefit),
    operationalBenefit: round(operationalBenefit),
    investmentTotal: round(investmentTotal),
    oneTimeCost: round(oneTimeCost),
    runRateCost: round(runRateCost),
    netBenefit: round(netBenefit),
    annualNetBenefit: round(netBenefit / (horizon / 12)),
    roi,
    paybackMonths,
    cashflow,
    annualThirdPartySpend: round(annualThirdPartySpend),
    annualMicrosoftSpend: round(annualMicrosoftSpend),
    annualLicensingReduction: round(annualThirdPartySpend - annualMicrosoftSpend),
    vendorsConsolidated: included.length,
    includedDisplacements: included,
  };
}

/* ------------------------------ Formatters -------------------------------- */

export function formatCurrency(value, { compact = true } = {}) {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (!compact || abs < 1000) {
    return `$${Math.round(value).toLocaleString('en-US')}`;
  }
  if (abs >= 1_000_000) {
    const m = value / 1_000_000;
    const decimals = Math.abs(m) >= 10 ? 1 : 2;
    return `$${trimZeros(m.toFixed(decimals))}M`;
  }
  return `$${trimZeros((value / 1000).toFixed(0))}K`;
}

function trimZeros(s) {
  // Only trim inside the decimal part — "970" must not become "97".
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

export function formatPercent(ratio) {
  if (ratio == null || Number.isNaN(ratio)) return '—';
  return `${Math.round(ratio * 100)}%`;
}
