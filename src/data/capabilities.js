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
    competitors: ['VMware Workspace ONE', 'Ivanti Neurons for MDM', 'Jamf Pro', 'Cisco Meraki Systems Manager', 'ManageEngine Endpoint Central', 'IBM MaaS360', 'SOTI MobiControl', 'Citrix Endpoint Management', 'BlackBerry UEM', 'Scalefusion', 'Hexnode', 'Kandji', 'Addigy', 'Baramundi', 'Matrix42', 'Workspace ONE UEM'] },
  { id: 'mam', name: 'Mobile Application Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune',
    competitors: ['VMware Workspace ONE', 'Ivanti Neurons', 'ManageEngine Endpoint Central', 'IBM MaaS360', 'SOTI MobiControl', 'Citrix Endpoint Management', 'BlackBerry UEM', 'Hexnode', 'Scalefusion'] },
  { id: 'desktop-mgmt', name: 'Desktop Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune',
    competitors: ['VMware Workspace ONE', 'Ivanti Neurons', 'ManageEngine Endpoint Central', 'Tanium', 'BigFix', 'Quest KACE', 'PDQ Deploy', 'Baramundi', 'Matrix42', 'NinjaOne', 'Automox'] },
  { id: 'epm', name: 'Endpoint Privilege Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Endpoint Privilege Management',
    competitors: ['BeyondTrust Privilege Management', 'CyberArk Endpoint Privilege Manager', 'Delinea Privilege Manager', 'Admin By Request', 'AutoElevate', 'Netwrix PolicyPak', 'ThreatLocker'] },
  { id: 'endpoint-analytics', name: 'Advanced Endpoint Analytics', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Advanced Analytics',
    competitors: ['Nexthink', 'Ivanti Neurons for Digital Experience', '1E Tachyon', 'Lakeside SysTrack', 'ControlUp', 'Riverbed Aternity'] },
  { id: 'tunnel-mam', name: 'Tunnel for Mobile Application Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Tunnel for MAM',
    competitors: ['VMware Workspace ONE Tunnel', 'Ivanti Tunnel', 'Cisco AnyConnect', 'Zscaler Client Connector', 'NetMotion'] },
  { id: 'specialty-devices', name: 'Specialty Device Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Specialty Device Management',
    competitors: ['VMware Workspace ONE', 'Jamf Pro', 'SOTI MobiControl', 'Esper', 'Scalefusion', '42Gears SureMDM'] },
  { id: 'enterprise-app-mgmt', name: 'Enterprise Application Management', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Enterprise Application Management',
    competitors: ['Ivanti Application Control', 'ManageEngine Patch Manager', 'Flexera', 'Chocolatey for Business', 'PatchMyPC', 'Automox', 'NinjaOne'] },
  { id: 'cloud-pki', name: 'Cloud PKI', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Cloud PKI',
    competitors: ['Keyfactor', 'Venafi', 'DigiCert', 'Entrust', 'AppViewX', 'Sectigo', 'GlobalSign'] },
  { id: 'remote-help', name: 'Remote Help', area: 'intune', group: 'Endpoint management', product: 'Microsoft Intune Remote Help',
    competitors: ['TeamViewer Tensor', 'AnyDesk Enterprise', 'BeyondTrust Remote Support', 'Splashtop Enterprise', 'GoTo Resolve', 'ConnectWise ScreenConnect', 'RealVNC Connect', 'Zoho Assist'] },

  /* -------------------------------- Entra -------------------------------- */
  { id: 'iam', name: 'Identity & Access Management', area: 'entra', group: 'Identity foundation', product: 'Microsoft Entra ID P1',
    competitors: ['Okta Workforce Identity', 'Ping Identity', 'ForgeRock', 'OneLogin', 'IBM Security Verify', 'Oracle Identity Cloud', 'JumpCloud', 'CyberArk Identity', 'RSA SecurID', 'Thales SafeNet Trusted Access'] },
  { id: 'sso', name: 'Single Sign-On', area: 'entra', group: 'Identity foundation', product: 'Microsoft Entra ID P1',
    competitors: ['Okta Workforce Identity', 'Ping Identity', 'ForgeRock', 'OneLogin', 'IBM Security Verify', 'JumpCloud', 'CyberArk Identity', 'Google Cloud Identity'] },
  { id: 'mfa', name: 'Multi-Factor Authentication', area: 'entra', group: 'Identity foundation', product: 'Microsoft Entra ID P1',
    competitors: ['Duo Security', 'Okta Workforce Identity', 'Ping Identity', 'RSA SecurID', 'Thales SafeNet', 'Yubico', 'Silverfort', 'HYPR', 'OneLogin', 'IBM Security Verify'] },

  { id: 'pim', name: 'Privileged Identity Management', area: 'entra', group: 'Advanced identity protection', product: 'Microsoft Entra ID P2',
    competitors: ['CyberArk Privileged Access Manager', 'BeyondTrust Password Safe', 'Delinea Secret Server', 'One Identity Safeguard', 'Saviynt PAM', 'Senhasegura', 'HashiCorp Vault', 'Wallix Bastion', 'Arcon PAM'] },
  { id: 'risk-ca', name: 'Risk-Based Conditional Access', area: 'entra', group: 'Advanced identity protection', product: 'Microsoft Entra ID P2',
    competitors: ['Okta Adaptive MFA', 'Ping Identity', 'Duo Security', 'ForgeRock', 'Silverfort', 'SecureAuth', 'IBM Security Verify'] },
  { id: 'adaptive-mfa', name: 'Adaptive MFA', area: 'entra', group: 'Advanced identity protection', product: 'Microsoft Entra ID P2',
    competitors: ['Duo Security', 'Okta Adaptive MFA', 'Ping Identity', 'SecureAuth', 'Silverfort', 'RSA SecurID', 'HYPR'] },

  { id: 'id-governance', name: 'Identity Governance', area: 'entra', group: 'Governance', product: 'Microsoft Entra ID Governance',
    competitors: ['SailPoint IdentityIQ', 'SailPoint IdentityNow', 'Saviynt', 'One Identity Manager', 'Omada Identity', 'Oracle Identity Governance', 'IBM Verify Governance', 'Clear Skye', 'Zilla Security', 'Veza'] },
  { id: 'lifecycle-workflows', name: 'Lifecycle Workflows', area: 'entra', group: 'Governance', product: 'Microsoft Entra ID Governance',
    competitors: ['SailPoint', 'Saviynt', 'One Identity Manager', 'Omada Identity', 'Okta Lifecycle Management', 'BetterCloud', 'Zluri'] },

  { id: 'verifiable-credentials', name: 'Verifiable Credentials', area: 'entra', group: 'Modern identity', product: 'Microsoft Entra Verified ID',
    competitors: [] },
  { id: 'face-check', name: 'Face Check', area: 'entra', group: 'Modern identity', product: 'Microsoft Entra Verified ID',
    competitors: [] },
  { id: 'decentralized-identity', name: 'Decentralized Identity', area: 'entra', group: 'Modern identity', product: 'Microsoft Entra Verified ID',
    competitors: [] },

  { id: 'ztna', name: 'Zero Trust Network Access', area: 'entra', group: 'Secure access service edge', product: 'Microsoft Entra Private Access',
    competitors: ['Zscaler Private Access', 'Palo Alto Prisma Access', 'Cloudflare Access', 'Netskope Private Access', 'Cisco Duo Network Gateway', 'Appgate SDP', 'Twingate', 'Tailscale', 'Perimeter 81', 'Banyan Security'] },
  { id: 'swg', name: 'Secure Web Gateway', area: 'entra', group: 'Secure access service edge', product: 'Microsoft Entra Internet Access',
    competitors: ['Zscaler Internet Access', 'Netskope', 'Cisco Umbrella', 'Palo Alto Prisma Access', 'Forcepoint ONE', 'Menlo Security', 'iboss', 'Skyhigh Security', 'Cloudflare Gateway', 'Broadcom/Symantec Web Security'] },

  { id: 'ciam', name: 'Customer Identity & Access Management', area: 'entra', group: 'External identity', product: 'Microsoft Entra External ID',
    competitors: ['Okta Customer Identity (Auth0)', 'Ping Identity', 'ForgeRock', 'Amazon Cognito', 'Transmit Security', 'LoginRadius', 'Frontegg', 'Descope', 'Stytch'] },

  { id: 'identity-monitoring', name: 'Cloud-Based Identity Monitoring', area: 'entra', group: 'Identity threat detection', product: 'Microsoft Defender for Identity',
    competitors: ['CrowdStrike Falcon Identity Protection', 'Semperis', 'Silverfort', 'Quest Change Auditor', 'Varonis', 'SentinelOne Singularity Identity', 'Netwrix', 'Attivo Networks'] },

  /* ------------------------------- Defender ------------------------------ */
  { id: 'siem', name: 'SIEM', area: 'defender', group: 'Security operations', product: 'Microsoft Sentinel',
    competitors: ['Splunk Enterprise Security', 'IBM QRadar', 'Elastic Security', 'Sumo Logic', 'Exabeam', 'Securonix', 'LogRhythm', 'Devo', 'Google Chronicle', 'Palo Alto Cortex XSIAM', 'Rapid7 InsightIDR', 'Fortinet FortiSIEM', 'LevelBlue USM', 'Graylog'] },
  { id: 'soar', name: 'SOAR', area: 'defender', group: 'Security operations', product: 'Microsoft Sentinel',
    competitors: ['Splunk SOAR', 'Palo Alto Cortex XSOAR', 'Google Chronicle SOAR', 'Swimlane', 'Tines', 'Torq', 'IBM Resilient', 'Rapid7 InsightConnect', 'ServiceNow SecOps'] },
  { id: 'unified-secops', name: 'Unified Security Operations Platform', area: 'defender', group: 'Security operations', product: 'Microsoft Sentinel',
    competitors: ['Palo Alto Cortex XSIAM', 'Splunk Enterprise Security', 'Google SecOps', 'CrowdStrike Falcon Next-Gen SIEM', 'Exabeam', 'Securonix', 'Devo'] },

  { id: 'edr', name: 'Endpoint Detection & Response', area: 'defender', group: 'Endpoint security', product: 'Microsoft Defender for Endpoint',
    competitors: ['CrowdStrike Falcon', 'SentinelOne Singularity', 'Palo Alto Cortex XDR', 'Trend Micro Vision One', 'Sophos Intercept X', 'Trellix Endpoint', 'Cybereason', 'Bitdefender GravityZone', 'ESET PROTECT', 'Broadcom/Symantec Endpoint', 'Cisco Secure Endpoint', 'Deep Instinct', 'WithSecure', 'Elastic Security', 'Check Point Harmony Endpoint'] },
  { id: 'endpoint-platform', name: 'Endpoint Security Platform', area: 'defender', group: 'Endpoint security', product: 'Microsoft Defender for Endpoint',
    competitors: ['CrowdStrike Falcon', 'SentinelOne Singularity', 'Trend Micro Vision One', 'Sophos Intercept X', 'Trellix', 'Bitdefender GravityZone', 'ESET PROTECT', 'Check Point Harmony Endpoint', 'Cisco Secure Endpoint'] },
  { id: 'vuln-mgmt', name: 'Risk-Based Vulnerability Management', area: 'defender', group: 'Endpoint security', product: 'Microsoft Defender Vulnerability Management',
    competitors: ['Tenable Vulnerability Management', 'Rapid7 InsightVM', 'Qualys VMDR', 'Ivanti Neurons for RBVM', 'Greenbone', 'Wiz', 'Orca Security', 'Nucleus Security', 'Vulcan Cyber'] },

  { id: 'email-protection', name: 'Email Protection', area: 'defender', group: 'Email security', product: 'Microsoft Defender for Office 365',
    competitors: ['Proofpoint', 'Mimecast', 'Barracuda Email Protection', 'Abnormal Security', 'Cisco Secure Email', 'Trend Micro Email Security', 'Sophos Email', 'Fortinet FortiMail', 'Check Point Harmony Email', 'IRONSCALES', 'Egress Defend', 'Libraesva', 'Trustwave MailMarshal'] },
  { id: 'collab-protection', name: 'Collaboration Protection', area: 'defender', group: 'Email security', product: 'Microsoft Defender for Office 365',
    competitors: ['Proofpoint', 'Mimecast', 'Abnormal Security', 'Check Point Harmony Email & Collaboration', 'Avanan', 'Perception Point', 'SafeGuard Cyber'] },
  { id: 'anti-phishing', name: 'Anti-Phishing Protection', area: 'defender', group: 'Email security', product: 'Microsoft Defender for Office 365',
    competitors: ['Proofpoint', 'Mimecast', 'Abnormal Security', 'IRONSCALES', 'Cofense', 'KnowBe4 PhishER', 'Barracuda Sentinel', 'Egress Defend'] },

  { id: 'cwpp', name: 'Cloud Workload Protection Platform', area: 'defender', group: 'Cloud security', product: 'Microsoft Defender for Cloud',
    competitors: ['Wiz', 'Palo Alto Prisma Cloud', 'Orca Security', 'Lacework', 'CrowdStrike Falcon Cloud Security', 'Trend Micro Cloud One', 'Aqua Security', 'Sysdig Secure', 'Check Point CloudGuard', 'Tenable Cloud Security', 'Rapid7 InsightCloudSec', 'Uptycs'] },
  { id: 'cspm', name: 'Cloud Security Posture Management', area: 'defender', group: 'Cloud security', product: 'Microsoft Defender for Cloud CSPM',
    competitors: ['Wiz', 'Palo Alto Prisma Cloud', 'Orca Security', 'Lacework', 'Check Point CloudGuard', 'Tenable Cloud Security', 'Trend Micro Cloud One', 'Ermetic', 'Fugue', 'Rapid7 InsightCloudSec'] },

  { id: 'easm', name: 'External Attack Surface Management', area: 'defender', group: 'External exposure', product: 'Microsoft Defender EASM',
    competitors: ['Tenable Attack Surface Management', 'Palo Alto Cortex Xpanse', 'CyCognito', 'Censys', 'Bitsight', 'Rapid7 Surface Command', 'Detectify', 'IONIX', 'Group-IB'] },

  { id: 'casb', name: 'Cloud Access Security Broker', area: 'defender', group: 'SaaS security', product: 'Microsoft Defender for Cloud Apps',
    competitors: ['Netskope', 'Skyhigh Security', 'Palo Alto Prisma SaaS', 'Zscaler CASB', 'Forcepoint ONE', 'Cisco Cloudlock', 'Bitglass', 'Lookout CASB', 'Proofpoint CASB'] },

  /* ------------------------------- Purview ------------------------------- */
  { id: 'insider-risk', name: 'Insider Risk Management', area: 'purview', group: 'Insider risk', product: 'Microsoft Purview Insider Risk Management',
    competitors: ['Proofpoint Insider Threat Management', 'DTEX Systems', 'Teramind', 'Veriato', 'Forcepoint Insider Threat', 'Varonis', 'Code42 Incydr', 'Everfox', 'Gurucul'] },
  { id: 'comms-compliance', name: 'Communication Compliance', area: 'purview', group: 'Insider risk', product: 'Microsoft Purview Communication Compliance',
    competitors: ['Smarsh', 'Global Relay', 'Proofpoint Capture', 'Relativity Trace', 'Theta Lake', 'Shield', 'Behavox', 'Verint', 'NICE Actimize'] },
  { id: 'information-barriers', name: 'Information Barriers', area: 'purview', group: 'Insider risk', product: 'Microsoft Purview Information Barriers',
    competitors: ['Smarsh', 'Global Relay', 'Shield', 'Behavox'] },

  { id: 'information-protection', name: 'Information Protection', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Information Protection',
    competitors: ['Broadcom/Symantec Information Centric', 'Fortra Titus', 'Fortra Boldon James', 'Seclore', 'Virtru', 'NextLabs', 'Varonis', 'Janusnet', 'GigaTrust'] },
  { id: 'data-classification', name: 'Data Classification', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Information Protection',
    competitors: ['BigID', 'Varonis', 'Spirion', 'Fortra Titus', 'Fortra Boldon James', 'Securiti', 'OneTrust', 'Informatica', 'Collibra', 'Concentric AI'] },
  { id: 'dlp', name: 'Data Loss Prevention', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Data Loss Prevention',
    competitors: ['Broadcom/Symantec DLP', 'Forcepoint DLP', 'Trellix DLP', 'Digital Guardian', 'Netskope DLP', 'Zscaler DLP', 'Proofpoint DLP', 'GTB Technologies', 'Safetica', 'Endpoint Protector', 'Nightfall', 'Cyberhaven'] },
  { id: 'message-encryption', name: 'Message Encryption', area: 'purview', group: 'Data protection', product: 'Microsoft Purview Message Encryption',
    competitors: ['Zix', 'Virtru', 'Echoworx', 'Broadcom/Symantec', 'Cisco Secure Email Encryption', 'Egress Protect', 'Trend Micro Email Encryption'] },

  { id: 'records-mgmt', name: 'Records Management', area: 'purview', group: 'Governance', product: 'Microsoft Purview Records Management',
    competitors: ['OpenText', 'IBM FileNet', 'Veritas Enterprise Vault', 'Iron Mountain', 'Gimmal', 'RecordPoint', 'Zasio', 'Everteam', 'Hyland'] },
  { id: 'retention-mgmt', name: 'Retention Management', area: 'purview', group: 'Governance', product: 'Microsoft Purview Records Management',
    competitors: ['OpenText', 'Veritas Enterprise Vault', 'Smarsh', 'Global Relay', 'Proofpoint Archive', 'Mimecast Archive', 'Iron Mountain', 'Barracuda Archiver'] },
  { id: 'data-lifecycle', name: 'Data Lifecycle Management', area: 'purview', group: 'Governance', product: 'Microsoft Purview Data Lifecycle Management',
    competitors: ['OneTrust', 'BigID', 'Informatica', 'Collibra', 'Securiti', 'Varonis', 'Solix', 'Delphix'] },

  { id: 'data-discovery', name: 'Data Discovery', area: 'purview', group: 'Data discovery', product: 'Microsoft Purview Data Map',
    competitors: ['BigID', 'Collibra', 'Alation', 'Informatica', 'Atlan', 'Securiti', 'Varonis', 'Spirion', 'data.world', 'Concentric AI', 'Immuta'] },
  { id: 'unified-catalog', name: 'Unified Catalog', area: 'purview', group: 'Data discovery', product: 'Microsoft Purview Unified Catalog',
    competitors: ['Collibra', 'Alation', 'Atlan', 'Informatica', 'data.world', 'Select Star', 'Castor'] },

  { id: 'ediscovery', name: 'eDiscovery', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview eDiscovery',
    competitors: ['Relativity', 'Exterro', 'Nuix', 'Everlaw', 'DISCO', 'Logikcull', 'OpenText Recommind', 'Reveal', 'Consilio', 'Zapproved', 'Casepoint', 'Lighthouse'] },
  { id: 'audit', name: 'Auditing', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview Audit',
    competitors: ['Splunk', 'Netwrix Auditor', 'Quest Change Auditor', 'ManageEngine ADAudit Plus', 'LogRhythm', 'Varonis', 'Lepide'] },
  { id: 'dsi', name: 'Data Security Investigations', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview Data Security Investigations',
    competitors: ['Exterro', 'Nuix', 'Relativity', 'Varonis'] },
  { id: 'dspm', name: 'Data Security Posture Management', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview DSPM',
    competitors: ['BigID', 'Varonis', 'Securiti', 'Cyera', 'Sentra', 'Dig Security', 'Normalyze', 'Symmetry Systems'] },
  { id: 'pam', name: 'Privileged Access Management', area: 'purview', group: 'Investigation & compliance', product: 'Microsoft Purview Privileged Access Management',
    competitors: ['CyberArk', 'BeyondTrust', 'Delinea', 'One Identity Safeguard', 'Senhasegura', 'Wallix', 'Arcon', 'HashiCorp Vault'] },

  /* ---------------------------------- AI --------------------------------- */
  { id: 'productivity-ai', name: 'Personal AI Assistant', area: 'ai', group: 'Productivity AI', product: 'Microsoft 365 Copilot',
    competitors: ['ChatGPT Enterprise', 'Google Gemini for Workspace', 'Claude for Enterprise', 'Glean', 'Writer', 'Salesforce Einstein', 'Notion AI'] },
  { id: 'security-ai', name: 'Security AI Assistant', area: 'ai', group: 'Security AI', product: 'Microsoft Security Copilot',
    competitors: ['CrowdStrike Charlotte AI', 'Palo Alto Cortex XSIAM AI', 'Google Threat Intelligence AI', 'SentinelOne Purple AI', 'Dropzone AI'] },
  { id: 'agent-governance', name: 'AI Agent Governance', area: 'ai', group: 'Agent management', product: 'Agent 365',
    competitors: ['CrowdStrike', 'Zenity', 'Prompt Security', 'Lasso Security', 'Witness AI'] },
];

