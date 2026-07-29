/* ---------------------------------------------------------------------------
   Reference data for the Security BCB forms.

   Field names and groupings follow the shipping product's Customer Details and
   SKU Selection screens so the prototype can be compared against it directly.
   Everything here is mock lookup data — there is no service behind it.
   --------------------------------------------------------------------------- */

/* ----------------------------- Workflow steps ------------------------------ */

export const STEPS = [
  { id: 'customer', label: 'Customer Details', caption: 'Who the case is for' },
  { id: 'sku', label: 'SKU Selection', caption: 'What is being sold and displaced' },
  { id: 'report', label: 'Customer Report', caption: 'The case you present' },
];

/* -------------------------- Customer Information --------------------------- */

export const INDUSTRIES = [
  'Manufacturing',
  'Financial Services',
  'Healthcare & Life Sciences',
  'Retail & Consumer Goods',
  'Energy & Resources',
  'Public Sector',
  'Professional Services',
  'Telecommunications',
  'Education',
  'Transportation & Logistics',
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
  'Small, Medium & Corporate',
  'Public Sector',
  'Education',
  'Small & Medium Business',
];

export const SALES_MOTIONS = [
  'New workload / greenfield',
  'Upsell to existing estate',
  'Competitive displacement',
  'Renewal / true-up',
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
  'None / not standardised',
];

export const SECURITY_STACK_CATEGORIES = [
  'Endpoint protection (EDR/EPP)',
  'Identity & access management',
  'SIEM / security analytics',
  'Email & collaboration security',
  'Cloud security posture (CSPM)',
  'Data loss prevention',
  'Privileged access management',
  'Network / SASE',
  'Vulnerability management',
  'Security awareness training',
];

/** Competitor products the seller can search for on Customer Details. */
export const COMPETITOR_CATALOG = [
  { name: 'CrowdStrike Falcon', category: 'Endpoint protection (EDR/EPP)' },
  { name: 'SentinelOne Singularity', category: 'Endpoint protection (EDR/EPP)' },
  { name: 'Okta Workforce Identity', category: 'Identity & access management' },
  { name: 'Ping Identity', category: 'Identity & access management' },
  { name: 'Splunk Enterprise Security', category: 'SIEM / security analytics' },
  { name: 'IBM QRadar', category: 'SIEM / security analytics' },
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
    label: 'Identity and Access Management Protection',
    detail:
      'Prevent unauthorized access and reduce identity-based breaches by enforcing Zero Trust principles.',
    implies: ['entra-p2'],
  },
  {
    id: 'threat',
    label: 'Threat Detection & Response (SOC/SIEM/XDR)',
    detail: 'Detect and respond to threats faster while improving SOC efficiency.',
    implies: ['defender-xdr', 'sentinel'],
  },
  {
    id: 'data',
    label: 'Data Security and Compliance',
    detail: 'Protect sensitive data and reduce risk of data leaks or compliance violations.',
    implies: ['purview'],
  },
  {
    id: 'endpoint',
    label: 'End Point and Device Security',
    detail: 'Reduce endpoint compromise and improve device visibility and control.',
    implies: ['defender-endpoint', 'intune'],
  },
  {
    id: 'cloud',
    label: 'Cloud & Application Security',
    detail: 'Secure cloud workloads and applications while reducing misconfiguration risk.',
    implies: ['defender-cloud'],
  },
  {
    id: 'ai-security',
    label: 'AI-Powered Security (Security Copilot)',
    detail:
      'Increase security team productivity and reduce time to detect and respond using AI.',
    implies: ['security-copilot'],
  },
  {
    id: 'consolidation',
    label: 'Reduce Cost and Vendor Consolidation',
    detail: 'Replace multiple tools and point solutions with a unified platform solution.',
    implies: ['m365-e5'],
  },
  {
    id: 'agents',
    label: 'Security and AI Agents Control Plane (Agent 365)',
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

/** Current Microsoft bundles, for "Build from a current bundle". */
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
  'Endpoint Protection',
  'Identity & Access',
  'SIEM / SOC',
  'Email Security',
  'Cloud Security',
  'Data Loss Prevention',
  'Privileged Access',
  'Network / SASE',
  'Vulnerability Management',
];

/** Suggested Microsoft replacement per software solution, for the matrix view. */
export const COMPETITOR_MATRIX = [
  { solution: 'Endpoint Protection', competitors: 'CrowdStrike, SentinelOne, Trellix', microsoft: 'Microsoft Defender for Endpoint P2' },
  { solution: 'Identity & Access', competitors: 'Okta, Ping Identity, ForgeRock', microsoft: 'Microsoft Entra ID P2' },
  { solution: 'SIEM / SOC', competitors: 'Splunk, QRadar, Chronicle', microsoft: 'Microsoft Sentinel' },
  { solution: 'Email Security', competitors: 'Proofpoint, Mimecast, Abnormal', microsoft: 'Microsoft Defender for Office 365 P2' },
  { solution: 'Cloud Security', competitors: 'Wiz, Prisma Cloud, Orca', microsoft: 'Microsoft Defender for Cloud' },
  { solution: 'Data Loss Prevention', competitors: 'Symantec DLP, Forcepoint', microsoft: 'Microsoft Purview' },
  { solution: 'Privileged Access', competitors: 'CyberArk, Delinea', microsoft: 'Microsoft Entra Suite' },
  { solution: 'Network / SASE', competitors: 'Zscaler, Netskope', microsoft: 'Microsoft Entra Internet Access' },
  { solution: 'Vulnerability Management', competitors: 'Tenable, Qualys, Rapid7', microsoft: 'Microsoft Defender Vulnerability Management' },
];

/* --------------------------------- Currency -------------------------------- */

export const CURRENCY_SYMBOLS = {
  USD: 'US$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  AUD: 'A$',
};

export const currencySymbol = (code) => CURRENCY_SYMBOLS[code] || 'US$';
