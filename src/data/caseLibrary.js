/* ---------------------------------------------------------------------------
   Seeded cases for My Cases and Example Cases.

   Every case carries a complete input snapshot rather than a hard-coded ROI, and
   the list computes its headline figures through the same `buildBusinessCase`
   the report uses. A card therefore cannot claim a number the case would not
   actually produce when you open it.
   --------------------------------------------------------------------------- */

import { capabilitiesSoldBy } from './capabilityModel.js';
import { buildBusinessCase } from './model.js';
import { CURRENT_USER } from './session.js';

export const CASE_STATUS = {
  draft: { label: 'Draft', color: 'informative' },
  published: { label: 'Published', color: 'success' },
};

/* ---------------------------------------------------------------------------
   Capability-model inputs.

   Every case carries what the capability flow reads: the bundle the customer is
   on, the future state, the negotiated rate per license, and one contract per
   incumbent vendor. The old skus/bundle/competitors fields stay for the landing
   page, which still computes from the licensing model.

   Contracts derive their capabilities from the catalogue rather than listing
   them by hand, so a fixture cannot claim a vendor covers something the
   catalogue disagrees with. `sole` is the seller's confirmation that the
   customer does not use the vendor for a capability the future state does not
   deliver — without it the partial-cover rule refuses to count the contract.
   --------------------------------------------------------------------------- */
const contracts = (currentLicenses, futureLicenses, rows) =>
  rows.map(([id, vendor, annualCost, yearContractEnds, sole]) => ({
    id,
    vendor,
    annualCost,
    yearContractEnds,
    /* Everything the catalogue says the vendor covers, not only what this move
       displaces. Narrowing it made a contract that earns nothing look like one
       nobody had filled in — the model already filters to what it can price,
       and the full list is what explains why the rest earns nothing. */
    capabilityIds: capabilitiesSoldBy(vendor),
    soleUseConfirmed: !!sole,
  }));

/** Convenience: a 3-year snapshot with seats level across the horizon. */
const seats = (n, years = 3) => Array.from({ length: years }, () => String(n));

/* ------------------------------- My Cases ---------------------------------- */

