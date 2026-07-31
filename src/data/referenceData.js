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

/**
 * Microsoft product names a case can legitimately displace a competitor with.
 *
 * Only what the case actually buys — the SKUs on the recommended-solution table
 * — plus the components of any suite among them. A suite is the normal way this
 * happens: a customer buys Microsoft 365 E5 Security once, and its parts retire
 * four separate point products. Offering the whole catalogue instead let a
 * seller claim a displacement by a product the case never pays for.
 *
 * `current` is always included even when it is no longer available, so removing
 * a SKU never silently blanks a mapping that was already made — the seller sees
 * the stale value and can change it.
 */
export function displacementOptions(skuRows = [], current = '', solution = '') {
  // Exactly the SKUs on the recommended-solution table. Nothing else, because
  // every other product on this step carries a seat count and a price, and a
  // displacement naming something with no line item behind it is a claim the
  // investment side never paid for. Buying Microsoft 365 E5 Security is how a
  // customer retires an endpoint product — so E5 Security is what the row says.
  const names = new Set();
  const bought = [];
  (skuRows || []).forEach((row) => {
    const sku = MICROSOFT_SKUS.find((s) => s.id === row.skuId);
    if (!sku) return;
    names.add(sku.name);
    bought.push(sku);
  });
  if (current) names.add(current);

  // `includes` is not used to widen the list — only to work out which of the
  // SKUs already on the table answers this competitor's capability. A suite
  // serves a capability when one of its components does.
  const canonical = new Set(
    COMPETITOR_CATALOGUE.filter((c) => c.solution === solution).map((c) => c.microsoft),
  );
  const serves = (name) => {
    if (canonical.has(name)) return true;
    const sku = bought.find((s) => s.name === name);
    return (sku?.includes || []).some((id) => {
      const part = MICROSOFT_SKUS.find((s) => s.id === id);
      return part && canonical.has(part.name);
    });
  };

  const all = [...names].sort((a, b) => a.localeCompare(b));
  return {
    matched: solution ? all.filter(serves) : [],
    other: solution ? all.filter((n) => !serves(n)) : all,
    all,
  };
}

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
    includes: ['m365-e5-security', 'defender-xdr', 'defender-endpoint', 'defender-office', 'entra-p2', 'purview', 'intune'],
  },
  {
    id: 'm365-e5-security',
    name: 'Microsoft 365 E5 Security',
    listPrice: 12,
    solutionArea: 'Security',
    solutionPlay: 'Consolidate the Security Estate',
    includes: ['defender-xdr', 'defender-endpoint', 'defender-office', 'entra-p2'],
  },
  {
    id: 'defender-xdr',
    name: 'Microsoft Defender XDR',
    listPrice: 12,
    solutionArea: 'Security',
    solutionPlay: 'Modernize Security Operations',
    includes: ['defender-endpoint', 'defender-office'],
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
    includes: ['entra-p2'],
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

/**
 * Product-level competitor catalogue, behind the search box and the matrix
 * picker on the Competitive environment card.
 *
 * `annualCost` is an INDICATIVE list figure at MSRP for an estate of this size,
 * used to prefill a row so a seller starts from something rather than a blank
 * field. It is a prototype default, not a quoted price, and the seller is
 * expected to overwrite it with what the customer actually pays — the model
 * reads whatever ends up in the row, never this table.
 *
 * Naming competitors here is appropriate in a way it is not on the public
 * landing page: this is a seller working a specific deal and recording the
 * incumbent they are displacing, not Microsoft publishing a claim about a
 * rival's pricing.
 */
export const COMPETITOR_CATALOGUE = [
  { id: 'cp01', solution: 'Endpoint protection', product: 'CrowdStrike Falcon', annualCost: 1350000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp02', solution: 'Endpoint protection', product: 'SentinelOne Singularity', annualCost: 980000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp03', solution: 'Endpoint protection', product: 'Trellix Endpoint Security', annualCost: 640000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp04', solution: 'Endpoint protection', product: 'Sophos Intercept X', annualCost: 420000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp05', solution: 'Endpoint protection', product: 'Trend Micro Apex One', annualCost: 510000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp06', solution: 'Endpoint protection', product: 'Symantec Endpoint Protection', annualCost: 720000, licenseType: 'Perpetual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp07', solution: 'Endpoint protection', product: 'Cybereason Defense Platform', annualCost: 560000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp08', solution: 'Endpoint protection', product: 'VMware Carbon Black', annualCost: 480000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Endpoint P2' },
  { id: 'cp09', solution: 'Identity & access', product: 'Okta Workforce Identity', annualCost: 720000, licenseType: 'Annual', microsoft: 'Microsoft Entra ID P2' },
  { id: 'cp10', solution: 'Identity & access', product: 'Ping Identity PingOne', annualCost: 540000, licenseType: 'Annual', microsoft: 'Microsoft Entra ID P2' },
  { id: 'cp11', solution: 'Identity & access', product: 'ForgeRock Identity Platform', annualCost: 610000, licenseType: 'Annual', microsoft: 'Microsoft Entra ID P2' },
  { id: 'cp12', solution: 'Identity & access', product: 'OneLogin Workforce', annualCost: 290000, licenseType: 'Monthly', microsoft: 'Microsoft Entra ID P2' },
  { id: 'cp13', solution: 'Identity & access', product: 'Duo Security MFA', annualCost: 190000, licenseType: 'Monthly', microsoft: 'Microsoft Entra ID P2' },
  { id: 'cp14', solution: 'Identity & access', product: 'SailPoint IdentityNow', annualCost: 830000, licenseType: 'Annual', microsoft: 'Microsoft Entra ID P2' },
  { id: 'cp15', solution: 'Identity & access', product: 'IBM Security Verify', annualCost: 470000, licenseType: 'Annual', microsoft: 'Microsoft Entra ID P2' },
  { id: 'cp16', solution: 'SIEM / SOC', product: 'Splunk Enterprise Security', annualCost: 980000, licenseType: 'Annual', microsoft: 'Microsoft Sentinel' },
  { id: 'cp17', solution: 'SIEM / SOC', product: 'IBM QRadar SIEM', annualCost: 760000, licenseType: 'Annual', microsoft: 'Microsoft Sentinel' },
  { id: 'cp18', solution: 'SIEM / SOC', product: 'Google Chronicle SecOps', annualCost: 690000, licenseType: 'Annual', microsoft: 'Microsoft Sentinel' },
  { id: 'cp19', solution: 'SIEM / SOC', product: 'Sumo Logic Cloud SIEM', annualCost: 410000, licenseType: 'Monthly', microsoft: 'Microsoft Sentinel' },
  { id: 'cp20', solution: 'SIEM / SOC', product: 'Exabeam Fusion', annualCost: 580000, licenseType: 'Annual', microsoft: 'Microsoft Sentinel' },
  { id: 'cp21', solution: 'SIEM / SOC', product: 'LogRhythm Axon', annualCost: 440000, licenseType: 'Annual', microsoft: 'Microsoft Sentinel' },
  { id: 'cp22', solution: 'SIEM / SOC', product: 'Rapid7 InsightIDR', annualCost: 360000, licenseType: 'Annual', microsoft: 'Microsoft Sentinel' },
  { id: 'cp23', solution: 'SIEM / SOC', product: 'Securonix Unified Defense', annualCost: 520000, licenseType: 'Annual', microsoft: 'Microsoft Sentinel' },
  { id: 'cp24', solution: 'Email security', product: 'Proofpoint Email Protection', annualCost: 410000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Office 365 P2' },
  { id: 'cp25', solution: 'Email security', product: 'Mimecast Email Security', annualCost: 280000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Office 365 P2' },
  { id: 'cp26', solution: 'Email security', product: 'Abnormal Security', annualCost: 320000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Office 365 P2' },
  { id: 'cp27', solution: 'Email security', product: 'Barracuda Email Protection', annualCost: 150000, licenseType: 'Monthly', microsoft: 'Microsoft Defender for Office 365 P2' },
  { id: 'cp28', solution: 'Email security', product: 'Cisco Secure Email', annualCost: 240000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Office 365 P2' },
  { id: 'cp29', solution: 'Cloud security', product: 'Wiz CNAPP', annualCost: 890000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Cloud' },
  { id: 'cp30', solution: 'Cloud security', product: 'Palo Alto Prisma Cloud', annualCost: 760000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Cloud' },
  { id: 'cp31', solution: 'Cloud security', product: 'Orca Security', annualCost: 540000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Cloud' },
  { id: 'cp32', solution: 'Cloud security', product: 'Lacework Polygraph', annualCost: 470000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Cloud' },
  { id: 'cp33', solution: 'Cloud security', product: 'Aqua Security Platform', annualCost: 380000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Cloud' },
  { id: 'cp34', solution: 'Cloud security', product: 'Check Point CloudGuard', annualCost: 420000, licenseType: 'Annual', microsoft: 'Microsoft Defender for Cloud' },
  { id: 'cp35', solution: 'Data loss prevention', product: 'Symantec DLP', annualCost: 780000, licenseType: 'Perpetual', microsoft: 'Microsoft Purview' },
  { id: 'cp36', solution: 'Data loss prevention', product: 'Forcepoint DLP', annualCost: 520000, licenseType: 'Annual', microsoft: 'Microsoft Purview' },
  { id: 'cp37', solution: 'Data loss prevention', product: 'Digital Guardian', annualCost: 460000, licenseType: 'Annual', microsoft: 'Microsoft Purview' },
  { id: 'cp38', solution: 'Data loss prevention', product: 'Netskope DLP', annualCost: 390000, licenseType: 'Monthly', microsoft: 'Microsoft Purview' },
  { id: 'cp39', solution: 'Data loss prevention', product: 'Trellix DLP', annualCost: 340000, licenseType: 'Annual', microsoft: 'Microsoft Purview' },
  { id: 'cp40', solution: 'Privileged access', product: 'CyberArk Privilege Cloud', annualCost: 640000, licenseType: 'Annual', microsoft: 'Microsoft Entra Suite' },
  { id: 'cp41', solution: 'Privileged access', product: 'Delinea Secret Server', annualCost: 310000, licenseType: 'Annual', microsoft: 'Microsoft Entra Suite' },
  { id: 'cp42', solution: 'Privileged access', product: 'BeyondTrust Password Safe', annualCost: 380000, licenseType: 'Annual', microsoft: 'Microsoft Entra Suite' },
  { id: 'cp43', solution: 'Privileged access', product: 'One Identity Safeguard', annualCost: 290000, licenseType: 'Annual', microsoft: 'Microsoft Entra Suite' },
  { id: 'cp44', solution: 'Network / SASE', product: 'Zscaler Internet Access', annualCost: 950000, licenseType: 'Annual', microsoft: 'Microsoft Entra Internet Access' },
  { id: 'cp45', solution: 'Network / SASE', product: 'Netskope Intelligent SSE', annualCost: 720000, licenseType: 'Annual', microsoft: 'Microsoft Entra Internet Access' },
  { id: 'cp46', solution: 'Network / SASE', product: 'Palo Alto Prisma Access', annualCost: 810000, licenseType: 'Annual', microsoft: 'Microsoft Entra Internet Access' },
  { id: 'cp47', solution: 'Network / SASE', product: 'Cato Networks SASE', annualCost: 480000, licenseType: 'Monthly', microsoft: 'Microsoft Entra Internet Access' },
  { id: 'cp48', solution: 'Network / SASE', product: 'Cloudflare One', annualCost: 360000, licenseType: 'Monthly', microsoft: 'Microsoft Entra Internet Access' },
  { id: 'cp49', solution: 'Network / SASE', product: 'Fortinet FortiSASE', annualCost: 430000, licenseType: 'Annual', microsoft: 'Microsoft Entra Internet Access' },
  { id: 'cp50', solution: 'Vulnerability management', product: 'Tenable One', annualCost: 340000, licenseType: 'Annual', microsoft: 'Microsoft Defender Vulnerability Management' },
  { id: 'cp51', solution: 'Vulnerability management', product: 'Qualys VMDR', annualCost: 290000, licenseType: 'Annual', microsoft: 'Microsoft Defender Vulnerability Management' },
  { id: 'cp52', solution: 'Vulnerability management', product: 'Rapid7 InsightVM', annualCost: 260000, licenseType: 'Annual', microsoft: 'Microsoft Defender Vulnerability Management' },
  { id: 'cp53', solution: 'Vulnerability management', product: 'Tanium Risk', annualCost: 520000, licenseType: 'Annual', microsoft: 'Microsoft Defender Vulnerability Management' },
];

/** Distinct capabilities in the catalogue, in the order sellers meet them. */
export const CATALOGUE_CAPABILITIES = [...new Set(COMPETITOR_CATALOGUE.map((c) => c.solution))];

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