/**
 * Capabilities treated as strategic even though a competitor exists.
 *
 * The mechanical rule does the work now that the vendor lists are real: no
 * vendors means nothing to displace, which is why the three Verified ID
 * capabilities fall out as net-new without being named here.
 *
 * The two that are named are the AI assistants. Charlotte AI and Cortex XSIAM
 * AI exist, but they are not products a customer stops paying for on a
 * licensing renewal, so pricing them as a consolidation play would invent a
 * saving. Everything else - DSPM, data security investigations, information
 * barriers, cloud PKI - has a genuine vendor market and is displaceable.
 */
export const STRATEGIC = new Set(['security-ai', 'agent-governance']);

export const capabilityById = (id) => CAPABILITIES.find((c) => c.id === id);
export const areaById = (id) => SOLUTION_AREAS.find((a) => a.id === id);

/* ------------------------------- the catalogue ----------------------------- */

const INTUNE_CORE = ['mdm', 'mam', 'desktop-mgmt'];
const INTUNE_SUITE = ['epm', 'endpoint-analytics', 'tunnel-mam', 'specialty-devices', 'enterprise-app-mgmt', 'cloud-pki', 'remote-help'];
const ENTRA_P1 = ['iam', 'sso', 'mfa'];
const ENTRA_P2 = ['pim', 'risk-ca', 'adaptive-mfa'];
const ENTRA_SUITE = ['id-governance', 'lifecycle-workflows', 'ztna', 'swg', 'verifiable-credentials', 'face-check', 'decentralized-identity'];
const DEFENDER_SUITE = ['edr', 'endpoint-platform', 'vuln-mgmt', 'email-protection', 'collab-protection', 'anti-phishing', 'casb', 'identity-monitoring'];
const PURVIEW_E3 = ['information-protection', 'data-classification', 'records-mgmt', 'retention-mgmt', 'ediscovery', 'audit'];
const PURVIEW_SUITE = ['dlp', 'message-encryption', 'insider-risk', 'comms-compliance', 'information-barriers',
  'data-lifecycle', 'dsi', 'dspm', 'pam', 'data-discovery', 'unified-catalog'];

