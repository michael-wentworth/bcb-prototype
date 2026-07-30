/* ---------------------------------------------------------------------------
   Reference data for the Security BCB forms.

   Field names and groupings follow the shipping product's first two screens so
   the prototype can be compared against it directly.
   Everything here is mock lookup data — there is no service behind it.
   --------------------------------------------------------------------------- */

/* ----------------------------- Workflow steps ------------------------------ */

export const STEPS = [
  // Current state, then future state, then what it is worth — the arc a business
  // case actually makes. Step 2 is "Recommended solution" rather than "AI
  // recommendations": the copilot can propose a starting point, but the SKU
  // table and the displacement mapping are filled in by hand, and the label
  // should not claim otherwise. It is also singular on purpose — the step
  // produces one proposal, not a menu of options.
  { id: 'customer', label: 'Customer environment', caption: 'Current state' },
  { id: 'sku', label: 'Recommended solution', caption: 'Future state' },
  { id: 'report', label: 'Business case report', caption: 'Value & justification' },
];

/* -------------------------- Customer Information --------------------------- */

export const INDUSTRIES = [
  'Manufacturing',
  'Financial services',
  'Healthcare & life sciences',
  'Retail & consumer goods',
  'Energy & resources',
  'Public sector',
  'Professional services',
  'Telecommunications',
  'Education',
  'Transportation & logistics',
];

/** Geography drives Currency — the product auto-populates it, so we do too. */
export const GEOGRAPHIES = [
  { id: 'northam', label: 'North America', currency: 'USD' },
  { id: 'latam', label: 'Latin America', currency: 'USD' },
  { id: 'uk', label: 'United Kingdom', currency: 'GBP' },
  { id: 'weu', label: 'Western Europe', currency: 'EUR' },
  { id: 'cee', label: 'Central & Eastern Europe', currency: 'EUR' },
  { id: 'mea', label: 'Middle East & Africa', currency: 'USD' },
  { id: 'apac', label: 'Asia Pacific', currency: 'USD' },
  { id: 'japan', label: 'Japan', currency: 'JPY' },
  { id: 'anz', label: 'Australia & New Zealand', currency: 'AUD' },
];

export const geographyById = (id) => GEOGRAPHIES.find((g) => g.id === id);

export const CUSTOMER_SEGMENTS = [
  'Enterprise',
  'Corporate',
  'Small, medium & corporate',
  'Public sector',
  'Education',
  'Small & medium business',
];

export const SALES_MOTIONS = [
  'New workload / greenfield',
  'Upsell to existing estate',
  'Competitive displacement',
  'Renewal / True-up',
  'Consolidation',
];

/** Role of Security BCB — changes tone and what the report exposes. */
export const BCB_ROLES = [
  {
    id: 'customer-facing',
    label: 'Customer-facing pitch',
    detail: 'Report is written for the customer. Internal-only pricing detail is hidden.',
  },
  {
    id: 'internal',
    label: 'Internal planning',
    detail: 'Full internal detail, including discounting and margin commentary.',
  },
  {
    id: 'partner',
    label: 'Partner enablement',
    detail: 'Written for a partner seller taking the case to their own customer.',
  },
];

export const ANALYSIS_PERIODS = [1, 2, 3, 4, 5];

/* --------------------------- Customer Environment -------------------------- */

export const EXISTING_MS_LICENSES = [
  'Microsoft 365 E3',
  'Microsoft 365 E5',
  'Microsoft 365 F3',
  'Microsoft 365 Business Premium',
  'Office 365 E1',
  'Office 365 E3',
  'Enterprise Mobility + Security E3',
  'Enterprise Mobility + Security E5',
  'Microsoft 365 E5 Security',
  'None / Not standardised',
];

export const SECURITY_STACK_CATEGORIES = [
  'Endpoint protection (EDR/EPP)',
  'Identity & access management',
  'SIEM / Security analytics',
  'Email & collaboration security',
  'Cloud security posture (CSPM)',
  'Data loss prevention',
  'Privileged access management',
  'Network / SASE',
  'Vulnerability management',
  'Security awareness training',
];

/** Known competitor products and the category each one sits in. */
export const COMPETITOR_CATALOG = [
  { name: 'CrowdStrike Falcon', category: 'Endpoint protection (EDR/EPP)' },
  { name: 'SentinelOne Singularity', category: 'Endpoint protection (EDR/EPP)' },
  { name: 'Okta Workforce Identity', category: 'Identity & access management' },
  { name: 'Ping Identity', category: 'Identity & access management' },
  { name: 'Splunk Enterprise Security', category: 'SIEM / Security analytics' },
  { name: 'IBM QRadar', category: 'SIEM / Security analytics' },
  { name: 'Proofpoint Email Protection', category: 'Email & collaboration security' },
  { name: 'Mimecast', category: 'Email & collaboration security' },
  { name: 'Wiz', category: 'Cloud security posture (CSPM)' },
  { name: 'Palo Alto Prisma Cloud', category: 'Cloud security posture (CSPM)' },
  { name: 'Symantec DLP', category: 'Data loss prevention' },
  { name: 'CyberArk', category: 'Privileged access management' },
  { name: 'Zscaler', category: 'Network / SASE' },
  { name: 'Tenable', category: 'Vulnerability management' },
  { name: 'KnowBe4', category: 'Security awareness training' },
];

