/* ---------------------------------------------------------------------------
   The two reference libraries: analyst studies and learning resources.

   Both pages used to be lists of blue links, and both suffered the same way: the
   thing that told entries apart was welded into a string with the thing they all
   shared. Nineteen studies opened with "TEI of Microsoft"; eight learning assets
   opened with "Security BCB". In each case the repeated words led and the
   distinguishing word landed wherever it happened to land.

   Held as fields instead, the shared part becomes a badge and the distinguishing
   part leads. Nothing here is invented — every entry is one of the assets that
   was on those pages, taken apart into the fields the title already carried.
   --------------------------------------------------------------------------- */

/* ------------------------------ Analyst studies --------------------------- */

/**
 * Format matters more than it looks. A seller walking into a customer meeting
 * wants the two-page infographic; a seller writing the business case wants the
 * full study behind it. On the old page both were a blue link reading "TEI of
 * Microsoft Entra" and "TEI of Microsoft Entra Infographic", distinguishable
 * only by the last word.
 */
export const STUDY_FORMATS = {
  study: { label: 'Full study', hint: 'The complete Total Economic Impact analysis' },
  infographic: { label: 'Infographic', hint: 'One-page summary, safe to hand to a customer' },
  'value-share': { label: 'Value share', hint: 'Presentation-ready value narrative' },
  spotlight: { label: 'Market spotlight', hint: 'Regional cut of the headline study' },
};

export const STUDY_AREAS = [
  { id: 'security', label: 'Security' },
  { id: 'm365', label: 'Microsoft 365' },
  { id: 'endpoint', label: 'Endpoint management' },
];

/**
 * Every study is a Forrester Total Economic Impact commission, so "TEI of
 * Microsoft" prefixed all twenty titles and told you nothing. The product leads
 * instead, and the methodology becomes a badge — the same correction the report
 * headings needed.
 */
export const ANALYST_STUDIES = [
  {
    id: 'tei-security-copilot',
    product: 'Microsoft Security Copilot',
    area: 'security',
    format: 'study',
    projected: true,
    covers: 'Projected impact of AI-assisted investigation on SOC throughput',
    featured: true,
  },
  {
    id: 'tei-security',
    product: 'Microsoft Security',
    area: 'security',
    format: 'study',
    covers: 'All the security products together, not one at a time',
  },
  {
    id: 'tei-security-info',
    product: 'Microsoft Security',
    area: 'security',
    format: 'infographic',
    covers: 'The Microsoft Security headline figures on one page',
  },
  {
    id: 'tei-entra',
    product: 'Microsoft Entra',
    area: 'security',
    format: 'study',
    covers: 'Identity and access management, conditional access and lifecycle',
  },
  {
    id: 'tei-entra-info',
    product: 'Microsoft Entra',
    area: 'security',
    format: 'infographic',
    covers: 'The identity figures on one page',
  },
  {
    id: 'tei-defender-xdr',
    product: 'Microsoft 365 Defender',
    area: 'security',
    format: 'study',
    covers: 'Correlated detection and response across endpoint, email and identity',
  },
  {
    id: 'tei-zero-trust',
    product: 'Microsoft Zero Trust Solutions',
    area: 'security',
    format: 'study',
    covers: 'Zero Trust as a programme, not a set of individual controls',
  },
  {
    id: 'tei-e5-compliance',
    product: 'Microsoft 365 E5 Compliance',
    area: 'security',
    format: 'study',
    covers: 'Information protection, data governance and insider risk',
  },
  {
    id: 'tei-azure-network',
    product: 'Microsoft Azure Network Security',
    area: 'security',
    format: 'study',
    covers: 'Firewall, web application firewall and DDoS protection in Azure',
  },
  {
    id: 'tei-defender-cloud',
    product: 'Microsoft Defender for Cloud',
    area: 'security',
    format: 'study',
    covers: 'Cloud workload protection and posture management',
    featured: true,
  },
  {
    id: 'tei-defender-cloud-info',
    product: 'Microsoft Defender for Cloud',
    area: 'security',
    format: 'infographic',
    covers: 'The cloud posture figures on one page',
  },
  {
    id: 'tei-sentinel',
    product: 'Microsoft Sentinel',
    area: 'security',
    format: 'study',
    covers: 'Cloud-native SIEM: ingestion, analytics and operations',
  },
  {
    id: 'tei-siem-xdr',
    product: 'Microsoft SIEM and XDR',
    area: 'security',
    format: 'study',
    covers: 'SIEM and XDR measured together, not separately',
  },
  {
    id: 'tei-m365-e3',
    product: 'Microsoft 365 E3',
    area: 'm365',
    format: 'study',
    covers: 'The productivity and security baseline most organizations are already on',
    featured: true,
  },
  {
    id: 'tei-m365-e3-info',
    product: 'Microsoft 365 E3',
    area: 'm365',
    format: 'infographic',
    covers: 'The E3 figures on one page',
  },
  {
    id: 'tei-m365-e3-value',
    product: 'Microsoft 365 E3',
    area: 'm365',
    format: 'value-share',
    covers: 'The E3 value narrative, built for presenting',
  },
  {
    id: 'tei-m365-e3-emerging',
    product: 'Microsoft 365 E3',
    area: 'm365',
    format: 'spotlight',
    covers: 'The E3 study cut for emerging markets',
  },
  {
    id: 'tei-m365-e5',
    product: 'Microsoft 365 E5',
    area: 'm365',
    format: 'study',
    covers: 'What E5 adds over E3 across security, compliance, voice and analytics',
    featured: true,
  },
  {
    id: 'tei-intune',
    product: 'Microsoft Intune and Intune Suite',
    area: 'endpoint',
    format: 'study',
    covers: 'Endpoint management, and what the Intune Suite add-ons contribute',
  },
];

