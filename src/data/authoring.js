/* ---------------------------------------------------------------------------
   The authoring model.

   AI is an accelerator, never a requirement. The workflow is completable end to
   end without touching the copilot: every field is typed directly, solutions
   and displacements can be added by hand, the narrative can be written from
   scratch, and no step is gated on having used the assistant.

   Authorship tracking is what keeps that honest — it records who actually wrote
   each part, so the copilot's contribution is visible without being assumed.
   --------------------------------------------------------------------------- */

/* ------------------------------- Authorship -------------------------------- */

export const AUTHORSHIP = {
  AI: 'ai',
  ASSISTED: 'assisted',
  MANUAL: 'manual',
  EMPTY: 'empty',
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

/* --------------------------- Narrative sections ---------------------------- */

/**
 * The prose parts of the case. These are what a person writes when they are not
 * using AI at all, and what the copilot drafts when they ask it to.
 */
export const NARRATIVE_SECTIONS = [
  {
    id: 'summary',
    label: 'Executive summary',
    lead: 'The paragraph a CFO reads first',
    placeholder: 'Summarise the case in a paragraph…',
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    lead: 'What you want the customer to commit to, and when',
    placeholder: 'What should the customer do next?',
  },
  {
    id: 'risks',
    label: 'Risk analysis',
    lead: 'What could go wrong and what you would do about it',
    placeholder: 'What are the risks, and how are they mitigated?',
  },
];

export const narrativeById = (id) => NARRATIVE_SECTIONS.find((s) => s.id === id);