/**
 * Every orderable thing, in one list.
 *
 * There is no separate "license" and "product" tier. A SKU is a line on a quote
 * with a per-user-per-month price; a license is the same object once the
 * customer holds it. E5 and the Entra Suite differ only in how many capabilities
 * they grant, not in kind — modelling them as different sorts of thing produced
 * three concepts where the price list has one.
 *
 * `kind` is the one distinction that earns its place, and only because it is
 * behavioural: a base is mutually exclusive, an add-on stacks.
 *
 * `source` is not decoration. 'sheet' means the price came from the customer's
 * own price list; 'estimate' means it is mine and should not be quoted. The
 * previous version mixed the two silently and five products sat on a $48
 * fallback that looked exactly like data.
 */
export const SKUS = [
  /* ------------------------- priced from the sheet ------------------------ */
  { id: 'm365-e3', name: 'Microsoft 365 E3', kind: 'base', pupm: 39, source: 'sheet',
    grants: [...INTUNE_CORE, ...ENTRA_P1, ...PURVIEW_E3] },
  { id: 'm365-e5', name: 'Microsoft 365 E5', kind: 'base', pupm: 60, source: 'sheet',
    grants: [...INTUNE_CORE, ...ENTRA_P1, ...ENTRA_P2, ...PURVIEW_E3, ...PURVIEW_SUITE, ...DEFENDER_SUITE] },
  { id: 'bus-premium', name: 'Microsoft 365 Business Premium', kind: 'base', pupm: 22, source: 'sheet',
    grants: [...INTUNE_CORE, ...ENTRA_P1, 'edr', 'email-protection', 'anti-phishing', 'information-protection'] },

  { id: 'defender-suite', name: 'Microsoft Defender Suite', kind: 'addon', pupm: 12, source: 'sheet',
    grants: DEFENDER_SUITE },
  { id: 'purview-suite', name: 'Microsoft Purview Suite', kind: 'addon', pupm: 12, source: 'sheet',
    grants: PURVIEW_SUITE },
  { id: 'entra-suite', name: 'Microsoft Entra Suite', kind: 'addon', pupm: 12, source: 'sheet',
    grants: [...ENTRA_P2, ...ENTRA_SUITE] },
  { id: 'intune-suite', name: 'Microsoft Intune Suite', kind: 'addon', pupm: 10, source: 'sheet',
    grants: INTUNE_SUITE },
  { id: 'agent-365', name: 'Agent 365', kind: 'addon', pupm: 15, source: 'sheet',
    grants: ['agent-governance'] },

  /* Business Premium has its own priced bundles of the suites, and they only
     apply on that base — so they are constrained rather than offered to
     everyone the way the standalone suites are. */
  { id: 'bp-defender-purview', name: 'Defender and Purview Suites for Business Premium', kind: 'addon', pupm: 15, source: 'sheet',
    requiresBase: ['bus-premium'], grants: [...DEFENDER_SUITE, ...PURVIEW_SUITE] },
  { id: 'bp-purview', name: 'Purview Suite for Business Premium', kind: 'addon', pupm: 10, source: 'sheet',
    requiresBase: ['bus-premium'], grants: PURVIEW_SUITE },
  { id: 'bp-defender', name: 'Defender Suite for Business Premium', kind: 'addon', pupm: 10, source: 'sheet',
    requiresBase: ['bus-premium'], grants: DEFENDER_SUITE },

  /* ---------------------------- my estimates ------------------------------ */
  /* Kept so the current-state picker covers the whole ladder, but every price
     here is mine and is flagged in the UI. Replace before anything is quoted. */
  { id: 'o365-e1', name: 'Office 365 E1', kind: 'base', pupm: 10, source: 'estimate',
    grants: ['retention-mgmt'] },
  { id: 'o365-e3', name: 'Office 365 E3', kind: 'base', pupm: 23, source: 'estimate',
    grants: ['ediscovery', 'audit', 'retention-mgmt'] },
  { id: 'o365-e5', name: 'Office 365 E5', kind: 'base', pupm: 38, source: 'estimate',
    grants: ['ediscovery', 'audit', 'retention-mgmt', 'records-mgmt', 'information-protection',
      'dlp', 'email-protection', 'collab-protection', 'anti-phishing', 'casb'] },
  { id: 'm365-f1', name: 'Microsoft 365 F1', kind: 'base', pupm: 2.25, source: 'estimate',
    grants: [...ENTRA_P1] },
  { id: 'm365-f3', name: 'Microsoft 365 F3', kind: 'base', pupm: 8, source: 'estimate',
    grants: [...INTUNE_CORE, ...ENTRA_P1, 'retention-mgmt'] },
  { id: 'bus-basic', name: 'Microsoft 365 Business Basic', kind: 'base', pupm: 6, source: 'estimate',
    grants: [] },
  { id: 'bus-standard', name: 'Microsoft 365 Business Standard', kind: 'base', pupm: 12.5, source: 'estimate',
    grants: [] },

  /* EMS is how an Office 365 estate buys identity and device management without
     moving to a Microsoft 365 bundle, and four of the licensing paths start
     from it. Constrained to the Office 365 bases: on Microsoft 365 the same
     entitlements are already in the bundle, so offering it there would let a
     case pay twice for one capability. */
  { id: 'ems-e3', name: 'Enterprise Mobility + Security E3', kind: 'addon', pupm: 10.6, source: 'estimate',
    requiresBase: ['o365-e1', 'o365-e3', 'o365-e5'],
    grants: [...ENTRA_P1, ...INTUNE_CORE, 'information-protection'] },
  { id: 'ems-e5', name: 'Enterprise Mobility + Security E5', kind: 'addon', pupm: 16.4, source: 'estimate',
    requiresBase: ['o365-e1', 'o365-e3', 'o365-e5'],
    grants: [...ENTRA_P1, ...ENTRA_P2, ...INTUNE_CORE, 'information-protection', 'casb'] },

  /* These three are real products but are not billed per user — Sentinel by GB
     ingested, Defender for Cloud per resource, Security Copilot per SCU-hour.
     The per-user figure is a modelling convenience and says so. */
  { id: 'sentinel', name: 'Microsoft Sentinel', kind: 'addon', pupm: 8, source: 'estimate', notPerUser: 'Billed per GB ingested',
    grants: ['siem', 'soar', 'unified-secops'] },
  { id: 'defender-cloud', name: 'Microsoft Defender for Cloud', kind: 'addon', pupm: 6, source: 'estimate', notPerUser: 'Billed per protected resource',
    grants: ['cwpp', 'cspm', 'easm'] },
  { id: 'security-copilot', name: 'Microsoft Security Copilot', kind: 'addon', pupm: 5, source: 'estimate', notPerUser: 'Billed per SCU-hour',
    grants: ['security-ai'] },
  { id: 'm365-copilot', name: 'Microsoft 365 Copilot', kind: 'addon', pupm: 30, source: 'estimate',
    grants: ['productivity-ai'] },
  { id: 'external-id', name: 'Microsoft Entra External ID', kind: 'addon', pupm: 2, source: 'estimate', notPerUser: 'Billed per monthly active user',
    grants: ['ciam'] },
];