/* ---------------------------- Security outcomes ---------------------------- */

/**
 * The eight outcome areas from the product. Each carries the SKUs it implies,
 * which is what lets the assistant recommend without inventing anything.
 */
export const SECURITY_OUTCOMES = [
  {
    id: 'identity',
    label: 'Identity and access management protection',
    detail:
      'Prevent unauthorized access and reduce identity-based breaches by enforcing Zero Trust principles.',
    implies: ['entra-p2'],
  },
  {
    id: 'threat',
    label: 'Threat detection & response (SOC/SIEM/XDR)',
    detail: 'Detect and respond to threats faster while improving SOC efficiency.',
    implies: ['defender-xdr', 'sentinel'],
  },
  {
    id: 'data',
    label: 'Data security and compliance',
    detail: 'Protect sensitive data and reduce risk of data leaks or compliance violations.',
    implies: ['purview'],
  },
  {
    id: 'endpoint',
    label: 'End point and device security',
    detail: 'Reduce endpoint compromise and improve device visibility and control.',
    implies: ['defender-endpoint', 'intune'],
  },
  {
    id: 'cloud',
    label: 'Cloud & application security',
    detail: 'Secure cloud workloads and applications while reducing misconfiguration risk.',
    implies: ['defender-cloud'],
  },
  {
    id: 'ai-security',
    label: 'AI-powered security (Security Copilot)',
    detail:
      'Increase security team productivity and reduce time to detect and respond using AI.',
    implies: ['security-copilot'],
  },
  {
    id: 'consolidation',
    label: 'Reduce cost and vendor consolidation',
    detail: 'Replace multiple tools and point solutions with a unified platform solution.',
    implies: ['m365-e5'],
  },
  {
    id: 'agents',
    label: 'Security and AI agents control plane (Agent 365)',
    detail:
      'Secure and govern AI agents while improving automation, visibility, and control across agent-driven workflows.',
    implies: ['agent-365'],
  },
];

/* -------------------------------- SKU catalog ------------------------------ */

export const SOLUTION_AREAS = [
  'Modern Work',
  'Security',
  'Azure Infrastructure',
  'Digital & App Innovation',
  'Data & AI',
];

export const SOLUTION_PLAYS = [
  'Secure Identities and Access',
  'Modernize Security Operations',
  'Safeguard Data and Compliance',
  'Secure Devices and Endpoints',
  'Secure Cloud Workloads',
  'Adopt AI Safely',
  'Consolidate the Security Estate',
];

/**
 * Microsoft SKUs available to model. `listPrice` is per user per month and is
 * a starting point only — the seller overrides it per row.
 */
export const MICROSOFT_SKUS = [
  {
    id: 'm365-e5',
    name: 'Microsoft 365 E5',
    listPrice: 57,
    solutionArea: 'Modern Work',
    solutionPlay: 'Consolidate the Security Estate',
  },
  {
    id: 'm365-e5-security',
    name: 'Microsoft 365 E5 Security',
    listPrice: 12,
    solutionArea: 'Security',
    solutionPlay: 'Consolidate the Security Estate',
  },
  {
    id: 'defender-xdr',
    name: 'Microsoft Defender XDR',
    listPrice: 12,
    solutionArea: 'Security',
    solutionPlay: 'Modernize Security Operations',
  },
  {
    id: 'defender-endpoint',
    name: 'Microsoft Defender for Endpoint P2',
    listPrice: 5.2,
    solutionArea: 'Security',
    solutionPlay: 'Secure Devices and Endpoints',
  },
  {
    id: 'defender-office',
    name: 'Microsoft Defender for Office 365 P2',
    listPrice: 5,
    solutionArea: 'Security',
    solutionPlay: 'Safeguard Data and Compliance',
  },
  {
    id: 'defender-cloud',
    name: 'Microsoft Defender for Cloud',
    listPrice: 15,
    solutionArea: 'Azure Infrastructure',
    solutionPlay: 'Secure Cloud Workloads',
  },
  {
    id: 'entra-p2',
    name: 'Microsoft Entra ID P2',
    listPrice: 9,
    solutionArea: 'Security',
    solutionPlay: 'Secure Identities and Access',
  },
  {
    id: 'entra-suite',
    name: 'Microsoft Entra Suite',
    listPrice: 12,
    solutionArea: 'Security',
    solutionPlay: 'Secure Identities and Access',
  },
  {
    id: 'sentinel',
    name: 'Microsoft Sentinel',
    listPrice: 8,
    solutionArea: 'Security',
    solutionPlay: 'Modernize Security Operations',
  },
  {
    id: 'purview',
    name: 'Microsoft Purview',
    listPrice: 10,
    solutionArea: 'Security',
    solutionPlay: 'Safeguard Data and Compliance',
  },
  {
    id: 'intune',
    name: 'Microsoft Intune Suite',
    listPrice: 10,
    solutionArea: 'Modern Work',
    solutionPlay: 'Secure Devices and Endpoints',
  },
  {
    id: 'security-copilot',
    name: 'Microsoft Security Copilot',
    listPrice: 4,
    solutionArea: 'Security',
    solutionPlay: 'Adopt AI Safely',
  },
  {
    id: 'agent-365',
    name: 'Microsoft Agent 365',
    listPrice: 6,
    solutionArea: 'Data & AI',
    solutionPlay: 'Adopt AI Safely',
  },
];

