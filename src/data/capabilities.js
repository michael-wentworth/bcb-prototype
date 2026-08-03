/* ---------------------------------------------------------------------------
   The capability model.

   This is the source of truth for the whole tool. Licensing is demoted to a
   lookup: a bundle is nothing but a set of capabilities it grants, and the only
   questions it answers are "which capabilities does the customer own today" and
   "which does the future state add".

   Everything downstream — the delta, the competitor mapping, the displacement
   and the business value — is computed from capabilities, never from SKUs. That
   is the whole point of the change: a seller who names four bundles has already
   said everything the model needs, without inventorying a single product.
   --------------------------------------------------------------------------- */

export const SOLUTION_AREAS = [
  { id: 'intune', label: 'Intune', blurb: 'Device and application management' },
  { id: 'entra', label: 'Entra', blurb: 'Identity and network access' },
  { id: 'defender', label: 'Defender', blurb: 'Threat protection and security operations' },
  { id: 'purview', label: 'Purview', blurb: 'Data security, governance and compliance' },
  { id: 'ai', label: 'AI', blurb: 'Assistants for productivity and security' },
];

/**
 * Every capability the model knows about.
 *
 * `product` is the Microsoft product that delivers it — used for display and for
 * naming what the customer would buy, never for the arithmetic.
 *
 * `competitors` is the market equivalent. An empty list is what makes a
 * capability *strategic* rather than a consolidation play, so it is a meaningful
 * absence rather than missing data — see STRATEGIC below.
 */
