import React, { useState } from 'react';
import { Badge, Button, Input, Textarea } from '@fluentui/react-components';
import {
  ArrowRight20Filled,
  DocumentOnePage20Regular,
  Sparkle20Filled,
  TextT20Regular,
} from '@fluentui/react-icons';
import { CREATION_MODES, TEMPLATES } from '../../data/authoring.js';
import { DEMO_PROMPT } from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './StartScreen.module.css';

const MODE_ICONS = {
  sparkle: <Sparkle20Filled />,
  template: <DocumentOnePage20Regular />,
  blank: <TextT20Regular />,
};

/**
 * The creation fork.
 *
 * All three routes get identical visual weight on purpose. Putting a prompt box
 * on the first screen and hiding "start blank" behind a link is exactly what
 * makes an assistant feel mandatory — so none of that happens here.
 */
export default function StartScreen() {
  const { startCase } = useAppState();
  const [mode, setMode] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [templateId, setTemplateId] = useState('security');
  const [title, setTitle] = useState('');

  const canSubmit = mode && (mode !== 'ai' || prompt.trim().length > 0);
  const primaryLabel = {
    ai: 'Generate draft',
    template: 'Create from template',
    blank: 'Create blank case',
  }[mode];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Badge appearance="tint" color="brand" className={styles.eyebrow}>
          New business case
        </Badge>
        <h1 className={styles.title}>How would you like to start?</h1>
        <p className={styles.subtitle}>
          Every route produces the same Business Case, with the same editing, analysis and export.
          The copilot is available throughout — and required at no point.
        </p>
      </header>

      <div className={styles.modes} role="radiogroup" aria-label="Creation mode">
        {CREATION_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            className={`${styles.mode} ${mode === m.id ? styles.modeActive : ''}`}
            onClick={() => setMode(m.id)}
          >
            <span className={styles.modeIcon} aria-hidden="true">
              {MODE_ICONS[m.icon]}
            </span>
            <span className={styles.modeLabel}>{m.label}</span>
            <span className={styles.modeTagline}>{m.tagline}</span>
            <span className={styles.modeBestFor}>{m.bestFor}</span>
          </button>
        ))}
      </div>

      {mode ? (
        <section className={styles.panel} aria-label="Configure your new case">
          <p className={styles.panelDescription}>
            {CREATION_MODES.find((m) => m.id === mode).description}
          </p>

          {mode === 'ai' ? (
            <>
              <label className={styles.fieldLabel} htmlFor="start-prompt">
                Describe your business opportunity
              </label>
              <Textarea
                id="start-prompt"
                className={styles.prompt}
                value={prompt}
                resize="vertical"
                onChange={(_, d) => setPrompt(d.value)}
                placeholder="Describe your business opportunity…"
              />
              <button type="button" className={styles.example} onClick={() => setPrompt(DEMO_PROMPT)}>
                <span className={styles.exampleLabel}>Use an example</span>
                <span className={styles.exampleText}>{DEMO_PROMPT}</span>
              </button>
            </>
          ) : null}

          {mode === 'template' ? (
            <>
              <p className={styles.fieldLabel}>Choose a template</p>
              <div className={styles.templates}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={templateId === t.id}
                    className={`${styles.template} ${
                      templateId === t.id ? styles.templateActive : ''
                    }`}
                    onClick={() => setTemplateId(t.id)}
                  >
                    <span className={styles.templateHead}>
                      <span className={styles.templateName}>{t.name}</span>
                      <Badge appearance="tint" size="small" color={t.accent}>
                        {t.narrative.length} sections
                      </Badge>
                    </span>
                    <span className={styles.templateSummary}>{t.summary}</span>
                  </button>
                ))}
              </div>
              <p className={styles.hint}>
                Templates give you the structure and the prompts — never the prose. Every section
                starts empty and manually authored.
              </p>
            </>
          ) : null}

          {mode === 'blank' ? (
            <p className={styles.hint}>
              You&rsquo;ll get the four workflow stages with nothing filled in: an empty customer
              profile, an empty solution shortlist, no displacements and empty narrative sections.
              Nothing will prompt you to use the copilot.
            </p>
          ) : null}

          <label className={styles.fieldLabel} htmlFor="start-title">
            Name <span className={styles.optional}>(optional)</span>
          </label>
          <Input
            id="start-title"
            className={styles.titleInput}
            value={title}
            onChange={(_, d) => setTitle(d.value)}
            placeholder="Untitled business case"
          />

          <div className={styles.actions}>
            <Button
              appearance="primary"
              size="large"
              icon={<ArrowRight20Filled />}
              iconPosition="after"
              disabled={!canSubmit}
              onClick={() => startCase({ mode, templateId, title, prompt })}
            >
              {primaryLabel}
            </Button>
          </div>
        </section>
      ) : (
        <p className={styles.pick}>Pick a starting point to continue.</p>
      )}
    </div>
  );
}