export const skuById = (id) => MICROSOFT_SKUS.find((s) => s.id === id);

/** What the customer already pays Microsoft — part of the current estate. */
export const MS_BUNDLES = [
  { id: 'none', name: 'No current Microsoft bundle', annualPerUser: 0 },
  { id: 'o365-e1', name: 'Office 365 E1', annualPerUser: 96 },
  { id: 'o365-e3', name: 'Office 365 E3', annualPerUser: 276 },
  { id: 'm365-f3', name: 'Microsoft 365 F3', annualPerUser: 96 },
  { id: 'm365-e3', name: 'Microsoft 365 E3', annualPerUser: 432 },
  { id: 'm365-bp', name: 'Microsoft 365 Business Premium', annualPerUser: 264 },
  { id: 'm365-e5', name: 'Microsoft 365 E5', annualPerUser: 684 },
];

export const bundleById = (id) => MS_BUNDLES.find((b) => b.id === id);

/** Software solution categories used when mapping a competitor product. */
export const SOFTWARE_SOLUTIONS = [
  'Endpoint protection',
  'Identity & access',
  'SIEM / SOC',
  'Email security',
  'Cloud security',
  'Data loss prevention',
  'Privileged access',
  'Network / SASE',
  'Vulnerability management',
];

/** Suggested Microsoft replacement per software solution, for the matrix view. */
export const COMPETITOR_MATRIX = [
  { solution: 'Endpoint protection', competitors: 'CrowdStrike, SentinelOne, Trellix', microsoft: 'Microsoft Defender for Endpoint P2' },
  { solution: 'Identity & access', competitors: 'Okta, Ping Identity, ForgeRock', microsoft: 'Microsoft Entra ID P2' },
  { solution: 'SIEM / SOC', competitors: 'Splunk, QRadar, Chronicle', microsoft: 'Microsoft Sentinel' },
  { solution: 'Email security', competitors: 'Proofpoint, Mimecast, Abnormal', microsoft: 'Microsoft Defender for Office 365 P2' },
  { solution: 'Cloud security', competitors: 'Wiz, Prisma Cloud, Orca', microsoft: 'Microsoft Defender for Cloud' },
  { solution: 'Data loss prevention', competitors: 'Symantec DLP, Forcepoint', microsoft: 'Microsoft Purview' },
  { solution: 'Privileged access', competitors: 'CyberArk, Delinea', microsoft: 'Microsoft Entra Suite' },
  { solution: 'Network / SASE', competitors: 'Zscaler, Netskope', microsoft: 'Microsoft Entra Internet Access' },
  { solution: 'Vulnerability management', competitors: 'Tenable, Qualys, Rapid7', microsoft: 'Microsoft Defender Vulnerability Management' },
];

/* --------------------------------- Currency -------------------------------- */

/* Bare symbols. Every figure inside one business case is in one currency, and the
   code is stated once per context — in the case band, on step 1's Currency field
   and in the report's assumptions — so repeating "US$" on every number is noise a
   reader has to look past. */
export const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  AUD: '$',
  CAD: '$',
};

/* The qualified forms, used only where disambiguation is genuinely required. */
export const CURRENCY_SYMBOLS_QUALIFIED = {
  USD: 'US$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'CA$',
};

/** Currencies that share the dollar sign, and so can collide with each other. */
const DOLLARS = new Set(['USD', 'AUD', 'CAD', 'NZD', 'SGD', 'HKD']);

export const currencySymbol = (code) => CURRENCY_SYMBOLS[code] || '$';

/**
 * The symbol to use for `code` given every currency visible alongside it.
 *
 * A lone dollar currency needs no qualifier; two of them side by side do. Pound
 * and euro never need one — they cannot be confused with anything. So a list of
 * USD, GBP and EUR cases renders $, £, € and stays quiet, while adding an
 * Australian case promotes only the dollar figures to US$ and A$.
 *
 * Derived from what is actually on screen rather than hard-coded, so it stays
 * correct as the data changes.
 */
export const currencySymbolFor = (code, codesInView = []) => {
  const dollars = new Set(codesInView.filter((c) => DOLLARS.has(c)));
  return dollars.size > 1 && DOLLARS.has(code)
    ? CURRENCY_SYMBOLS_QUALIFIED[code] || currencySymbol(code)
    : currencySymbol(code);
};