export const CAPABILITIES = [
  /* ------------------------------- Intune -------------------------------- */
  { id: 'mdm', name: 'Mobile Device Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune',
    competitors: ['VMware Workspace ONE', 'Ivanti', 'Jamf', 'Cisco Meraki', 'ManageEngine'] },
  { id: 'mam', name: 'Mobile Application Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune',
    competitors: ['VMware Workspace ONE', 'Ivanti', 'ManageEngine'] },
  { id: 'desktop-mgmt', name: 'Desktop Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune',
    competitors: ['VMware Workspace ONE', 'Ivanti', 'ManageEngine'] },
  { id: 'epm', name: 'Endpoint Privilege Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Endpoint Privilege Management',
    competitors: ['BeyondTrust', 'CyberArk'] },
  { id: 'endpoint-analytics', name: 'Advanced Endpoint Analytics', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Advanced Analytics',
    competitors: ['Ivanti', 'Nexthink'] },
  { id: 'tunnel-mam', name: 'Tunnel for Mobile Application Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Tunnel for MAM',
    competitors: ['VMware Workspace ONE'] },
  { id: 'specialty-devices', name: 'Specialty Device Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Specialty Device Management',
    competitors: ['VMware Workspace ONE', 'Jamf'] },
  { id: 'enterprise-app-mgmt', name: 'Enterprise Application Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Enterprise Application Management',
    competitors: ['Ivanti', 'ManageEngine'] },
  { id: 'cloud-pki', name: 'Cloud PKI', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Cloud PKI',
    competitors: [] },
  { id: 'remote-help', name: 'Remote Help', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Remote Help',
    competitors: ['TeamViewer Tensor', 'AnyDesk Enterprise'] },

  /* -------------------------------- Entra -------------------------------- */
  { id: 'iam', name: 'Identity & Access Management', area: 'entra', group: 'Identity foundation', product: 'Microsoft Entra ID P1',
    competitors: ['Okta', 'Ping Identity', 'ForgeRock'] },
  { id: 'sso', name: 'Single Sign-On', area: 'entra', group: 'Identity foundation', product: 'Microsoft Entra ID P1',
    competitors: ['Okta', 'Ping Identity', 'ForgeRock'] },
  { id: 'mfa', name: 'Multi-Factor Authentication', area: 'entra', group: 'Identity foundation', product: 'Microsoft Entra ID P1',
    competitors: ['Okta', 'Duo', 'Ping Identity'] },

  { id: 'pim', name: 'Privileged Identity Management', area: 'entra', group: 'Advanced identity protection', product: 'Microsoft Entra ID P2',
    competitors: ['CyberArk', 'BeyondTrust'] },
  { id: 'risk-ca', name: 'Risk-Based Conditional Access', area: 'entra', group: 'Advanced identity protection', product: 'Microsoft Entra ID P2',
    competitors: ['Okta', 'Ping Identity'] },
  { id: 'adaptive-mfa', name: 'Adaptive MFA', area: 'entra', group: 'Advanced identity protection', product: 'Microsoft Entra ID P2',
    competitors: ['Okta', 'Duo'] },

  { id: 'id-governance', name: 'Identity Governance', area: 'entra', group: 'Governance', product: 'Microsoft Entra ID Governance',
    competitors: ['SailPoint', 'Saviynt'] },
  { id: 'lifecycle-workflows', name: 'Lifecycle Workflows', area: 'entra', group: 'Governance', product: 'Microsoft Entra ID Governance',
    competitors: ['SailPoint', 'Saviynt'] },

  { id: 'verifiable-credentials', name: 'Verifiable Credentials', area: 'entra', group: 'Modern identity', product: 'Microsoft Entra Verified ID',
    competitors: [] },
  { id: 'face-check', name: 'Face Check', area: 'entra', group: 'Modern identity', product: 'Microsoft Entra Verified ID',
    competitors: [] },
  { id: 'decentralized-identity', name: 'Decentralized Identity', area: 'entra', group: 'Modern identity', product: 'Microsoft Entra Verified ID',
    competitors: [] },

  { id: 'ztna', name: 'Zero Trust Network Access', area: 'entra', group: 'Secure access service edge', product: 'Microsoft Entra Private Access',
    competitors: ['Zscaler', 'Cloudflare Access', 'Cisco Umbrella'] },
  { id: 'swg', name: 'Secure Web Gateway', area: 'entra', group: 'Secure access service edge', product: 'Microsoft Entra Internet Access',
    competitors: ['Zscaler', 'Cisco Umbrella', 'Netskope'] },

  { id: 'ciam', name: 'Customer Identity & Access Management', area: 'entra', group: 'External identity', product: 'Microsoft Entra External ID',
    competitors: ['Okta', 'ForgeRock', 'Ping Identity'] },

  { id: 'identity-monitoring', name: 'Cloud-Based Identity Monitoring', area: 'entra', group: 'Identity threat detection', product: 'Microsoft Defender for Identity',
    competitors: ['CrowdStrike', 'Palo Alto Cortex'] },

  /* ------------------------------- Defender ------------------------------ */
  { id: 'siem', name: 'SIEM', area: 'defender', group: 'Security operations', product: 'Microsoft Sentinel',
    competitors: ['Splunk', 'IBM QRadar', 'Sumo Logic'] },
  { id: 'soar', name: 'SOAR', area: 'defender', group: 'Security operations', product: 'Microsoft Sentinel',
    competitors: ['Splunk', 'Palo Alto Cortex'] },
  { id: 'unified-secops', name: 'Unified Security Operations Platform', area: 'defender', group: 'Security operations', product: 'Microsoft Sentinel',
    competitors: ['Splunk', 'Palo Alto Cortex'] },

  { id: 'edr', name: 'Endpoint Detection & Response', area: 'defender', group: 'Endpoint security', product: 'Microsoft Defender for Endpoint',
    competitors: ['CrowdStrike', 'SentinelOne', 'Trend Micro', 'Palo Alto Cortex'] },
  { id: 'endpoint-platform', name: 'Endpoint Security Platform', area: 'defender', group: 'Endpoint security', product: 'Microsoft Defender for Endpoint',
    competitors: ['CrowdStrike', 'SentinelOne', 'Trend Micro'] },
  { id: 'vuln-mgmt', name: 'Risk-Based Vulnerability Management', area: 'defender', group: 'Endpoint security', product: 'Microsoft Defender Vulnerability Management',
    competitors: ['Tenable', 'Rapid7'] },

  { id: 'email-protection', name: 'Email Protection', area: 'defender', group: 'Email security', product: 'Microsoft Defender for Office 365',
    competitors: ['Proofpoint', 'Mimecast'] },
  { id: 'collab-protection', name: 'Collaboration Protection', area: 'defender', group: 'Email security', product: 'Microsoft Defender for Office 365',
    competitors: ['Proofpoint', 'Mimecast'] },
  { id: 'anti-phishing', name: 'Anti-Phishing Protection', area: 'defender', group: 'Email security', product: 'Microsoft Defender for Office 365',
    competitors: ['Proofpoint', 'Mimecast'] },

  { id: 'cwpp', name: 'Cloud Workload Protection Platform', area: 'defender', group: 'Cloud security', product: 'Microsoft Defender for Cloud',
    competitors: ['Wiz', 'Lacework', 'Palo Alto Cortex'] },
  { id: 'cspm', name: 'Cloud Security Posture Management', area: 'defender', group: 'Cloud security', product: 'Microsoft Defender for Cloud CSPM',
    competitors: ['Wiz', 'Lacework'] },

  { id: 'easm', name: 'External Attack Surface Management', area: 'defender', group: 'External exposure', product: 'Microsoft Defender EASM',
    competitors: ['Tenable', 'Rapid7'] },

  { id: 'casb', name: 'Cloud Access Security Broker', area: 'defender', group: 'SaaS security', product: 'Microsoft Defender for Cloud Apps',
    competitors: ['Netskope', 'Skyhigh Security'] },

  /* ------------------------------- Purview ------------------------------- */
  { id: 'insider-risk', name: 'Insider Risk Management', area: 'purview', group: 'Insider risk', product: 'Microsoft Purview Insider Risk Management',
    competitors: ['Proofpoint Insider Risk', 'Varonis'] },
  { id: 'comms-compliance', name: 'Communication Compliance', area: 'purview', group: 'Insider risk', product: 'Microsoft Purview Communication Compliance',
    competitors: ['Proofpoint Insider Risk', 'Relativity'] },
  { id: 'information-barriers', name: 'Information Barriers', area: 'purview', group: 'Insider risk', product: 'Microsoft Purview Information Barriers',
    competitors: [] },

  { id: 'information-protection', name: 'Information Protection', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Information Protection',
    competitors: ['Symantec DLP', 'Broadcom Information Protection', 'Varonis'] },
  { id: 'data-classification', name: 'Data Classification', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Information Protection',
    competitors: ['BigID', 'Varonis', 'Spirion'] },
  { id: 'dlp', name: 'Data Loss Prevention', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Data Loss Prevention',
    competitors: ['Symantec DLP', 'Forcepoint DLP'] },
  { id: 'message-encryption', name: 'Message Encryption', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Message Encryption',
    competitors: ['Broadcom Information Protection'] },

  { id: 'records-mgmt', name: 'Records Management', area: 'purview', group: 'Governance', product: 'Microsoft Purview Records Management',
    competitors: ['OneTrust', 'Exterro'] },
  { id: 'retention-mgmt', name: 'Retention Management', area: 'purview', group: 'Governance', product: 'Microsoft Purview Records Management',
    competitors: ['OneTrust', 'Exterro'] },
  { id: 'data-lifecycle', name: 'Data Lifecycle Management', area: 'purview', group: 'Governance', product: 'Microsoft Purview Data Lifecycle Management',
    competitors: ['OneTrust', 'BigID'] },

  { id: 'data-discovery', name: 'Data Discovery', area: 'purview', group: 'Data discovery', product: 'Microsoft Purview Data Map',
    competitors: ['BigID', 'Spirion', 'Varonis'] },
  { id: 'unified-catalog', name: 'Unified Catalog', area: 'purview', group: 'Data discovery', product: 'Microsoft Purview Unified Catalog',
    competitors: ['BigID'] },

  { id: 'ediscovery', name: 'eDiscovery', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview eDiscovery',
    competitors: ['Exterro', 'Relativity'] },
  { id: 'audit', name: 'Auditing', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview Audit',
    competitors: ['Exterro'] },
  { id: 'dsi', name: 'Data Security Investigations', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview Data Security Investigations',
    competitors: [] },
  { id: 'dspm', name: 'Data Security Posture Management', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview DSPM',
    competitors: [] },
  { id: 'pam', name: 'Privileged Access Management', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview Privileged Access Management',
    competitors: ['CyberArk', 'BeyondTrust'] },

  /* ---------------------------------- AI --------------------------------- */
  { id: 'productivity-ai', name: 'Personal AI Assistant', area: 'ai', group: 'Productivity AI', product: 'Microsoft 365 Copilot',
    competitors: ['ChatGPT Enterprise', 'Google Gemini for Workspace'] },
  { id: 'security-ai', name: 'Security AI Assistant', area: 'ai', group: 'Security AI', product: 'Microsoft Security Copilot',
    competitors: [] },
];

