import React, { useState } from 'react';
import { Button, Slider, Textarea, useId } from '@fluentui/react-components';
import { CheckmarkCircle16Filled } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { correctionCount } from '../../data/signals.js';
import styles from './MessageBlocks.module.css';

const ANSWERS = [
  { id: 'very', label: 'Very confident' },
  { id: 'somewhat', label: 'Somewhat confident' },
  { id: 'needs-work', label: 'Needs work' },
];

/* Five named steps rather than five numbers. A "3" needs a legend printed
   beside it; "Good" does not, and the panel has no room for a legend. Stored as
   1 to 5 so it still aggregates as a rating. */
const QUALITY = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Very good' },
  { value: 5, label: 'Excellent' },
];

const CATEGORIES = [
  { id: 'irrelevant', label: 'Irrelevant answer' },
  { id: 'outdated', label: 'Information outdated' },
  { id: 'slow', label: 'Took too long to respond' },
];

const MIN_MINUTES = 5;
const MAX_MINUTES = 30;

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
 *
 * Two steps, one ask. The follow-up appears in place of the chips the seller
 * just used, so it reads as the rest of the same question rather than as a
 * second interruption, and it branches on the answer already given: where it
 * went well the useful unknown is what it was worth, and where it did not the
 * useful unknown is what broke. Asking both of everybody would mean asking
 * every seller a question that cannot apply to them.
 *
 * Skippable throughout. An ask nobody can decline is a survey.
 */
export default function ConfidenceAsk() {
  const { caseConfidenceAnswer, caseFeedback, answerConfidence, submitFeedback, signals } =
    useAppState();
  const sliderId = useId('time-saved');

  const [minutes, setMinutes] = useState(15);
  const [quality, setQuality] = useState(null);
  const [category, setCategory] = useState(null);
  const [note, setNote] = useState('');

  /* Done: either answered and followed up, or answered and skipped. */
  if (caseConfidenceAnswer && caseFeedback) {
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

  if (!caseConfidenceAnswer) {
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

  const wentWell = caseConfidenceAnswer !== 'needs-work';
  const skip = () => submitFeedback({ skipped: true });

  if (wentWell) {
    return (
      <div className={styles.followUp}>
        <div>
          <label className={styles.followUpLabel} htmlFor={sliderId}>
            How much time did this save you?
          </label>
          <div className={styles.sliderRow}>
            <Slider
              id={sliderId}
              size="small"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              step={5}
              value={minutes}
              onChange={(_, d) => setMinutes(d.value)}
            />
            <span className={styles.sliderValue}>{minutes} min</span>
          </div>
        </div>

        <div>
          <span className={styles.followUpLabel} id={`${sliderId}-quality`}>
            How good were the answers?
          </span>
          <div
            className={styles.confidenceAsk}
            role="group"
            aria-labelledby={`${sliderId}-quality`}
          >
            {QUALITY.map((q) => (
              <Button
                key={q.value}
                size="small"
                appearance={quality === q.value ? 'primary' : 'outline'}
                className={styles.confidenceChip}
                aria-pressed={quality === q.value}
                onClick={() => setQuality(q.value)}
              >
                {q.label}
              </Button>
            ))}
          </div>
        </div>

        <div className={styles.followUpActions}>
          <Button
            size="small"
            appearance="primary"
            onClick={() => submitFeedback({ minutesSaved: minutes, quality })}
          >
            Send
          </Button>
          <Button size="small" appearance="subtle" onClick={skip}>
            Skip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.followUp}>
      <div>
        <span className={styles.followUpLabel} id={`${sliderId}-category`}>
          What let it down?
        </span>
        <div className={styles.confidenceAsk} role="group" aria-labelledby={`${sliderId}-category`}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="small"
              appearance={category === cat.id ? 'primary' : 'outline'}
              className={styles.confidenceChip}
              aria-pressed={category === cat.id}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Free text is where the actual answer usually is, so it is always
          offered rather than gated behind picking a category first. */}
      <Textarea
        size="small"
        resize="vertical"
        className={styles.followUpNote}
        value={note}
        onChange={(_, d) => setNote(d.value)}
        placeholder="What went wrong? (optional)"
        aria-label="What went wrong"
      />

      <div className={styles.followUpActions}>
        {/* Nothing picked and nothing typed is a skip wearing a Send button.
            The slider on the other branch always holds a value, so only this
            one can be empty. */}
        <Button
          size="small"
          appearance="primary"
          disabled={!category && !note.trim()}
          onClick={() => submitFeedback({ category, note: note.trim() })}
        >
          Send
        </Button>
        <Button size="small" appearance="subtle" onClick={skip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
