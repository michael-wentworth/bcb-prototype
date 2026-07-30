/* ---------------------------------------------------------------------------
   The scripted demo extraction.

   One sentence in, a filled case out. This is what the assistant produces from
   the Contoso prompt — it fills the same fields a seller would type, so nothing
   the copilot creates is in a place the seller cannot reach.
   --------------------------------------------------------------------------- */

export const DEMO_PROMPT =
  'Contoso has 18,000 employees and currently uses Microsoft 365 E3, CrowdStrike and Okta. They want to reduce vendor sprawl and improve security operations.';

/** Field-level provenance, shown against each populated field. */
export const EXTRACTION_EVIDENCE = {
  accountName: { confidence: 'high', basis: 'Stated directly', evidence: '"Contoso has 18,000 employees…"' },
  opportunityId: {
    confidence: 'medium',
    basis: 'Matched to account record',
    evidence: 'Open security opportunity 7-3F56BL3EVL on the Contoso Ltd. account in MSX',
  },
  opportunityName: {
    confidence: 'medium',
    basis: 'Matched to account record',
    evidence: 'Name of the open security opportunity on the Contoso Ltd. account in MSX',
  },
  tpid: {
    confidence: 'high',
    basis: 'Matched to account record',
    evidence: 'Top parent ID for Contoso Ltd. in the MSX account taxonomy',
  },
  numberOfUsers: { confidence: 'high', basis: 'Stated directly', evidence: '"…has 18,000 employees…"' },
  industry: {
    confidence: 'high',
    basis: 'Matched to account record',
    evidence: 'Contoso Ltd. — discrete manufacturing, MSX account taxonomy',
  },
  geography: {
    confidence: 'medium',
    basis: 'Inferred from account footprint',
    evidence: 'Primary operations recorded across the US, Germany and the UK',
  },
  segment: { confidence: 'medium', basis: 'Inferred from seat count', evidence: 'A seat count of 18,000 sits in the Enterprise band' },
  salesMotion: {
    confidence: 'medium',
    basis: 'Inferred from stated goals',
    evidence: '"…reduce vendor sprawl…" reads as a consolidation motion',
  },
  description: {
    confidence: 'high',
    basis: 'Paraphrased from stated goals',
    evidence: '"…want to reduce vendor sprawl and improve security operations."',
  },
};

export const DEMO_EXTRACTION = {
  customer: {
    accountName: 'Contoso Ltd.',
    opportunityId: '7-3F56BL3EVL',
    opportunityName: 'Contoso Security Consolidation FY27',
    tpid: '1234567',
    industry: 'Manufacturing',
    geography: 'northam',
    segment: 'Enterprise',
    salesMotion: 'Consolidation',
    numberOfUsers: '18000',
    website: 'contoso.com',
    numberOfDevices: '',
    bcbRole: 'customer-facing',
    description:
      'Reduce vendor sprawl across the security estate and modernise security operations. Consolidate endpoint, identity and SIEM tooling onto a single platform to lower operational complexity.',
  },

  environment: {
    existingLicenses: ['Microsoft 365 E3'],
    securityStack: ['Endpoint protection (EDR/EPP)', 'Identity & access management'],
    competitorProducts: ['CrowdStrike Falcon', 'Okta Workforce Identity'],
  },

  outcomes: ['identity', 'threat', 'endpoint', 'consolidation'],

  /**
   * Shortlisted from the stated objectives and the existing E3 position.
   * Prices are negotiated per-user-per-month, not list — an enterprise at this
   * seat count does not pay rate card, and quoting list would overstate cost.
   */
  skus: [
    { skuId: 'm365-e5-security', solutionArea: 'Security', solutionPlay: 'Consolidate the Security Estate', pricePerMonth: '4' },
    { skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '1.5' },
    { skuId: 'security-copilot', solutionArea: 'Security', solutionPlay: 'Adopt AI Safely', pricePerMonth: '0.8' },
  ],

  /** The current bundle. Context for the spend comparison, not a saving. */
  bundle: { bundleId: 'm365-e3', annualPerUser: '432', additionalValue: '200000' },

  /**
   * Contract end years gate every saving. These are staggered on purpose —
   * CrowdStrike has already lapsed, the rest fall inside the horizon, so the
   * benefit builds across the period rather than landing on day one.
   */
  competitors: [
    {
      softwareSolution: 'Endpoint protection',
      currentProduct: 'CrowdStrike Falcon',
      competitorCost: '1350000',
      newMicrosoftProduct: 'Microsoft Defender for Endpoint P2',
      yearContractEnds: '2026',
    },
    {
      softwareSolution: 'Identity & access',
      currentProduct: 'Okta Workforce Identity',
      competitorCost: '720000',
      newMicrosoftProduct: 'Microsoft Entra ID P2',
      yearContractEnds: '2026',
    },
    {
      softwareSolution: 'SIEM / SOC',
      currentProduct: 'Splunk Enterprise Security',
      competitorCost: '980000',
      newMicrosoftProduct: 'Microsoft Sentinel',
      yearContractEnds: '2027',
    },
    {
      softwareSolution: 'Email security',
      currentProduct: 'Proofpoint Email Protection',
      competitorCost: '410000',
      newMicrosoftProduct: 'Microsoft Defender for Office 365 P2',
      yearContractEnds: '2026',
    },
  ],
};
