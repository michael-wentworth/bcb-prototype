/* ---------------------------------------------------------------------------
   Landing page content.

   Separated from the component so the page file is about layout and this file is
   about claims — the figures and quotes here are what a stakeholder will read
   most closely, and they should be editable without touching JSX.

   Figures and quotes are transcribed from the live Security BCB site. The
   superscripts map to SOURCES below, and they map by product: 1 is Defender, 2 is
   Entra, 3 is Purview — which is why "reduction in password reset requests" and
   "reduction in IAM engineering effort" both carry 2.
   --------------------------------------------------------------------------- */

export const SOURCES = [
  'The Total Economic Impact™ Of Microsoft Defender, a commissioned Forrester study.',
  'The Total Economic Impact™ Of Microsoft Entra, a commissioned Forrester study.',
  'The Total Economic Impact™ Of Microsoft Purview, a commissioned Forrester study.',
];

/**
 * The three business value pillars, as tabs.
 *
 * Two shapes, mirroring the live site: "Be more secure" carries four figures and
 * no customer quotes, the other two carry three figures alongside two quotes. The
 * layout handles both from the same component rather than being two designs.
 */
export const PILLARS = [
  {
    id: 'secure',
    label: 'Be more secure',
    lead: 'Reduce the likelihood of a data breach and ensure business continuity by improving risk management.',
    stats: [
      { value: '60%', label: 'Reduction in multicloud cybersecurity spend', source: 1 },
      { value: '75%', label: 'Reduced risk of exposure to breach costs from external attacks', source: 1 },
      {
        value: '30%',
        label:
          'Reduction in identity related risk exposure through conditional access and identity protection',
        source: 2,
      },
      { value: '80%', label: 'Reduction in incident response effort', source: 1 },
    ],
    quotes: [],
  },
  {
    id: 'tco',
    label: 'Lower total cost of ownership',
    lead: 'Reduce costs and improve operational efficiency of security and IT teams.',
    stats: [
      {
        value: '80%',
        label:
          'Reduction in IAM engineering effort by consolidating tools and automating identity workflows',
        source: 2,
      },
      { value: '60%', label: 'Reduction in multicloud cybersecurity spend', source: 1 },
      { value: '75%', label: 'Reduction in password reset requests', source: 2 },
    ],
    quotes: [
      {
        text: 'Consolidating with Microsoft Defender gives us broader visibility, better accountability, and transparency, [which] we were significantly missing earlier with the use of multiple different tools. Now it’s much more simplified, and because of that simplification, you are able to do more with less.',
        attribution: 'CISO, financial services',
        source: 1,
      },
      {
        text: 'We went from five engineers managing IAM (identity and access management) tools to just one. Microsoft Entra Suite unified our stack and freed up resources for higher-value work.',
        attribution: 'Chief financial officer and VP of strategy, technology',
        source: 2,
      },
    ],
  },
  {
    id: 'compliant',
    label: 'Stay compliant',
    lead: 'Secure and govern your organization’s data across your entire digital estate.',
    stats: [
      {
        value: '75%',
        label: 'Reduced time spent on data discovery, access and management with Microsoft Purview',
        source: 3,
      },
      {
        value: '15%',
        label:
          'Reduction in compliance and audit related costs through automated access reviews and reporting',
        source: 2,
      },
      {
        value: '30%',
        label:
          'Reduction in data security incidents avoiding regulatory fines and penalties due to compliance breaches',
        source: 3,
      },
    ],
    quotes: [
      {
        text: 'eDiscovery work previously took a total of 40 hours per week across legal, audit, and security teams. Now it takes 15 hours per week (a 63% reduction) … with a “single pane of glass” view of compliance.',
        attribution: 'VP of IT and cybersecurity, information services',
        source: 2,
      },
      {
        text: 'Before implementing Microsoft Purview, we didn’t have any idea how our sensitive information was used. We didn’t understand how it moved, or even what we needed to protect. Microsoft Purview helped us determine our DLP rules.',
        attribution: 'Global risk and compliance manager, food processing',
        source: 3,
      },
    ],
  },
];

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