/**
 * Capabilities the model treats as strategic even where a competitor exists.
 *
 * The mechanical rule — no competitor mapped means net-new — gets the Verified
 * ID and DSPM cases right on its own. Security Copilot is the exception the
 * source model calls out by name: Charlotte AI and Cortex XSIAM AI exist, but
 * they are not products a customer displaces on a licensing renewal, so pricing
 * this as a consolidation play would overstate the saving. Market-equivalence is
 * a judgement, so it is written down rather than inferred.
 */
export const STRATEGIC = new Set([
  'security-ai',
  'verifiable-credentials',
  'face-check',
  'decentralized-identity',
  'dspm',
  'dsi',
  'information-barriers',
  'cloud-pki',
]);

export const capabilityById = (id) => CAPABILITIES.find((c) => c.id === id);
export const areaById = (id) => SOLUTION_AREAS.find((a) => a.id === id);

/* ------------------------------ the licensing layer ------------------------ */

const INTUNE_CORE = ['mdm', 'mam', 'desktop-mgmt'];
const INTUNE_SUITE = ['epm', 'endpoint-analytics', 'tunnel-mam', 'specialty-devices', 'enterprise-app-mgmt', 'cloud-pki', 'remote-help'];
const ENTRA_P1 = ['iam', 'sso', 'mfa'];
const ENTRA_P2 = ['pim', 'risk-ca', 'adaptive-mfa'];
const ENTRA_SUITE = ['id-governance', 'lifecycle-workflows', 'ztna', 'swg', 'verifiable-credentials', 'face-check', 'decentralized-identity'];
const DEFENDER_E5 = ['edr', 'endpoint-platform', 'vuln-mgmt', 'email-protection', 'collab-protection', 'anti-phishing', 'casb', 'identity-monitoring'];
const PURVIEW_E3 = ['information-protection', 'data-classification', 'records-mgmt', 'retention-mgmt', 'ediscovery', 'audit'];
const PURVIEW_E5 = ['dlp', 'message-encryption', 'insider-risk', 'comms-compliance', 'information-barriers', 'data-lifecycle', 'dsi', 'dspm', 'pam'];