/* Annual per user, derived rather than stored twice. */
export const annualOf = (sku) => (sku ? sku.pupm * 12 : 0);

export const skuByIdCatalog = (id) => SKUS.find((x) => x.id === id);
export const entitlementById = skuByIdCatalog;
export const licenseById = skuByIdCatalog;
export const BASE_SKUS = SKUS.filter((x) => x.kind === 'base');
export const ADDON_SKUS = SKUS.filter((x) => x.kind === 'addon');

/**
 * What a customer can be on today — the six bundles sellers are actually asked
 * about, in the order they are asked.
 *
 * Deliberately not the whole SKU catalogue. The current state is one question
 * with a short answer, and the long list invited a seller to assemble an estate
 * nobody sells. "Others/None" is not an entry: an empty selection already says
 * unlicensed, and making someone click a tile to assert nothing is a question
 * the form can answer itself.
 *
 * `skus` is a list because one of the answers is two licenses. That is the only
 * reason the current state is modelled as a set rather than a single id.
 */
export const CURRENT_BUNDLES = [
  { id: 'm365-e5', name: 'Microsoft 365 E5', skus: ['m365-e5'] },
  { id: 'm365-e3', name: 'Microsoft 365 E3', skus: ['m365-e3'] },
  { id: 'o365-e5', name: 'Office 365 E5', skus: ['o365-e5'] },
  { id: 'o365-e3', name: 'Office 365 E3', skus: ['o365-e3'] },
  { id: 'o365-e1', name: 'Office 365 E1', skus: ['o365-e1'] },
  { id: 'o365-e3-ems-e3', name: 'Office 365 E3 + EMS E3', skus: ['o365-e3', 'ems-e3'] },
];

