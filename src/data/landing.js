/* ---------------------------------------------------------------------------
   Landing page content.

   Separated from the component so the page file is about layout and this file is
   about claims — the figures here are the ones a stakeholder will read most
   closely, and they should be editable without touching JSX.
   --------------------------------------------------------------------------- */

/** The three business value pillars, as tabs. Figures are Forrester TEI. */
export const PILLARS = [
  {
    id: 'secure',
    label: 'Be more secure',
    lead: 'Reduce the likelihood of a data breach and keep the business running by improving how risk is managed.',
    stats: [
      { value: '60%', label: 'Reduction in multicloud cybersecurity spend', kind: 'figure' },
      { value: '75%', label: 'Reduced risk of exposure to breach costs from external attacks', kind: 'ring' },
      {
        value: '30%',
        label: 'Reduction in identity-related risk exposure through conditional access and identity protection',
        kind: 'figure',
      },
      { value: '80%', label: 'Reduction in incident response effort', kind: 'ring' },
    ],
  },
  {
    id: 'tco',
    label: 'Lower total cost of ownership',
    lead: 'Retire overlapping third-party tools and consolidate onto licences the customer already owns.',
    stats: [
      { value: '4', label: 'Third-party security vendors typically displaced', kind: 'figure' },
      { value: '242%', label: 'Three-year return on investment', kind: 'ring' },
      { value: '£1.2M', label: 'Average annual licensing spend recovered', kind: 'figure' },
      { value: '55%', label: 'Reduction in security tooling administration effort', kind: 'ring' },
    ],
  },
  {
    id: 'compliant',
    label: 'Stay compliant',
    lead: 'Evidence controls once and reuse them across frameworks, instead of rebuilding the audit each time.',
    stats: [
      { value: '70%', label: 'Less effort preparing for a regulatory audit', kind: 'figure' },
      { value: '90%', label: 'Of controls evidenced from a single compliance dashboard', kind: 'ring' },
      { value: '3x', label: 'Faster response to a data subject access request', kind: 'figure' },
      { value: '45%', label: 'Reduction in cost of demonstrating continuous compliance', kind: 'ring' },
    ],
  },
];

export const METRICS_SOURCE =
  'All metrics are drawn from commissioned Forrester Total Economic Impact™ studies.';

/** What's new, newest first. `tag` drives the small label on each entry. */
export const UPDATES = [
  {
    period: 'July – August 2026',
    entries: [
      {
        tag: 'New',
        title: 'Customer report download restored',
        text: 'Download and export the finished ROI report for offline sharing and analysis.',
      },
      {
        tag: 'Feature',
        title: 'Competitor benchmarks',
        text: 'The executive summary now names the competitors in the deal, for sharper displacement insight.',
      },
      {
        tag: 'Security',
        title: 'Data centralised under SFI',
        text: 'All application data now complies with Secure Future Initiative standards.',
      },
    ],
  },
  {
    period: 'June 2026',
    entries: [
      {
        tag: 'Update',
        title: 'New Security BCB address',
        text: 'The upgraded URL is now available to partners on Transform.',
      },
      {
        tag: 'Security',
        title: 'MISE compliance updated',
        text: 'Stronger sign-in security and tighter prevention of unauthorised access.',
      },
    ],
  },
];