/**
 * What a license grants, as capability ids.
 *
 * `kind: 'base'` entries are mutually exclusive - a customer sits on one base
 * bundle. `kind: 'addon'` entries stack on top, which is what makes "E3 plus the
 * Defender suite" expressible without inventing a bundle per combination.
 *
 * The base list is the full commercial ladder rather than the four bundles that
 * cover most deals: a seller whose customer is on Business Standard or F3 should
 * not have to pick the nearest thing and mentally adjust the delta.
 */
export const LICENSES = [
  /* --------------------------- Office 365 family -------------------------- */
  { id: 'o365-e1', name: 'Office 365 E1', kind: 'base', annualPerUser: 120,
    grants: ['retention-mgmt'] },
  { id: 'o365-e3', name: 'Office 365 E3', kind: 'base', annualPerUser: 276,
    grants: ['ediscovery', 'audit', 'retention-mgmt'] },
  { id: 'o365-e5', name: 'Office 365 E5', kind: 'base', annualPerUser: 456,
    grants: ['ediscovery', 'audit', 'retention-mgmt', 'records-mgmt', 'information-protection',
      'dlp', 'email-protection', 'collab-protection', 'anti-phishing', 'casb'] },

  /* -------------------------- Microsoft 365 family ------------------------ */
  { id: 'm365-f1', name: 'Microsoft 365 F1', kind: 'base', annualPerUser: 30,
    grants: [...ENTRA_P1] },
  { id: 'm365-f3', name: 'Microsoft 365 F3', kind: 'base', annualPerUser: 96,
    grants: [...INTUNE_CORE, ...ENTRA_P1, 'retention-mgmt'] },
  { id: 'm365-e3', name: 'Microsoft 365 E3', kind: 'base', annualPerUser: 432,
    grants: [...INTUNE_CORE, ...ENTRA_P1, ...PURVIEW_E3] },
  { id: 'm365-e5', name: 'Microsoft 365 E5', kind: 'base', annualPerUser: 684,
    grants: [...INTUNE_CORE, ...ENTRA_P1, ...ENTRA_P2, ...PURVIEW_E3, ...PURVIEW_E5, ...DEFENDER_E5] },

  /* ------------------------------- Business ------------------------------- */
  { id: 'bus-basic', name: 'Microsoft 365 Business Basic', kind: 'base', annualPerUser: 72,
    grants: [] },
  { id: 'bus-standard', name: 'Microsoft 365 Business Standard', kind: 'base', annualPerUser: 150,
    grants: [] },
  { id: 'bus-premium', name: 'Microsoft 365 Business Premium', kind: 'base', annualPerUser: 264,
    grants: [...INTUNE_CORE, ...ENTRA_P1, 'edr', 'email-protection', 'anti-phishing', 'information-protection'] },

  /* ------------------------------ no bundle ------------------------------- */
  { id: 'none', name: 'No Microsoft bundle', kind: 'base', annualPerUser: 0,
    grants: [] },

  /* -------------------------------- add-ons ------------------------------- */
  { id: 'e5-security', name: 'Microsoft 365 E5 Security', kind: 'addon', annualPerUser: 144,
    grants: [...ENTRA_P2, ...DEFENDER_E5] },
  { id: 'e5-compliance', name: 'Microsoft 365 E5 Compliance', kind: 'addon', annualPerUser: 144,
    grants: [...PURVIEW_E5, ...PURVIEW_E3] },
  { id: 'entra-suite', name: 'Microsoft Entra Suite', kind: 'addon', annualPerUser: 144,
    grants: [...ENTRA_P2, ...ENTRA_SUITE] },
  { id: 'intune-suite', name: 'Microsoft Intune Suite', kind: 'addon', annualPerUser: 120,
    grants: INTUNE_SUITE },
  { id: 'purview-suite', name: 'Microsoft Purview Suite', kind: 'addon', annualPerUser: 132,
    grants: [...PURVIEW_E5, 'data-discovery', 'unified-catalog'] },
  { id: 'sentinel', name: 'Microsoft Sentinel', kind: 'addon', annualPerUser: 96,
    grants: ['siem', 'soar', 'unified-secops'] },
  { id: 'defender-cloud', name: 'Microsoft Defender for Cloud', kind: 'addon', annualPerUser: 72,
    grants: ['cwpp', 'cspm', 'easm'] },
  { id: 'security-copilot', name: 'Microsoft Security Copilot', kind: 'addon', annualPerUser: 60,
    grants: ['security-ai'] },
  { id: 'm365-copilot', name: 'Microsoft 365 Copilot', kind: 'addon', annualPerUser: 360,
    grants: ['productivity-ai'] },
  { id: 'external-id', name: 'Microsoft Entra External ID', kind: 'addon', annualPerUser: 24,
    grants: ['ciam'] },
];

