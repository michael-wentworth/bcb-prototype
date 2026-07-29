/* ---------------------------------------------------------------------------
   The authoring model: creation modes, templates and authorship.

   The guiding rule is that AI is an accelerator, never a requirement. A case
   built from a prompt, from a template, or from nothing at all is the same
   Business Case with the same capabilities — the only difference is how much
   of it a person typed, which authorship tracking makes visible.

   This app is a four-stage workflow rather than a block editor, so "section"
   here means a stage section (customer profile, solutions, displacement) or an
   authored narrative section (executive summary, recommendations, risks).
   --------------------------------------------------------------------------- */

/* ------------------------------- Authorship -------------------------------- */

export const AUTHORSHIP = {
  AI: 'ai',
  ASSISTED: 'assisted',
  MANUAL: 'manual',
  EMPTY: 'empty',
};

export const AUTHORSHIP_META = {
  ai: {
    label: 'AI generated',
    description: 'Written by the copilot and not edited since.',
  },
  assisted: {
    label: 'AI assisted',
    description: 'A person and the copilot both worked on this.',
  },
  manual: {
    label: 'Manually authored',
    description: 'Written by a person. The copilot has not touched it.',
  },
  empty: {
    label: 'Not started',
    description: 'Nothing here yet.',
  },
};

/** Editing AI output makes it collaborative; editing your own work changes nothing. */
export function afterHumanEdit(current) {
  if (current === AUTHORSHIP.AI) return AUTHORSHIP.ASSISTED;
  if (current === AUTHORSHIP.EMPTY || !current) return AUTHORSHIP.MANUAL;
  return current;
}

/**
 * The copilot reworking its own draft leaves it AI-authored; reworking a
 * person's writing makes it collaborative. Generating into an empty section
 * makes it purely AI until someone touches it.
 */
export function afterAiAction(current, { fromScratch = false } = {}) {
  if (fromScratch) return AUTHORSHIP.AI;
  if (current === AUTHORSHIP.AI) return AUTHORSHIP.AI;
  return AUTHORSHIP.ASSISTED;
}

/* ------------------------------ Creation modes ----------------------------- */

export const CREATION_MODES = [
  {
    id: 'ai',
    label: 'Start with AI',
    tagline: 'Generate a draft using natural language',
    description:
      'Describe the opportunity and the copilot fills the profile, shortlists solutions, maps displacements and drafts the narrative. Everything it produces stays editable.',
    bestFor: 'First drafts · rapid creation · new users · time-constrained deals',
    icon: 'sparkle',
  },
  {
    id: 'template',
    label: 'Start from a template',
    tagline: 'Create from a predefined business case structure',
    description:
      'A ready-made outline for a common case type. You author the content; ask the copilot for help only on the sections where you want it.',
    bestFor: 'Repeatable motions · consistent structure across a team',
    icon: 'template',
  },
  {
    id: 'blank',
    label: 'Start blank',
    tagline: 'Create an empty business case and author it yourself',
    description:
      'No prompt and no AI step. Empty fields, an empty shortlist and empty narrative sections, the way you would start a Word document.',
    bestFor: 'Experienced users · sensitive content · cases built from external research',
    icon: 'blank',
  },
];

export const modeById = (id) => CREATION_MODES.find((m) => m.id === id) || CREATION_MODES[2];

/* -------------------------------- Templates -------------------------------- */

/**
 * Templates supply structure and prompts, never prose. Every narrative section
 * arrives empty so the author is not editing someone else's words.
 */
export const TEMPLATES = [
  {
    id: 'security',
    name: 'Security Investment',
    summary: 'Consolidate a fragmented security estate onto a Microsoft platform.',
    accent: 'brand',
    titleTemplate: 'Security Investment Business Case',
    narrative: ['summary', 'recommendations', 'risks'],
    focus: 'Vendor consolidation and security operations maturity.',
  },
  {
    id: 'cost',
    name: 'Cost Optimization',
    summary: 'Reduce run-rate spend across licensing, infrastructure and tooling.',
    accent: 'success',
    titleTemplate: 'Cost Optimization Business Case',
    narrative: ['summary', 'recommendations'],
    focus: 'Run-rate reduction and contract rationalisation.',
  },
  {
    id: 'compliance',
    name: 'Compliance Initiative',
    summary: 'Meet a regulatory obligation and evidence it to an auditor.',
    accent: 'warning',
    titleTemplate: 'Compliance Initiative Business Case',
    narrative: ['summary', 'risks', 'recommendations'],
    focus: 'Control coverage, evidence and risk of inaction.',
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Modernization',
    summary: 'Retire legacy estate and move workloads to a modern platform.',
    accent: 'informative',
    titleTemplate: 'Infrastructure Modernization Business Case',
    narrative: ['summary', 'risks', 'recommendations'],
    focus: 'Legacy retirement, migration sequencing and target architecture.',
  },
];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

/* --------------------------- Narrative sections ---------------------------- */

/**
 * The prose parts of the case. These are what a person writes when they are
 * not using AI at all, and what the copilot drafts when they are.
 */
export const NARRATIVE_SECTIONS = [
  {
    id: 'summary',
    label: 'Executive summary',
    lead: 'The paragraph a CFO reads first. Write it yourself, or have the copilot draft it from the analysis.',
    placeholder: 'Summarise the case in a paragraph…',
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    lead: 'What you want the customer to commit to, and when.',
    placeholder: 'What should the customer do next?',
  },
  {
    id: 'risks',
    label: 'Risk analysis',
    lead: 'What could go wrong and what you would do about it. A case with no stated risks reads as one nobody stress-tested.',
    placeholder: 'What are the risks, and how are they mitigated?',
  },
];

export const narrativeById = (id) => NARRATIVE_SECTIONS.find((s) => s.id === id);

/** Which workflow sections carry authorship, for the case-level summary. */
export const TRACKED_SECTIONS = [
  { id: 'profile', label: 'Customer profile' },
  { id: 'solutions', label: 'Solution shortlist' },
  { id: 'displacement', label: 'Competitive displacement' },
  { id: 'summary', label: 'Executive summary' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'risks', label: 'Risk analysis' },
];
