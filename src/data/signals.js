/* ---------------------------------------------------------------------------
   Implicit feedback.

   The seller's job is building a business case, not training an assistant, so
   nothing in here asks them anything. Every signal is a by-product of work they
   were doing anyway: a field they corrected, a recommendation they dropped, a
   mapping they rewired, a report they shared.

   That is the whole argument for this shape over thumbs-up/thumbs-down. A rating
   tells you someone was unhappy; a correction tells you the right answer. When
   the copilot says Manufacturing and the seller says Technology, the second
   value is ground truth and the pair is worth more than any number of stars.

   Signals are recorded, never acted on here. Nothing in this prototype sends
   them anywhere, and the copy in the UI is careful not to imply that a specific
   customer's data trains anything.
   --------------------------------------------------------------------------- */

export const SIGNALS = {
  /* Corrections — the highest-value signal, because it carries the right answer
     alongside the wrong one. */
  FIELD_CORRECTED: 'field-corrected',

  /* What the copilot proposed and what survived contact with the seller. */
  RECOMMENDATION_ACCEPTED: 'recommendation-accepted',
  RECOMMENDATION_REMOVED: 'recommendation-removed',

  /* Competitor-to-capability mappings: kept, rewired, or thrown out. */
  MAPPING_ACCEPTED: 'mapping-accepted',
  MAPPING_CHANGED: 'mapping-changed',
  MAPPING_REMOVED: 'mapping-removed',

  /* Outcomes. A case that gets shared is a case someone stood behind, which is
     a stronger endorsement than anything they would have ticked in a survey. */
  REPORT_GENERATED: 'report-generated',
  REPORT_DOWNLOADED: 'report-downloaded',
  REPORT_SHARED: 'report-shared',

  /* The single explicit question, asked once at the end and only if the copilot
     actually contributed. */
  CONFIDENCE_ANSWERED: 'confidence-answered',

  /* Its follow-up, on the same screen and in the same breath. Not a second ask:
     the seller has already said how it went, and this is the one detail that
     makes that answer actionable. Time saved where it went well, and what went
     wrong where it did not. Skippable, and recorded as skipped when it is. */
  FEEDBACK_GIVEN: 'feedback-given',
};

/** Human labels, for anywhere a signal is summarised back. */
export const SIGNAL_LABELS = {
  [SIGNALS.FIELD_CORRECTED]: 'Field corrected',
  [SIGNALS.RECOMMENDATION_ACCEPTED]: 'Recommendation kept',
  [SIGNALS.RECOMMENDATION_REMOVED]: 'Recommendation removed',
  [SIGNALS.MAPPING_ACCEPTED]: 'Mapping kept',
  [SIGNALS.MAPPING_CHANGED]: 'Mapping changed',
  [SIGNALS.MAPPING_REMOVED]: 'Mapping removed',
  [SIGNALS.REPORT_GENERATED]: 'Report generated',
  [SIGNALS.REPORT_DOWNLOADED]: 'Report downloaded',
  [SIGNALS.REPORT_SHARED]: 'Report shared',
  [SIGNALS.CONFIDENCE_ANSWERED]: 'Confidence rated',
  [SIGNALS.FEEDBACK_GIVEN]: 'Feedback given',
};

/* The signals that represent the seller correcting the copilot rather than
   merely using the tool. Only these are worth counting back to them — "three
   corrections" is a true and useful sentence; "eleven signals" is neither. */
const CORRECTION_TYPES = new Set([
  SIGNALS.FIELD_CORRECTED,
  SIGNALS.RECOMMENDATION_REMOVED,
  SIGNALS.MAPPING_CHANGED,
  SIGNALS.MAPPING_REMOVED,
]);

/**
 * A correction is a change to something the copilot produced. Adding a vendor
 * it never mentioned, or deleting one you added yourself, is work — it is not a
 * verdict on the copilot, and counting it as one puts a number in front of the
 * seller that they can see is wrong.
 *
 * The full behavioural record keeps every event either way. Only the sentence
 * shown back to a person is narrowed, because that sentence has to be true.
 */
export const correctionCount = (signals = []) =>
  signals.filter((s) => CORRECTION_TYPES.has(s.type) && s.detail?.ai === true).length;

/** Counts by type, for a reporting view that does not exist yet. */
export function summariseSignals(signals = []) {
  const byType = {};
  signals.forEach((s) => {
    byType[s.type] = (byType[s.type] || 0) + 1;
  });
  return {
    total: signals.length,
    corrections: correctionCount(signals),
    byType,
  };
}