/* ---------------------------- Learning resources -------------------------- */

/**
 * A guide reads differently from a video, and a seller with ten minutes before a
 * call wants to know which is which before they click. On the old page both were
 * a blue link and the only clue was whether the title ended in "Video".
 */
export const LEARNING_FORMATS = {
  guide: { label: 'Guide', hint: 'Written walkthrough, PDF' },
  video: { label: 'Video', hint: 'Recorded walkthrough' },
  'case-study': { label: 'Case study', hint: 'A worked example to follow along with' },
  training: { label: 'Training', hint: 'Enablement deck for one solution area' },
};

/**
 * All eight assets were prefixed "Security BCB". On a page inside the Security
 * BCB, that prefix is the one thing every entry has in common and so the one
 * thing that cannot distinguish them — it is dropped, and what is left leads.
 *
 * `start` marks the two the old page put in a Highlights band and then listed
 * again below. They earn the prominence; they do not need to appear twice.
 */
export const LEARNING_RESOURCES = [
  {
    id: 'user-guide',
    title: 'User guide',
    format: 'guide',
    start: true,
    published: 'May 2025',
    blurb: 'The whole tool, step by step',
  },
  {
    id: 'intro-video',
    title: 'Intro video',
    format: 'video',
    start: true,
    blurb: 'Build a business case end to end, narrated',
  },
  {
    id: 'training-case-study',
    title: 'Training case study',
    format: 'case-study',
    blurb: 'A customer scenario to build alongside',
  },
  /* Solution-area enablement. The topic leads because the topic is the only
     thing that varies across these five. */
  { id: 'training-threat', title: 'Threat', format: 'training', blurb: 'Detection and response cases: SIEM, XDR and the SOC argument' },
  { id: 'training-identity', title: 'Identity', format: 'training', blurb: 'Identity and access cases, and what displacing an IAM vendor is worth' },
  { id: 'training-mcd', title: 'MCD', format: 'training', blurb: 'Cloud defence cases: workload protection and posture' },
  { id: 'training-purview', title: 'Purview', format: 'training', blurb: 'Data security and compliance cases' },
  { id: 'training-copilot', title: 'Security Copilot', format: 'training', blurb: 'Making the AI productivity argument' },
];
