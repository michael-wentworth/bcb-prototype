import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Textarea, Tooltip } from '@fluentui/react-components';
import { Send24Filled, Sparkle20Filled } from '@fluentui/react-icons';
import { DEMO_PROMPT } from '../../data/demoCase.js';
import { STEPS } from '../../data/referenceData.js';
import { STEP_SUGGESTIONS } from '../../data/aiScript.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import MessageBlocks from './MessageBlocks.jsx';
import styles from './AIAssistantPanel.module.css';

export default function AIAssistantPanel() {
  const { messages, thinking, step, ask, goToStep } = useAppState();
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

  const suggestions = STEP_SUGGESTIONS[step] || [];
  const busy = Boolean(thinking);

  return (
    <aside className={styles.panel} aria-label="Business case copilot">
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          <Sparkle20Filled />
        </span>
        <div className={styles.headerText}>
          <span className={styles.title}>Business case copilot</span>
          <span className={styles.subtitle}>
            {busy ? thinking.steps[thinking.index] : `Working on ${STEPS[step].label}`}
          </span>
        </div>
        <Badge appearance="outline" size="small" color="informative">
          Preview
        </Badge>
      </header>

      <div className={`${styles.thread} scrollArea`} ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 && !busy ? <EmptyState onUseExample={() => send(DEMO_PROMPT)} /> : null}

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

      {suggestions.length > 0 ? (
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>Suggested</span>
          <div className={styles.suggestionList}>
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                className={styles.chip}
                disabled={busy}
                onClick={() => (s.kind === 'demo' ? send(DEMO_PROMPT) : send(s.label))}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.composer}>
        <Textarea
          className={styles.textarea}
          value={draft}
          onChange={(_, data) => setDraft(data.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the customer, or ask why a recommendation is here…"
          resize="none"
          appearance="outline"
          aria-label="Message the business case copilot"
        />
        <Tooltip content="Send" relationship="label" withArrow>
          <Button
            appearance="primary"
            icon={<Send24Filled />}
            className={styles.send}
            disabled={busy || !draft.trim()}
            onClick={() => send()}
            aria-label="Send message"
          />
        </Tooltip>
      </div>
      <p className={styles.disclaimer}>
        Scripted prototype. Responses are illustrative and use mock data.
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

function EmptyState({ onUseExample }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyMark} aria-hidden="true">
        <Sparkle20Filled />
      </span>
      <p className={styles.emptyTitle}>Describe your customer</p>
      <p className={styles.emptyText}>
        Tell me who they are, what they run today, and what they&rsquo;re trying to fix. I&rsquo;ll
        build the profile, recommend solutions, and assemble the business case with you.
      </p>
      <button type="button" className={styles.emptyExample} onClick={onUseExample}>
        <span className={styles.emptyExampleLabel}>Try this</span>
        <span className={styles.emptyExampleText}>{DEMO_PROMPT}</span>
      </button>
    </div>
  );
}
