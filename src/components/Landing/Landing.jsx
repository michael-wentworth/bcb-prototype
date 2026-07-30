import React, { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { Add20Filled, Play20Filled } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import { METRICS_SOURCE, PILLARS, UPDATES } from '../../data/landing.js';
import styles from './Landing.module.css';

/**
 * The product landing page.
 *
 * The whole design is one rule: every piece of content starts at the same left
 * edge. Bands run full width and change colour, but nothing inside them is ever
 * indented differently from anything else — that is what the previous page was
 * missing, with the nav, the hero, the section tabs and the body copy each
 * starting somewhere else.
 *
 * The gradient stays, because it is the product's signature, but it is contained
 * inside two panels rather than washed behind the headline. A saturated field
 * behind text is what was drowning the call to action.
 */
export default function Landing() {
  const { newCase } = useAppState();
  const [pillar, setPillar] = useState(PILLARS[0].id);
  const active = PILLARS.find((p) => p.id === pillar) || PILLARS[0];

  return (
    <div className={styles.root}>
      {/* ---------------------------------- hero --------------------------- */}
      <section className={styles.hero}>
        <div className={styles.grid}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Microsoft Security for Enterprise</p>
            <h1 className={styles.title}>Security Business Case Builder</h1>
            <p className={styles.lede}>
              Turn Forrester research into a defensible ROI case for a named customer. Model the
              licences, the vendors being displaced and the timing, and leave with the report and
              the deck.
            </p>
            <div className={styles.heroActions}>
              {/* The only filled button above the fold, on a plain surface, with
                  nothing competing for the same attention. */}
              <Button
                appearance="primary"
                size="large"
                icon={<Add20Filled />}
                onClick={newCase}
                className={styles.cta}
              >
                Start a business case
              </Button>
              <Button appearance="subtle" size="large" icon={<Play20Filled />}>
                Watch the introduction
              </Button>
            </div>
          </div>

          <div className={styles.heroMedia}>
            <button type="button" className={styles.video} aria-label="Play the introduction video">
              <span className={styles.videoArt} aria-hidden="true" />
              <span className={styles.playMark} aria-hidden="true">
                <Play20Filled />
              </span>
              <span className={styles.videoMeta}>
                <span className={styles.videoTitle}>Build a case in minutes</span>
                <span className={styles.videoDuration}>2:45</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------- pillars -------------------------- */}
      <section className={styles.band}>
        <div className={styles.grid}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Business value pillars</p>
              <h2 className={styles.sectionTitle}>Securely adopt AI with Microsoft Security</h2>
              <p className={styles.sectionLede}>
                Every calculation in the tool rolls up to one of these three.
              </p>
            </div>

            <div className={styles.tabs} role="tablist" aria-label="Business value pillars">
              {PILLARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={p.id === pillar}
                  className={`${styles.tab} ${p.id === pillar ? styles.tabOn : ''}`}
                  onClick={() => setPillar(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <p className={styles.pillarLead}>{active.lead}</p>

          {/* The gradient lives here — contained, behind figures rather than
              behind type, and never behind a control. */}
          <div className={styles.statPanel} key={active.id}>
            <div className={styles.statGrid}>
              {active.stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  {s.kind === 'ring' ? (
                    <Ring value={s.value} />
                  ) : (
                    <span className={styles.statFigure}>{s.value}</span>
                  )}
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className={styles.source}>{METRICS_SOURCE}</p>
        </div>
      </section>

      {/* ------------------------------- what's new ------------------------ */}
      <section className={styles.band}>
        <div className={styles.grid}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>What&rsquo;s new</p>
              <h2 className={styles.sectionTitle}>Latest updates</h2>
            </div>
          </div>

          <div className={styles.updates}>
            {UPDATES.map((group) => (
              <div key={group.period} className={styles.updateGroup}>
                <h3 className={styles.period}>{group.period}</h3>
                <ul className={styles.entries}>
                  {group.entries.map((e) => (
                    <li key={e.title} className={styles.entry}>
                      <span className={styles.tag} data-tag={e.tag.toLowerCase()}>
                        {e.tag}
                      </span>
                      <span className={styles.entryBody}>
                        <span className={styles.entryTitle}>{e.title}</span>
                        <span className={styles.entryText}>{e.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- feedback ------------------------- */}
      <section className={styles.feedback}>
        <div className={styles.grid}>
          {/* Left-aligned like everything else. A centred closing band would be a
              second alignment to explain. */}
          <h2 className={styles.feedbackTitle}>Have feedback?</h2>
          <p className={styles.feedbackText}>
            Tell us how to improve the experience, or the cases it produces.
          </p>
          <Button appearance="secondary" className={styles.feedbackButton}>
            Submit feedback
          </Button>
        </div>
      </section>
    </div>
  );
}

/** A percentage as a ring. Hand-drawn so it needs no charting dependency. */
function Ring({ value }) {
  const pct = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
  const r = 26;
  const circumference = 2 * Math.PI * r;
  return (
    <span className={styles.ring}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className={styles.ringTrack} cx="32" cy="32" r={r} />
        <circle
          className={styles.ringFill}
          cx="32"
          cy="32"
          r={r}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - pct / 100),
          }}
        />
      </svg>
      <span className={styles.ringValue}>{value}</span>
    </span>
  );
}
