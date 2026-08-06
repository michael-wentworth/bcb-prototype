import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Textarea, Tooltip } from '@fluentui/react-components';
import {
  PanelRightContract20Regular,
  Send20Filled,
  Sparkle20Filled,
} from '@fluentui/react-icons';
import { DEMO_PROMPT } from '../../data/demoCase.js';
import { STEP_SUGGESTIONS } from '../../data/aiScript.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import MessageBlocks from './MessageBlocks.jsx';
import styles from './AIAssistantPanel.module.css';

export default function AIAssistantPanel({ onCollapse }) {
  const { messages, thinking, step, customer, ask, goToStep } = useAppState();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const pinnedToBottom = useRef(true);

  // Track intent separately from the scroll effect: if the seller has scrolled up
  // to re-read something, new messages must not yank them back down.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinnedToBottom.current) return;
    // Messages grow as blocks and their entrance animations lay out, so scroll on
    // the next frame rather than against a stale scrollHeight. scrollTo on the
    // container is reliable here; scrollIntoView on a sentinel is not, because it
    // also walks ancestor scrollers.
    const raf = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, thinking]);

  const send = useCallback(
    (text) => {
      const value = (text ?? draft).trim();
      if (!value) return;
      ask(value);
      setDraft('');
    },
    [ask, draft],
  );

  const handleAction = useCallback(
    (action) => {
      if (!action) return;
      if (action.kind === 'navigate') {
        goToStep(action.step);
        return;
      }
      if (action.kind === 'demo') {
        send(DEMO_PROMPT);
        return;
      }
      send(action.label);
    },
    [goToStep, send],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  /* The populate prompt is not a suggestion, it is the demo. It shipped as the
     first of four identical pills and reviewers did not realise it was special —
     or what it would do — so it comes out of the row and says both.

     It also retires once the case has an account name: EXTRACT_CASE is gated on
     that field being empty, so after a populate this button falls through the
     intent list to a generic answer. A control that silently stops working is
     the same confusion in a different costume. */
  const allSuggestions = STEP_SUGGESTIONS[step] || [];
  const starter = customer.accountName ? null : allSuggestions.find((s) => s.kind === 'demo');
  const suggestions = allSuggestions.filter((s) => s.kind !== 'demo');
  const busy = Boolean(thinking);

  return (
    <aside id="copilot-panel" className={styles.panel} aria-label="Business case copilot">
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          <Sparkle20Filled />
        </span>
        {/* Title only. The step name was already the page's heading a few hundred
            pixels to the left, and the busy state this line also carried is shown
            inline in the thread with its own animated dots. */}
        <span className={styles.title}>Business case copilot</span>
        {/* The minimize control belongs to the panel, not the app chrome. */}
        <Tooltip content="Minimize the copilot" relationship="label" withArrow>
          <Button
            appearance="subtle"
            size="small"
            icon={<PanelRightContract20Regular />}
            onClick={onCollapse}
            aria-label="Minimize the copilot panel"
            className={styles.collapse}
          />
        </Tooltip>
      </header>

      <div className={`${styles.thread} scrollArea`} ref={scrollRef} onScroll={handleScroll}>
        {/* No empty state. The intro message is scheduled 600ms after mount, so an
            empty-thread placeholder could only ever flash: it rendered centred in the
            panel, was replaced by the intro before it could be read, and looked like a
            different component failing rather than a message arriving. A blank thread
            for those 600ms is correct — the header, chips and composer are all still
            there, so the panel reads as awaiting its first message. */}

        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className={styles.userRow}>
              <div className={styles.userBubble}>{message.blocks[0]?.text}</div>
            </div>
          ) : (
            <div key={message.id} className={styles.assistantRow}>
              <span className={styles.assistantAvatar} aria-hidden="true">
                <Sparkle20Filled />
              </span>
              <div className={styles.assistantBody}>
                <MessageBlocks blocks={message.blocks} onAction={handleAction} />
              </div>
            </div>
          ),
        )}

        {busy ? <Thinking steps={thinking.steps} index={thinking.index} /> : null}
      </div>

      {starter || suggestions.length > 0 ? (
        <div className={styles.suggestions}>
          {starter ? (
            <button
              type="button"
              className={styles.starter}
              disabled={busy}
              onClick={() => send(DEMO_PROMPT)}
            >
              <span className={styles.starterIcon} aria-hidden="true">
                <Sparkle20Filled />
              </span>
              <span className={styles.starterText}>
                <span className={styles.starterLabel}>{starter.label}</span>
                <span className={styles.starterHint}>
                  Fills every step from one sentence
                </span>
              </span>
            </button>
          ) : null}

          {suggestions.length > 0 ? (
            <div className={styles.suggestionList} role="group" aria-label="Suggested prompts">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={styles.chip}
                  disabled={busy}
                  onClick={() => send(s.label)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Send sits inside the field, bottom-right, the way every Copilot composer
          does it. A separate button beside a 62px-tall field leaves a block of
          dead space above it and reads as two unrelated controls; inside, the
          field and its action are one object. */}
      <div className={styles.composer}>
        <Textarea
          className={styles.textarea}
          value={draft}
          onChange={(_, data) => setDraft(data.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the customer, or ask why something is here…"
          resize="none"
          appearance="outline"
          aria-label="Message the business case copilot"
        />
        <Tooltip content="Send" relationship="label" withArrow>
          <Button
            appearance="primary"
            shape="circular"
            icon={<Send20Filled />}
            className={styles.send}
            disabled={busy || !draft.trim()}
            onClick={() => send()}
            aria-label="Send message"
          />
        </Tooltip>
      </div>
      <p className={styles.disclaimer}>
        Scripted prototype using mock data
      </p>
    </aside>
  );
}

function Thinking({ steps, index }) {
  return (
    <div className={styles.assistantRow}>
      <span className={`${styles.assistantAvatar} ${styles.avatarPulse}`} aria-hidden="true">
        <Sparkle20Filled />
      </span>
      <div className={styles.thinking} role="status" aria-live="polite">
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.thinkingText}>{steps[index]}…</span>
      </div>
    </div>
  );
}