export const licenseById = (id) => LICENSES.find((l) => l.id === id);
export const BASE_LICENSES = LICENSES.filter((l) => l.kind === 'base');
export const ADDON_LICENSES = LICENSES.filter((l) => l.kind === 'addon');

export const LICENSING_PATHS = {
  none: [
    { id: 'none-m365e3', label: 'Start on Microsoft 365 E3', base: 'm365-e3', addons: [], note: 'The enterprise baseline.' },
    { id: 'none-m365e5', label: 'Start on Microsoft 365 E5', base: 'm365-e5', addons: [], note: 'Security and compliance included from day one.' },
    { id: 'none-bp', label: 'Start on Business Premium', base: 'bus-premium', addons: [], note: 'For an estate under 300 seats.' },
  ],
  'bus-basic': [
    { id: 'bb-bp', label: 'Business Basic to Business Premium', base: 'bus-premium', addons: [], note: 'Adds device management and endpoint protection.' },
    { id: 'bb-e3', label: 'Business Basic to Microsoft 365 E3', base: 'm365-e3', addons: [], note: 'The enterprise baseline as the estate grows.' },
  ],
  'bus-standard': [
    { id: 'bs-bp', label: 'Business Standard to Business Premium', base: 'bus-premium', addons: [], note: 'The security half Standard does not carry.' },
    { id: 'bs-e3', label: 'Business Standard to Microsoft 365 E3', base: 'm365-e3', addons: [], note: 'Moves the estate onto enterprise terms.' },
    { id: 'bs-e5', label: 'Business Standard to Microsoft 365 E5', base: 'm365-e5', addons: [], note: 'Straight to the full estate.' },
  ],
  'bus-premium': [
    { id: 'bp-m365e3', label: 'Business Premium to Microsoft 365 E3', base: 'm365-e3', addons: [], note: 'The enterprise baseline as the estate grows.' },
    { id: 'bp-m365e5', label: 'Business Premium to Microsoft 365 E5', base: 'm365-e5', addons: [], note: 'Straight to the full security and compliance estate.' },
  ],
  'm365-f1': [
    { id: 'f1-f3', label: 'Microsoft 365 F1 to F3', base: 'm365-f3', addons: [], note: 'Adds device management for frontline staff.' },
    { id: 'f1-e3', label: 'Microsoft 365 F1 to E3', base: 'm365-e3', addons: [], note: 'Moves frontline users onto the knowledge-worker bundle.' },
  ],
  'm365-f3': [
    { id: 'f3-e3', label: 'Microsoft 365 F3 to E3', base: 'm365-e3', addons: [], note: 'Adds the information protection layer.' },
    { id: 'f3-e5', label: 'Microsoft 365 F3 to E5', base: 'm365-e5', addons: [], note: 'The full jump for a frontline-heavy estate.' },
  ],
  'o365-e1': [
    { id: 'o1-o3', label: 'Office 365 E1 to E3', base: 'o365-e3', addons: [], note: 'Adds eDiscovery and audit.' },
    { id: 'o1-m3', label: 'Office 365 E1 to Microsoft 365 E3', base: 'm365-e3', addons: [], note: 'Adds device management and the identity floor.' },
  ],
  'o365-e3': [
    { id: 'o365e3-m365e3', label: 'Office 365 E3 to Microsoft 365 E3', base: 'm365-e3', addons: [], note: 'Adds device management and the identity floor.' },
    { id: 'o365e3-m365e5', label: 'Office 365 E3 to Microsoft 365 E5', base: 'm365-e5', addons: [], note: 'The full jump - identity, endpoint, email and compliance in one move.' },
    { id: 'o365e3-o365e5', label: 'Office 365 E3 to Office 365 E5', base: 'o365-e5', addons: [], note: 'Stays in Office 365 and adds the security and compliance layer.' },
  ],
  'o365-e5': [
    { id: 'o5-m5', label: 'Office 365 E5 to Microsoft 365 E5', base: 'm365-e5', addons: [], note: 'Adds device management and advanced identity.' },
    { id: 'o5-sentinel', label: 'Office 365 E5 plus Sentinel', base: 'o365-e5', addons: ['sentinel'], note: 'Security operations without changing the base.' },
  ],
  'm365-e3': [
    { id: 'e3-e5', label: 'Microsoft 365 E3 to Microsoft 365 E5', base: 'm365-e5', addons: [], note: 'The standard consolidation path.' },
    { id: 'e3-security', label: 'Microsoft 365 E3 plus E5 Security', base: 'm365-e3', addons: ['e5-security'], note: 'Security only, without the compliance half of E5.' },
    { id: 'e3-compliance', label: 'Microsoft 365 E3 plus E5 Compliance', base: 'm365-e3', addons: ['e5-compliance'], note: 'Compliance only, for a regulated estate.' },
    { id: 'e3-purview', label: 'Microsoft 365 E3 plus Purview Suite', base: 'm365-e3', addons: ['purview-suite'], note: 'Data security and governance, including discovery.' },
    { id: 'e3-entra', label: 'Microsoft 365 E3 plus Entra Suite', base: 'm365-e3', addons: ['entra-suite'], note: 'Identity governance and network access without changing the base.' },
    { id: 'e3-e5-copilot', label: 'Microsoft 365 E3 to E5 plus Security Copilot', base: 'm365-e5', addons: ['security-copilot'], note: 'The full estate with the SOC productivity layer.' },
  ],
  'm365-e5': [
    { id: 'e5-copilot', label: 'Microsoft 365 E5 plus Security Copilot', base: 'm365-e5', addons: ['security-copilot'], note: 'The SOC productivity layer on a complete estate.' },
    { id: 'e5-entra', label: 'Microsoft 365 E5 plus Entra Suite', base: 'm365-e5', addons: ['entra-suite'], note: 'Adds governance, ZTNA and secure web gateway.' },
    { id: 'e5-sentinel', label: 'Microsoft 365 E5 plus Sentinel', base: 'm365-e5', addons: ['sentinel'], note: 'Brings security operations onto the same platform.' },
    { id: 'e5-intune', label: 'Microsoft 365 E5 plus Intune Suite', base: 'm365-e5', addons: ['intune-suite'], note: 'The advanced endpoint management add-ons.' },
    { id: 'e5-cloud', label: 'Microsoft 365 E5 plus Defender for Cloud', base: 'm365-e5', addons: ['defender-cloud'], note: 'Extends protection to cloud workloads.' },
  ],
};

