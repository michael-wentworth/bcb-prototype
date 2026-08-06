import React from 'react';
import { Button } from '@fluentui/react-components';
import { CheckmarkCircle16Filled } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { correctionCount } from '../../data/signals.js';
import styles from './MessageBlocks.module.css';

const ANSWERS = [
  { id: 'very', label: 'Very confident' },
  { id: 'somewhat', label: 'Somewhat confident' },
  { id: 'needs-work', label: 'Needs work' },
];

/**
 * The only question this tool ever asks, asked once, in the copilot.
 *
 * It belongs in the conversation rather than on the report: the report is the
 * thing being judged, and a rating control sitting inside it reads as part of
 * the deliverable. In the panel it is the assistant asking, which is what it
 * is — and the panel is already where every other exchange happens, so it costs
 * the seller no new place to look.
 *
 * The framing stays on the business case, not on the assistant. "How did the AI
 * do" invites a review of a feature nobody set out to evaluate; "how confident
 * are you in this" is a question the seller was already answering in their head
 * before showing it to a customer.
 */
export default function ConfidenceAsk() {
  const { caseConfidenceAnswer, answerConfidence, signals } = useAppState();

  if (caseConfidenceAnswer) {
    const corrections = correctionCount(signals);
    return (
      <p className={styles.confidenceThanks} role="status">
        <CheckmarkCircle16Filled className={styles.confidenceThanksIcon} aria-hidden="true" />
        <span>
          Thanks.
          {/* Proof the corrections went somewhere, stated as fact rather than as
              a promise about training. Skipped at zero: "0 corrections helped"
              is a worse sentence than silence. */}
          {corrections > 0
            ? ` The ${corrections} correction${corrections === 1 ? '' : 's'} you made ${corrections === 1 ? 'helps' : 'help'} improve future recommendations.`
            : ''}
        </span>
      </p>
    );
  }

  return (
    <div className={styles.confidenceAsk} role="group" aria-label="Business case confidence">
      {ANSWERS.map((a) => (
        <Button
          key={a.id}
          size="small"
          appearance="outline"
          className={styles.confidenceChip}
          onClick={() => answerConfidence(a.id)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
