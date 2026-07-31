/* ---------------------------------------------------------------------------
   Seeded cases for My Cases and Example Cases.

   Every case carries a complete input snapshot rather than a hard-coded ROI, and
   the list computes its headline figures through the same `buildBusinessCase`
   the report uses. A card therefore cannot claim a number the case would not
   actually produce when you open it.
   --------------------------------------------------------------------------- */

import { buildBusinessCase } from './model.js';
import { CURRENT_USER } from './session.js';

export const CASE_STATUS = {
  draft: { label: 'Draft', color: 'informative' },
  published: { label: 'Published', color: 'success' },
};

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
        bcbRole: 'customer-facing',
      },
      caseSetup: { name: 'Contoso FY27 Security Consolidation', analysisPeriod: 3 },
      outcomes: ['identity', 'threat', 'endpoint', 'consolidation'],
      skus: [
        { id: 'c1s1', skuId: 'm365-e5-security', solutionArea: 'Security', solutionPlay: 'Consolidate the Security Estate', pricePerMonth: '4', seats: seats(18000) },
        { id: 'c1s2', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '1.5', seats: seats(18000) },
        { id: 'c1s3', skuId: 'security-copilot', solutionArea: 'Security', solutionPlay: 'Adopt AI Safely', pricePerMonth: '0.8', seats: seats(18000) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '432', additionalValue: '200000' },
      competitors: {
        msrpDiscount: '',
        rows: [
          { id: 'c1r1', softwareSolution: 'Endpoint protection', currentProduct: 'CrowdStrike Falcon', competitorCost: '1350000', newMicrosoftProduct: 'Microsoft Defender for Endpoint P2', yearContractEnds: '2026' },
          { id: 'c1r2', softwareSolution: 'Identity & access', currentProduct: 'Okta Workforce Identity', competitorCost: '720000', newMicrosoftProduct: 'Microsoft Entra ID P2', yearContractEnds: '2026' },
          { id: 'c1r3', softwareSolution: 'SIEM / SOC', currentProduct: 'Splunk Enterprise Security', competitorCost: '980000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2027' },
          { id: 'c1r4', softwareSolution: 'Email security', currentProduct: 'Proofpoint Email Protection', competitorCost: '410000', newMicrosoftProduct: 'Microsoft Defender for Office 365 P2', yearContractEnds: '2026' },
        ],
      },
    },
  },
  {
    id: 'case-northwind',
    title: 'Northwind Traders — Endpoint Displacement',
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
      caseSetup: { name: 'Northwind Traders — Endpoint Displacement', analysisPeriod: 3 },
      outcomes: ['endpoint', 'threat'],
      skus: [
        { id: 'c2s1', skuId: 'defender-endpoint', solutionArea: 'Security', solutionPlay: 'Secure Devices and Endpoints', pricePerMonth: '3', seats: seats(9500) },
        { id: 'c2s2', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '1.2', seats: seats(9500) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '400', additionalValue: '' },
      competitors: {
        msrpDiscount: '15',
        rows: [
          { id: 'c2r1', softwareSolution: 'Endpoint protection', currentProduct: 'SentinelOne Singularity', competitorCost: '640000', newMicrosoftProduct: 'Microsoft Defender for Endpoint P2', yearContractEnds: '2026' },
          { id: 'c2r2', softwareSolution: 'SIEM / SOC', currentProduct: 'IBM QRadar', competitorCost: '520000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2026' },
        ],
      },
    },
  },
  {
    id: 'case-litware',
    title: 'Litware — Identity Consolidation',
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
      caseSetup: { name: 'Litware — Identity Consolidation', analysisPeriod: 4 },
      outcomes: ['identity', 'consolidation'],
      skus: [
        { id: 'c3s1', skuId: 'entra-p2', solutionArea: 'Security', solutionPlay: 'Secure Identities and Access', pricePerMonth: '2.5', seats: seats(24000, 4) },
        { id: 'c3s2', skuId: 'entra-suite', solutionArea: 'Security', solutionPlay: 'Secure Identities and Access', pricePerMonth: '0.8', seats: seats(24000, 4) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '420', additionalValue: '150000' },
      competitors: {
        msrpDiscount: '10',
        rows: [
          { id: 'c3r1', softwareSolution: 'Identity & access', currentProduct: 'Okta Workforce Identity', competitorCost: '1180000', newMicrosoftProduct: 'Microsoft Entra ID P2', yearContractEnds: '2026' },
          { id: 'c3r2', softwareSolution: 'Privileged access', currentProduct: 'CyberArk', competitorCost: '460000', newMicrosoftProduct: 'Microsoft Entra Suite', yearContractEnds: '2027' },
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
    title: 'Fabrikam — Full Security Estate Consolidation',
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
      caseSetup: { name: 'Fabrikam — Full Security Estate Consolidation', analysisPeriod: 3 },
      outcomes: ['identity', 'threat', 'endpoint', 'data', 'consolidation'],
      skus: [
        { id: 'e1s1', skuId: 'm365-e5-security', solutionArea: 'Security', solutionPlay: 'Consolidate the Security Estate', pricePerMonth: '3.5', seats: seats(42000) },
        { id: 'e1s2', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '1.2', seats: seats(42000) },
        { id: 'e1s3', skuId: 'purview', solutionArea: 'Security', solutionPlay: 'Safeguard and Govern Data', pricePerMonth: '1', seats: seats(42000) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '432', additionalValue: '400000' },
      competitors: {
        msrpDiscount: '20',
        rows: [
          { id: 'e1r1', softwareSolution: 'Endpoint protection', currentProduct: 'CrowdStrike Falcon', competitorCost: '2900000', newMicrosoftProduct: 'Microsoft Defender for Endpoint P2', yearContractEnds: '2026' },
          { id: 'e1r2', softwareSolution: 'Identity & access', currentProduct: 'Okta Workforce Identity', competitorCost: '1600000', newMicrosoftProduct: 'Microsoft Entra ID P2', yearContractEnds: '2026' },
          { id: 'e1r3', softwareSolution: 'SIEM / SOC', currentProduct: 'Splunk Enterprise Security', competitorCost: '2100000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2026' },
          { id: 'e1r4', softwareSolution: 'Data loss prevention', currentProduct: 'Symantec DLP', competitorCost: '780000', newMicrosoftProduct: 'Microsoft Purview', yearContractEnds: '2027' },
        ],
      },
    },
  },
  {
    id: 'ex-tailspin',
    title: 'Tailspin Toys — SOC Modernisation',
    customer: 'Tailspin Toys',
    industry: 'Retail & consumer goods',
    status: 'published',
    owner: 'Microsoft',
    modified: 'Curated example',
    modifiedOrder: 21,
    highlight:
      'A small estate and a single displacement — shows how tight a focused case can be',
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
      caseSetup: { name: 'Tailspin Toys — SOC Modernisation', analysisPeriod: 3 },
      outcomes: ['threat', 'ai-security'],
      skus: [
        { id: 'e2s1', skuId: 'sentinel', solutionArea: 'Security', solutionPlay: 'Modernize Security Operations', pricePerMonth: '2', seats: seats(3400) },
        { id: 'e2s2', skuId: 'security-copilot', solutionArea: 'Security', solutionPlay: 'Adopt AI Safely', pricePerMonth: '1', seats: seats(3400) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '400', additionalValue: '60000' },
      competitors: {
        msrpDiscount: '',
        rows: [
          { id: 'e2r1', softwareSolution: 'SIEM / SOC', currentProduct: 'Splunk Enterprise Security', competitorCost: '310000', newMicrosoftProduct: 'Microsoft Sentinel', yearContractEnds: '2026' },
        ],
      },
    },
  },
  {
    id: 'ex-woodgrove',
    title: 'Woodgrove Bank — Compliance-Driven Investment',
    customer: 'Woodgrove Bank',
    industry: 'Financial services',
    status: 'published',
    owner: 'Microsoft',
    modified: 'Curated example',
    modifiedOrder: 22,
    highlight:
      'The driver is regulatory, not cost — read it for how to carry a case that barely pays back',
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
      caseSetup: { name: 'Woodgrove Bank — Compliance-Driven Investment', analysisPeriod: 5 },
      outcomes: ['data', 'identity', 'consolidation'],
      skus: [
        { id: 'e3s1', skuId: 'purview', solutionArea: 'Security', solutionPlay: 'Safeguard Data and Compliance', pricePerMonth: '3', seats: seats(28000, 5) },
        { id: 'e3s2', skuId: 'entra-p2', solutionArea: 'Security', solutionPlay: 'Secure Identities and Access', pricePerMonth: '2', seats: seats(28000, 5) },
      ],
      bundle: { bundleId: 'm365-e3', annualPerUser: '432', additionalValue: '300000' },
      competitors: {
        msrpDiscount: '10',
        rows: [
          { id: 'e3r1', softwareSolution: 'Data loss prevention', currentProduct: 'Symantec DLP', competitorCost: '1450000', newMicrosoftProduct: 'Microsoft Purview', yearContractEnds: '2026' },
          { id: 'e3r2', softwareSolution: 'Identity & access', currentProduct: 'Ping Identity', competitorCost: '890000', newMicrosoftProduct: 'Microsoft Entra ID P2', yearContractEnds: '2027' },
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