/** Only the paths that start from what the customer actually owns. */
export function pathsFor(currentBaseId) {
  return LICENSING_PATHS[currentBaseId] || [];
}

/* ------------------------------ the product layer -------------------------- */

/**
 * List price per user per year for each Microsoft product, keyed by name.
 *
 * Kept beside the products rather than inside CAPABILITIES because several
 * capabilities share one product — Intune delivers MDM, MAM and desktop
 * management, and it is billed once.
 */
const PRODUCT_PRICES = {
  'Microsoft Intune': 96,
  'Microsoft Intune Endpoint Privilege Management': 36,
  'Microsoft Intune Advanced Analytics': 36,
  'Microsoft Intune Tunnel for MAM': 24,
  'Microsoft Intune Specialty Device Management': 24,
  'Microsoft Intune Enterprise Application Management': 24,
  'Microsoft Intune Cloud PKI': 24,
  'Microsoft Intune Remote Help': 42,
  'Microsoft Entra ID P1': 72,
  'Microsoft Entra ID P2': 108,
  'Microsoft Entra ID Governance': 84,
  'Microsoft Entra Verified ID': 36,
  'Microsoft Entra Private Access': 60,
  'Microsoft Entra Internet Access': 60,
  'Microsoft Entra External ID': 24,
  'Microsoft Defender for Identity': 72,
  'Microsoft Sentinel': 96,
  'Microsoft Defender for Endpoint': 72,
  'Microsoft Defender Vulnerability Management': 24,
  'Microsoft Defender for Office 365': 60,
  'Microsoft Defender for Cloud': 60,
  'Microsoft Defender for Cloud CSPM': 36,
  'Microsoft Defender EASM': 36,
  'Microsoft Defender for Cloud Apps': 60,
  'Microsoft Purview Insider Risk Management': 72,
  'Microsoft Purview Communication Compliance': 48,
  'Microsoft Purview Information Barriers': 36,
  'Microsoft Purview Information Protection': 60,
  'Microsoft Purview Data Loss Prevention': 60,
  'Microsoft Purview Message Encryption': 24,
  'Microsoft Purview Records Management': 48,
  'Microsoft Purview Data Lifecycle Management': 48,
  'Microsoft Purview Data Map': 36,
  'Microsoft Purview Unified Catalog': 36,
  'Microsoft Purview eDiscovery': 48,
  'Microsoft Purview Audit': 24,
  'Microsoft Purview Data Security Investigations': 60,
  'Microsoft Purview DSPM': 60,
  'Microsoft Purview Privileged Access Management': 48,
  'Microsoft 365 Copilot': 360,
  'Microsoft Security Copilot': 60,
};

