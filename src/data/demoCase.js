/* ---------------------------------------------------------------------------
   The scripted demo extraction.

   One sentence in, a filled case out. This is what the assistant produces from
   the Contoso prompt — it fills the same fields a seller would type, so nothing
   the copilot creates is in a place the seller cannot reach.
   --------------------------------------------------------------------------- */

/* What the copilot actually needs, in the order it needs it: the bundle the
   customer is on, the one they are moving to, and who they buy security from
   today. The prompt used to be a list of outcomes — vendor sprawl, security
   operations, SOC headcount — which read well but named nothing the capability
   model consumes, so the fill had to invent the licensing move behind it. */
export const DEMO_PROMPT =
  'Contoso has 18,000 employees on Microsoft 365 E3 and wants to move to E5. Today Contoso runs CrowdStrike Falcon for endpoint, Okta for identity and Proofpoint for email security.';

/** Field-level provenance, shown against each populated field. */
export const EXTRACTION_EVIDENCE = {
  /* Step 2's fields. The licensing move is stated outright in the prompt; the
     money behind it is not, and the badges say which is which — a negotiated
     rate is the one number here nobody can read off a record. */
  currentLicenses: {
    confidence: 'high',
    basis: 'Stated directly',
    evidence: '"…18,000 employees on Microsoft 365 E3…"',
  },
  futurePath: {
    confidence: 'high',
    basis: 'Stated directly',
    evidence: '"…wants to move to E5."',
  },
  rateByLicense: {
    confidence: 'low',
    basis: 'Estimated from comparable agreements',
    evidence: 'No negotiated rate exists in any record I can read',
  },
  capabilityContracts: {
    confidence: 'medium',
    basis: 'Products named by you, cost and end year inferred',
    evidence: 'Cost and end year estimated from install-base signal',
  },

  website: {
    confidence: 'medium',
    basis: 'Matched to account record',
    evidence: 'Primary domain on the Contoso Ltd. account in MSX',
  },
  bcbRole: {
    confidence: 'medium',
    basis: 'Inferred from stated goals',
    evidence: 'A vendor-consolidation conversation is normally taken to the customer',
  },
  bundleId: {
    confidence: 'high',
    basis: 'Stated directly',
    evidence: '"…on Microsoft 365 E3…"',
  },
  annualPerUser: {
    confidence: 'medium',
    basis: 'List price for the stated bundle',
    evidence: 'Microsoft 365 E3 at $432 per user per year',
  },
  additionalValue: {
    confidence: 'medium',
    basis: 'Stated as an expectation',
    evidence:
      '"…expected to carry around $200,000 a year in negotiated concessions." Expected, not signed',
  },
  accountName: { confidence: 'high', basis: 'Stated directly', evidence: '"Contoso has 18,000 employees…"' },
  opportunityId: {
    confidence: 'medium',
    basis: 'Matched to account record',
    evidence: 'Open security opportunity 7-3F56BL3EVL on the Contoso Ltd. account in MSX',
  },
  opportunityName: {
    confidence: 'medium',
    basis: 'Matched to account record',
    evidence: 'The open security opportunity on the Contoso Ltd. account in MSX',
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
    evidence: 'Discrete manufacturing in the MSX account taxonomy',
  },
  geography: {
    confidence: 'medium',
    basis: 'Inferred from account footprint',
    evidence: 'Headquarters and most seats in the United States',
  },
  segment: { confidence: 'medium', basis: 'Inferred from seat count', evidence: 'A seat count of 18,000 sits in the Enterprise band' },
  salesMotion: {
    confidence: 'medium',
    basis: 'Inferred from stated goals',
    evidence: '"…reduce vendor sprawl…" reads as a consolidation motion',
  },
  description: {
    confidence: 'medium',
    basis: 'Paraphrased and extended from stated goals',
    evidence: '"…reduce vendor sprawl, improve security operations, and give a stretched SOC team AI assistance…"',
  },
};

export const DEMO_EXTRACTION = {
  customer: {
    accountName: 'Contoso Ltd.',
    opportunityId: '7-3F56BL3EVL',
    opportunityName: 'Contoso Security Consolidation FY27',
    tpid: '4820517',
    industry: 'Manufacturing',
    geography: 'northam',
    segment: 'Enterprise',
    salesMotion: 'Consolidation',
    numberOfUsers: '18000',
    website: 'contoso.com',
    numberOfDevices: '',
    bcbRole: 'customer-facing',
    description:
      'Reduce vendor sprawl, consolidate security tooling onto one platform, and extend a stretched SOC with AI rather than headcount.',
  },

  /** Named from the opportunity, so "I filled the whole case in" is true. */
  caseSetup: { name: 'Contoso FY27 Security Consolidation' },

  outcomes: ['identity', 'threat', 'endpoint', 'ai-security', 'consolidation'],

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

  /* The capability half of the fill is not duplicated here. It is the saved
     Contoso case, read from caseLibrary at fill time — two hand-maintained
     copies of one customer is how the demo and the saved case drift apart. */

  /**
   * Contract end years gate every saving. These are staggered on purpose —
   * three lapse at the close of 2026 and Splunk a year later, so no benefit
   * lands in year one and the run rate climbs across the period.
   */
  competitors: [
    {
      // Named in the description, so this row is not an inference.
      stated: true,
      softwareSolution: 'Endpoint protection',
      currentProduct: 'CrowdStrike Falcon',
      competitorCost: '1350000',
      newMicrosoftProduct: 'Microsoft 365 E5 Security',
      yearContractEnds: '2026',
    },
    {
      stated: true,
      softwareSolution: 'Identity & access',
      currentProduct: 'Okta Workforce Identity',
      competitorCost: '720000',
      newMicrosoftProduct: 'Microsoft 365 E5 Security',
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
      newMicrosoftProduct: 'Microsoft 365 E5 Security',
      yearContractEnds: '2026',
    },
  ],
};