/** Add-ons available on a given base — some are sold only against one bundle. */
export const addonsFor = (baseId) =>
  ADDON_SKUS.filter((a) => !a.requiresBase || a.requiresBase.includes(baseId));

/* Back-compat aliases for the components that still import the old names. */
export const LICENSES = SKUS;
export const BASE_LICENSES = BASE_SKUS;
export const ADDON_LICENSES = ADDON_SKUS;

/**
 * Upgrade paths, as an explicit starting set and ending set.
 *
 * Keying on a single base could not express half of what is actually quoted:
 * "Office 365 E3 + EMS E3 to Office 365 E3 + EMS E3 + Purview Suite" has two
 * licenses on both sides of the arrow. A path now declares exactly what it
 * starts from and exactly what it ends at, and offers itself whenever the
 * customer owns everything in `from`. Anything they own beyond that carries
 * through to the future state rather than being silently dropped - which is
 * what lets a combination nobody enumerated still produce a sound case.
 */
export const NO_BASE = '__none__';

export const LICENSING_PATHS = [
  /* Nothing owned. These are starting points, not upgrades, so they match only
     when the current selection is empty. */
  { id: 'none-m365e3', label: 'Start on Microsoft 365 E3', from: [], to: ['m365-e3'], note: 'The enterprise baseline' },
  { id: 'none-m365e5', label: 'Start on Microsoft 365 E5', from: [], to: ['m365-e5'], note: 'Security and compliance from day one' },
  { id: 'none-bp', label: 'Start on Business Premium', from: [], to: ['bus-premium'], note: 'For an estate under 300 seats' },

  /* -------------------------- Business bundles -------------------------- */
  { id: 'bb-bp', label: 'Business Basic to Business Premium', from: ['bus-basic'], to: ['bus-premium'], note: 'Adds device management and endpoint protection' },
  { id: 'bb-e3', label: 'Business Basic to Microsoft 365 E3', from: ['bus-basic'], to: ['m365-e3'], note: 'The enterprise baseline as the estate grows' },

  { id: 'bs-bp', label: 'Business Standard to Business Premium', from: ['bus-standard'], to: ['bus-premium'], note: 'The security half Standard does not carry' },
  { id: 'bs-e3', label: 'Business Standard to Microsoft 365 E3', from: ['bus-standard'], to: ['m365-e3'], note: 'Moves the estate onto enterprise terms' },
  { id: 'bs-e5', label: 'Business Standard to Microsoft 365 E5', from: ['bus-standard'], to: ['m365-e5'], note: 'Straight to the full estate' },

  { id: 'bp-m365e3', label: 'Business Premium to Microsoft 365 E3', from: ['bus-premium'], to: ['m365-e3'], note: 'The enterprise baseline as the estate grows' },
  { id: 'bp-m365e5', label: 'Business Premium to Microsoft 365 E5', from: ['bus-premium'], to: ['m365-e5'], note: 'Straight to the full security and compliance estate' },
  { id: 'bp-def', label: 'Business Premium to Defender Suite for Business Premium', from: ['bus-premium'], to: ['bus-premium', 'bp-defender'], note: 'Threat protection without leaving the bundle' },
  { id: 'bp-pur', label: 'Business Premium to Purview Suite for Business Premium', from: ['bus-premium'], to: ['bus-premium', 'bp-purview'], note: 'Data security and governance without leaving the bundle' },
  { id: 'bp-defpur', label: 'Business Premium to Defender and Purview Suites for Business Premium', from: ['bus-premium'], to: ['bus-premium', 'bp-defender-purview'], note: 'Both suites, priced together' },

  /* ---------------------------- Frontline ------------------------------- */
  { id: 'f1-f3', label: 'Microsoft 365 F1 to F3', from: ['m365-f1'], to: ['m365-f3'], note: 'Adds device management for frontline staff' },
  { id: 'f1-e3', label: 'Microsoft 365 F1 to E3', from: ['m365-f1'], to: ['m365-e3'], note: 'Moves frontline users onto the knowledge-worker bundle' },
  { id: 'f3-e3', label: 'Microsoft 365 F3 to E3', from: ['m365-f3'], to: ['m365-e3'], note: 'Adds the information protection layer' },
  { id: 'f3-e5', label: 'Microsoft 365 F3 to E5', from: ['m365-f3'], to: ['m365-e5'], note: 'The full jump for a frontline-heavy estate' },

  /* ---------------------------- Office 365 ------------------------------ */
  { id: 'o1-o3', label: 'Office 365 E1 to E3', from: ['o365-e1'], to: ['o365-e3'], note: 'Adds eDiscovery and audit' },
  { id: 'o1-m3', label: 'Office 365 E1 to Microsoft 365 E3', from: ['o365-e1'], to: ['m365-e3'], note: 'Adds device management and the identity floor' },

  { id: 'o365e3-m365e3', label: 'Office 365 E3 to Microsoft 365 E3', from: ['o365-e3'], to: ['m365-e3'], note: 'Adds device management and the identity floor' },
  { id: 'o365e3-m365e5', label: 'Office 365 E3 to Microsoft 365 E5', from: ['o365-e3'], to: ['m365-e5'], note: 'Identity, endpoint, email and compliance in one move' },
  { id: 'o365e3-o365e5', label: 'Office 365 E3 to Office 365 E5', from: ['o365-e3'], to: ['o365-e5'], note: 'Adds the security and compliance layer inside Office 365' },
  { id: 'o365e3-m365e3-pur', label: 'Office 365 E3 to Microsoft 365 E3 + Microsoft Purview Suite', from: ['o365-e3'], to: ['m365-e3', 'purview-suite'], note: 'Device management and the full data governance layer' },
  { id: 'o365e3-m365e3-def', label: 'Office 365 E3 to Microsoft 365 E3 + Microsoft Defender Suite', from: ['o365-e3'], to: ['m365-e3', 'defender-suite'], note: 'Device management and the full threat protection layer' },

  /* Two licenses on both sides. These are the paths the single-base model could
     not represent at all. */
  { id: 'o3ems-pur', label: 'Office 365 E3 + EMS E3 to Office 365 E3 + EMS E3 + Microsoft Purview Suite', from: ['o365-e3', 'ems-e3'], to: ['o365-e3', 'ems-e3', 'purview-suite'], note: 'Keeps the base and adds data security and governance' },
  { id: 'o3ems-def', label: 'Office 365 E3 + EMS E3 to Office 365 E3 + EMS E3 + Microsoft Defender Suite', from: ['o365-e3', 'ems-e3'], to: ['o365-e3', 'ems-e3', 'defender-suite'], note: 'Keeps the base and adds threat protection' },

  { id: 'o5-m5', label: 'Office 365 E5 to Microsoft 365 E5', from: ['o365-e5'], to: ['m365-e5'], note: 'Adds device management and advanced identity' },
  { id: 'o5-sentinel', label: 'Office 365 E5 plus Sentinel', from: ['o365-e5'], to: ['o365-e5', 'sentinel'], note: 'Security operations without changing the base' },

  /* --------------------------- Microsoft 365 ---------------------------- */
  { id: 'e3-e5', label: 'Microsoft 365 E3 to Microsoft 365 E5', from: ['m365-e3'], to: ['m365-e5'], note: 'The standard consolidation path' },
  { id: 'e3-security', label: 'Microsoft 365 E3 plus Defender Suite', from: ['m365-e3'], to: ['m365-e3', 'defender-suite'], note: 'Security only, without the compliance half of E5' },
  { id: 'e3-purview', label: 'Microsoft 365 E3 plus Purview Suite', from: ['m365-e3'], to: ['m365-e3', 'purview-suite'], note: 'Data security and governance, including discovery' },
  { id: 'e3-entra', label: 'Microsoft 365 E3 plus Entra Suite', from: ['m365-e3'], to: ['m365-e3', 'entra-suite'], note: 'Identity governance and network access without changing the base' },
  { id: 'e3-e5-copilot', label: 'Microsoft 365 E3 to E5 plus Security Copilot', from: ['m365-e3'], to: ['m365-e5', 'security-copilot'], note: 'The full estate with the SOC productivity layer' },

  /* Already holding a suite. E5 contains it, so the move is a consolidation
     rather than an addition - and it only shows for customers who own both. */
  { id: 'e3def-e5', label: 'Microsoft 365 E3 + Microsoft Defender Suite to Microsoft 365 E5', from: ['m365-e3', 'defender-suite'], to: ['m365-e5'], note: 'Folds the suite into the bundle that already contains it' },
  { id: 'e3pur-e5', label: 'Microsoft 365 E3 + Microsoft Purview Suite to Microsoft 365 E5', from: ['m365-e3', 'purview-suite'], to: ['m365-e5'], note: 'Folds the suite into the bundle that already contains it' },

  { id: 'e5-copilot', label: 'Microsoft 365 E5 plus Security Copilot', from: ['m365-e5'], to: ['m365-e5', 'security-copilot'], note: 'The SOC productivity layer on a complete estate' },
  { id: 'e5-entra', label: 'Microsoft 365 E5 plus Entra Suite', from: ['m365-e5'], to: ['m365-e5', 'entra-suite'], note: 'Adds governance, ZTNA and secure web gateway' },
  { id: 'e5-sentinel', label: 'Microsoft 365 E5 plus Sentinel', from: ['m365-e5'], to: ['m365-e5', 'sentinel'], note: 'Brings security operations onto the same platform' },
  { id: 'e5-intune', label: 'Microsoft 365 E5 plus Intune Suite', from: ['m365-e5'], to: ['m365-e5', 'intune-suite'], note: 'The advanced endpoint management add-ons' },
  { id: 'e5-cloud', label: 'Microsoft 365 E5 plus Defender for Cloud', from: ['m365-e5'], to: ['m365-e5', 'defender-cloud'], note: 'Extends protection to cloud workloads' },
];

/**
 * The paths that apply to what the customer owns today.
 *
 * A path applies when they own everything in its `from`. Longest `from` first,
 * so "E3 + Defender Suite to E5" sits above plain "E3 to E5" for a customer
 * holding both - the more specific description of their estate is the more
 * useful one to read first.
 */
export function pathsFor(currentIds = []) {
  const owned = (currentIds || []).filter(Boolean);
  return LICENSING_PATHS.filter((p) =>
    owned.length === 0 ? p.from.length === 0 : p.from.length > 0 && p.from.every((id) => owned.includes(id)),
  ).sort((a, b) => b.from.length - a.from.length);
}

/**
 * The future state a path produces for this customer.
 *
 * Whatever the path ends at, plus anything they own that the path never
 * mentioned. A customer on Office 365 E3 + EMS E3 + Sentinel taking the Purview
 * path keeps Sentinel; without this the future state would quietly lose it and
 * the delta would report a capability loss that is not happening.
 */
export function futureOf(path, currentIds = []) {
  if (!path) return [];
  const untouched = (currentIds || []).filter(
    (id) => id && !path.from.includes(id) && !path.to.includes(id),
  );
  return [...path.to, ...untouched];
}