const slug = (name) =>
  name.toLowerCase().replace(/^microsoft /, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/**
 * Every individual Microsoft product, derived from the capability table rather
 * than listed twice.
 *
 * A seller who already knows they are quoting Entra ID Governance on its own
 * should not have to find a bundle that happens to contain it — so products are
 * selectable alongside licenses, and both resolve to capabilities the same way.
 */
export const MICROSOFT_PRODUCTS = (() => {
  const byName = new Map();
  CAPABILITIES.forEach((c) => {
    if (!byName.has(c.product)) {
      byName.set(c.product, {
        id: `prod:${slug(c.product)}`,
        name: c.product,
        kind: 'product',
        area: c.area,
        grants: [],
        annualPerUser: PRODUCT_PRICES[c.product] ?? 48,
      });
    }
    byName.get(c.product).grants.push(c.id);
  });
  return [...byName.values()];
})();

export const productById = (id) => MICROSOFT_PRODUCTS.find((p) => p.id === id);

/**
 * One lookup for anything that grants capabilities — a base bundle, an add-on
 * suite, or a single product. Everything downstream reads through this, so the
 * delta never has to care which kind of thing the seller picked.
 */
export const entitlementById = (id) => licenseById(id) || productById(id);

export const productsByArea = (areaId) => MICROSOFT_PRODUCTS.filter((p) => p.area === areaId);
