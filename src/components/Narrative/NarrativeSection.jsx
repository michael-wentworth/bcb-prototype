import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip,
} from '@fluentui/react-components';
import { ArrowReset20Regular, Sparkle16Filled, TextT20Regular } from '@fluentui/react-icons';
import { actionsForNarrative } from '../../data/aiActions.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './NarrativeSection.module.css';

/** Grows with its content so a written section never scrolls inside itself. */
function AutoTextarea({ value, onChange, placeholder, ariaLabel, autoFocus }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <textarea
      ref={ref}
      className={styles.prose}
      value={value}
      rows={4}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/**
 * An authorable section of the business case.
 *
 * The two routes out of an empty section — write it, or generate it — are given
 * the same weight. Once there is content, it is a plain textarea: the copilot's
 * output has no special status and no lock on it.
 */
export default function NarrativeSection({ section }) {
  const { narrative, setNarrative, runNarrativeAction, revertNarrative } = useAppState();
  const entry = narrative[section.id];
  const [writing, setWriting] = useState(false);

  const empty = !entry.text.trim();
  const actions = actionsForNarrative(entry.text);

  return (
    <section className={styles.section} aria-label={section.label}>
      <header className={styles.head}>
        <h3 className={styles.title}>{section.label}</h3>
        <div className={styles.tools}>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Tooltip content="Copilot actions" relationship="label" withArrow>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Sparkle16Filled className={styles.aiIcon} />}
                  aria-label={`Copilot actions for ${section.label}`}
                />
              </Tooltip>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {actions.map((a) => (
                  <MenuItem
                    key={a.id}
                    icon={<Sparkle16Filled />}
                    onClick={() => runNarrativeAction(section.id, a.id)}
                  >
                    {a.label}
                  </MenuItem>
                ))}
                {entry.snapshot ? (
                  <>
                    <MenuDivider />
                    <MenuItem
                      icon={<ArrowReset20Regular />}
                      onClick={() => revertNarrative(section.id)}
                    >
                      Revert to my version
                    </MenuItem>
                  </>
                ) : null}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </header>

      {empty && !writing ? (
        <div className={styles.empty}>
          <p className={styles.emptyLead}>{section.lead}</p>
          <div className={styles.emptyActions}>
            <Button
              appearance="secondary"
              size="small"
              icon={<TextT20Regular />}
              onClick={() => setWriting(true)}
            >
              Write it myself
            </Button>
            <Button
              appearance="secondary"
              size="small"
              icon={<Sparkle16Filled className={styles.aiIcon} />}
              onClick={() => runNarrativeAction(section.id, 'generate')}
            >
              Generate with AI
            </Button>
          </div>
        </div>
      ) : (
        <AutoTextarea
          value={entry.text}
          onChange={(text) => setNarrative(section.id, text)}
          placeholder={section.placeholder}
          ariaLabel={section.label}
          autoFocus={writing && empty}
        />
      )}
    </section>
  );
}