export const MY_CASES = [
  {
    id: 'case-contoso',
    title: 'Contoso FY27 Security Consolidation',
    customer: 'Contoso Ltd.',
    industry: 'Manufacturing',
    status: 'draft',
    owner: CURRENT_USER,
    modified: '2 minutes ago',
    modifiedOrder: 0,
    shared: false,
    input: {
      customer: {
        accountName: 'Contoso Ltd.',
        opportunityId: '7-3F56BL3EVL',
        opportunityName: 'Contoso Security Consolidation FY27',
        industry: 'Manufacturing',
        geography: 'northam',
        segment: 'Enterprise',
        salesMotion: 'Consolidation',
        numberOfUsers: '18000',
        tpid: '4820517',
        website: 'contoso.com',
        bcbRole: 'customer-facing',
        description:
          'Reduce vendor sprawl, consolidate security tooling onto one platform, and extend a stretched SOC with AI rather than headcount.',
      },
      /* The plainest version of the move: E3 today, E5 tomorrow, one upgrade
         path and nothing bolted on. The rate is the negotiated one, not rate
         card — at 18,000 seats nobody pays list, and quoting list would sink a
         case that is sound.

         Splunk is deliberately not here. Without Sentinel the future state adds
         no SIEM, so there would be nothing for a SIEM contract to displace, and
         naming one would only produce a row worth nothing. */
      currentLicenses: ['m365-e3'],
      futureMode: 'path',
      futurePath: 'e3-e5',
      futureLicenses: ['m365-e5'],
      rateByLicense: { 'm365-e5': '43' },
      /* Okta is here deliberately and contributes nothing: E3 already grants
         Entra ID P1, so identity is retained rather than gained and there is no
         displacement to price. It is the case's own worked example of the model
         refusing a saving it cannot defend. */
      capabilityContracts: contracts(['m365-e3'], ['m365-e5'], [
        ['c1c1', 'CrowdStrike Falcon', '1350000', '2026'],
        ['c1c2', 'Okta Workforce Identity', '720000', '2026'],
        ['c1c3', 'Proofpoint', '410000', '2026'],
      ]),
      caseSetup: { name: 'Contoso FY27 Security Consolidation', analysisPeriod: 3 },
      outcomes: ['identity', 'threat', 'endpoint', 'ai-security', 'consolidation'],
      skus: [
        { id: 'c1s1', skuId: 'm365-e5-security', solutionArea: 'Security', solutionPlay: 'Consolidate the Security Estate', pricePerMonth: '4', seats: seats(18000) },
        { id: 'c1s2', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '1.5', seats: seats(18000) },
        { id: 'c1s3', skuId: 'security-copilot', solutionArea: 'Security', solutionPlay: 'Adopt AI Safely', pricePerMonth: '0.8', seats: seats(18000) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '432', additionalValue: '200000' },
      competitors: {
        rows: [
          { id: 'c1r1', softwareSolution: 'Endpoint protection', currentProduct: 'CrowdStrike Falcon', competitorCost: '1350000', newMicrosoftProduct: 'Microsoft 365 E5 Security', yearContractEnds: '2026' },
          { id: 'c1r2', softwareSolution: 'Identity & access', currentProduct: 'Okta Workforce Identity', competitorCost: '720000', newMicrosoftProduct: 'Microsoft 365 E5 Security', yearContractEnds: '2026' },
          { id: 'c1r3', softwareSolution: 'SIEM / SOC', currentProduct: 'Splunk Enterprise Security', competitorCost: '980000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2027' },
          { id: 'c1r4', softwareSolution: 'Email security', currentProduct: 'Proofpoint Email Protection', competitorCost: '410000', newMicrosoftProduct: 'Microsoft 365 E5 Security', yearContractEnds: '2026' },
        ],
      },
    },
  },
  {
    id: 'case-northwind',
    title: 'Northwind Traders Endpoint Displacement',
    customer: 'Northwind Traders',
    industry: 'Retail & consumer goods',
    status: 'draft',
    owner: CURRENT_USER,
    modified: 'Yesterday',
    modifiedOrder: 1,
    shared: false,
    input: {
      customer: {
        accountName: 'Northwind Traders',
        opportunityId: '7-9KD22XR1PQ',
        opportunityName: 'Northwind Endpoint Modernisation',
        industry: 'Retail & consumer goods',
        geography: 'uk',
        segment: 'Corporate',
        salesMotion: 'Competitive displacement',
        numberOfUsers: '9500',
        bcbRole: 'internal',
      },
      currentLicenses: ['m365-e3'],
      futureMode: 'products',
      futureLicenses: ['m365-e3', 'defender-suite', 'sentinel'],
      rateByLicense: { 'defender-suite': '3', sentinel: '1.2' },
      capabilityContracts: contracts(['m365-e3'], ['m365-e3', 'defender-suite', 'sentinel'], [
        ['c2c1', 'SentinelOne Singularity', '544000', '2026'],
        ['c2c2', 'IBM QRadar', '442000', '2026'],
      ]),
      caseSetup: { name: 'Northwind Traders Endpoint Displacement', analysisPeriod: 3 },
      outcomes: ['endpoint', 'threat'],
      skus: [
        { id: 'c2s1', skuId: 'defender-endpoint', solutionArea: 'Security', solutionPlay: 'Secure Devices and Endpoints', pricePerMonth: '3', seats: seats(9500) },
        { id: 'c2s2', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '1.2', seats: seats(9500) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '400', additionalValue: '' },
      competitors: {
        rows: [
          { id: 'c2r1', softwareSolution: 'Endpoint protection', currentProduct: 'SentinelOne Singularity', competitorCost: '544000', newMicrosoftProduct: 'Microsoft Defender for Endpoint P2', yearContractEnds: '2026' },
          { id: 'c2r2', softwareSolution: 'SIEM / SOC', currentProduct: 'IBM QRadar', competitorCost: '442000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2026' },
        ],
      },
    },
  },
  {
    id: 'case-litware',
    title: 'Litware Identity Consolidation',
    customer: 'Litware Inc.',
    industry: 'Energy & resources',
    status: 'published',
    owner: 'Dana Whitfield',
    modified: '6 days ago',
    modifiedOrder: 6,
    shared: true,
    input: {
      customer: {
        accountName: 'Litware Inc.',
        opportunityId: '7-2LM88BQ4ZT',
        opportunityName: 'Litware Zero Trust Identity',
        industry: 'Energy & resources',
        geography: 'weu',
        segment: 'Enterprise',
        salesMotion: 'Upsell to existing estate',
        numberOfUsers: '24000',
        bcbRole: 'customer-facing',
      },
      currentLicenses: ['m365-e3'],
      futureMode: 'path',
      futurePath: 'e3-entra',
      futureLicenses: ['m365-e3', 'entra-suite'],
      rateByLicense: { 'entra-suite': '2.5' },
      capabilityContracts: contracts(['m365-e3'], ['m365-e3', 'entra-suite'], [
        ['c3c1', 'Okta Lifecycle Management', '1062000', '2026'],
        ['c3c2', 'CyberArk Privileged Access Manager', '414000', '2027'],
      ]),
      caseSetup: { name: 'Litware Identity Consolidation', analysisPeriod: 4 },
      outcomes: ['identity', 'consolidation'],
      skus: [
        { id: 'c3s1', skuId: 'entra-p2', solutionArea: 'Security', solutionPlay: 'Secure Identities and Access', pricePerMonth: '2.5', seats: seats(24000, 4) },
        { id: 'c3s2', skuId: 'entra-suite', solutionArea: 'Security', solutionPlay: 'Secure Identities and Access', pricePerMonth: '0.8', seats: seats(24000, 4) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '420', additionalValue: '150000' },
      competitors: {
        rows: [
          { id: 'c3r1', softwareSolution: 'Identity & access', currentProduct: 'Okta Workforce Identity', competitorCost: '1062000', newMicrosoftProduct: 'Microsoft Entra ID P2', yearContractEnds: '2026' },
          { id: 'c3r2', softwareSolution: 'Privileged access', currentProduct: 'CyberArk', competitorCost: '414000', newMicrosoftProduct: 'Microsoft Entra Suite', yearContractEnds: '2027' },
        ],
      },
    },
  },
];

/* ----------------------------- Example Cases -------------------------------- */

/**
 * Curated cases published by Microsoft as exemplars. These are the strongest
 * onboarding asset in the product — a finished case teaches faster than a
 * tutorial — so they are a destination of their own and also fill the empty
 * state of My Cases.
 */
export const EXAMPLE_CASES = [
  {
    id: 'ex-fabrikam',
    title: 'Fabrikam Security Estate Consolidation',
    customer: 'Fabrikam Financial',
    industry: 'Financial services',
    status: 'published',
    owner: 'Microsoft',
    modified: 'Curated example',
    modifiedOrder: 20,
    highlight: 'Four vendors retired across a 42,000-seat estate',
    input: {
      customer: {
        accountName: 'Fabrikam Financial',
        industry: 'Financial services',
        geography: 'northam',
        segment: 'Enterprise',
        salesMotion: 'Consolidation',
        numberOfUsers: '42000',
        bcbRole: 'customer-facing',
      },
      currentLicenses: ['m365-e3'],
      futureMode: 'products',
      futureLicenses: ['m365-e5', 'sentinel', 'purview-suite'],
      rateByLicense: { 'm365-e5': '41', sentinel: '1.2', 'purview-suite': '2' },
      capabilityContracts: contracts(['m365-e3'], ['m365-e5', 'sentinel', 'purview-suite'], [
        ['e1c1', 'CrowdStrike Falcon', '2320000', '2026'],
        ['e1c2', 'Okta Workforce Identity', '1280000', '2026'],
        ['e1c3', 'Splunk Enterprise Security', '1680000', '2026'],
        ['e1c4', 'Broadcom/Symantec DLP', '624000', '2027'],
      ]),
      caseSetup: { name: 'Fabrikam Security Estate Consolidation', analysisPeriod: 3 },
      outcomes: ['identity', 'threat', 'endpoint', 'data', 'consolidation'],
      skus: [
        { id: 'e1s1', skuId: 'm365-e5-security', solutionArea: 'Security', solutionPlay: 'Consolidate the Security Estate', pricePerMonth: '3.5', seats: seats(42000) },
        { id: 'e1s2', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '1.2', seats: seats(42000) },
        { id: 'e1s3', skuId: 'purview', solutionArea: 'Security', solutionPlay: 'Safeguard Data and Compliance', pricePerMonth: '1', seats: seats(42000) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '432', additionalValue: '400000' },
      competitors: {
        rows: [
          { id: 'e1r1', softwareSolution: 'Endpoint protection', currentProduct: 'CrowdStrike Falcon', competitorCost: '2320000', newMicrosoftProduct: 'Microsoft 365 E5 Security', yearContractEnds: '2026' },
          { id: 'e1r2', softwareSolution: 'Identity & access', currentProduct: 'Okta Workforce Identity', competitorCost: '1280000', newMicrosoftProduct: 'Microsoft 365 E5 Security', yearContractEnds: '2026' },
          { id: 'e1r3', softwareSolution: 'SIEM / SOC', currentProduct: 'Splunk Enterprise Security', competitorCost: '1680000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2026' },
          { id: 'e1r4', softwareSolution: 'Data loss prevention', currentProduct: 'Symantec DLP', competitorCost: '624000', newMicrosoftProduct: 'Microsoft Purview', yearContractEnds: '2027' },
        ],
      },
    },
  },
  {
    id: 'ex-tailspin',
    title: 'Tailspin Toys SOC Modernisation',
    customer: 'Tailspin Toys',
    industry: 'Retail & consumer goods',
    status: 'published',
    owner: 'Microsoft',
    modified: 'Curated example',
    modifiedOrder: 21,
    highlight: 'A small estate and a single displacement',
    input: {
      customer: {
        accountName: 'Tailspin Toys',
        industry: 'Retail & consumer goods',
        geography: 'anz',
        segment: 'Corporate',
        salesMotion: 'New workload / greenfield',
        numberOfUsers: '3400',
        bcbRole: 'customer-facing',
      },
      currentLicenses: ['m365-e3'],
      futureMode: 'products',
      futureLicenses: ['m365-e3', 'sentinel', 'security-copilot'],
      rateByLicense: { sentinel: '2', 'security-copilot': '1.5' },
      capabilityContracts: contracts(['m365-e3'], ['m365-e3', 'sentinel', 'security-copilot'], [
        ['e2c1', 'Splunk Enterprise Security', '310000', '2026'],
      ]),
      caseSetup: { name: 'Tailspin Toys SOC Modernisation', analysisPeriod: 3 },
      outcomes: ['threat', 'ai-security'],
      skus: [
        { id: 'e2s1', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '2', seats: seats(3400) },
        { id: 'e2s2', skuId: 'security-copilot', solutionArea: 'Security', solutionPlay: 'Adopt AI Safely', pricePerMonth: '1', seats: seats(3400) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '400', additionalValue: '60000' },
      competitors: {
        rows: [
          { id: 'e2r1', softwareSolution: 'SIEM / SOC', currentProduct: 'Splunk Enterprise Security', competitorCost: '310000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2026' },
        ],
      },
    },
  },
  {
    id: 'ex-woodgrove',
    title: 'Woodgrove Bank Compliance-Driven Investment',
    customer: 'Woodgrove Bank',
    industry: 'Financial services',
    status: 'published',
    owner: 'Microsoft',
    modified: 'Curated example',
    modifiedOrder: 22,
    highlight: 'The driver is regulatory, not cost',
    input: {
      customer: {
        accountName: 'Woodgrove Bank',
        industry: 'Financial services',
        geography: 'uk',
        segment: 'Enterprise',
        salesMotion: 'Upsell to existing estate',
        numberOfUsers: '28000',
        bcbRole: 'internal',
      },
      currentLicenses: ['m365-e3'],
      futureMode: 'products',
      futureLicenses: ['m365-e3', 'purview-suite', 'entra-suite'],
      rateByLicense: { 'purview-suite': '2', 'entra-suite': '1.5' },
      /* Ping and Varonis both sell something this move does not deliver, so the
         partial-cover rule blocks them until someone confirms the customer does
         not use them for it. Confirmed here, which is what the checkbox on the
         contract card records. */
      capabilityContracts: contracts(['m365-e3'], ['m365-e3', 'purview-suite', 'entra-suite'], [
        ['e3c1', 'Broadcom/Symantec DLP', '1305000', '2026'],
        ['e3c2', 'Ping Identity', '801000', '2027', true],
        ['e3c3', 'Varonis', '700000', '2026', true],
      ]),
      caseSetup: { name: 'Woodgrove Bank Compliance-Driven Investment', analysisPeriod: 5 },
      outcomes: ['data', 'identity', 'consolidation'],
      skus: [
        { id: 'e3s1', skuId: 'purview', solutionArea: 'Security', solutionPlay: 'Safeguard Data and Compliance', pricePerMonth: '3', seats: seats(28000, 5) },
        { id: 'e3s2', skuId: 'entra-p2', solutionArea: 'Security', solutionPlay: 'Secure Identities and Access', pricePerMonth: '2', seats: seats(28000, 5) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '432', additionalValue: '300000' },
      competitors: {
        rows: [
          { id: 'e3r1', softwareSolution: 'Data loss prevention', currentProduct: 'Symantec DLP', competitorCost: '1305000', newMicrosoftProduct: 'Microsoft Purview', yearContractEnds: '2026' },
          { id: 'e3r2', softwareSolution: 'Identity & access', currentProduct: 'Ping Identity', competitorCost: '801000', newMicrosoftProduct: 'Microsoft Entra ID P2', yearContractEnds: '2027' },
        ],
      },
    },
  },
];

/** Headline figures for a card, computed the same way the report computes them. */
export function caseMetrics(entry) {
  const i = entry.input;
  return buildBusinessCase({
    analysisPeriod: i.caseSetup.analysisPeriod,
    numberOfUsers: i.customer.numberOfUsers,
    skus: i.skus,
    bundle: i.bundle,
    competitors: i.competitors,
  });
}

export const findCase = (id) =>
  MY_CASES.find((c) => c.id === id) || EXAMPLE_CASES.find((c) => c.id === id);
