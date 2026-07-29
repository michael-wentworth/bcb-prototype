import React from 'react';
import { Badge, Button, Card } from '@fluentui/react-components';
import {
  Building20Regular,
  Certificate20Regular,
  Globe20Regular,
  Layer20Regular,
  Lightbulb20Filled,
  People20Regular,
  Sparkle16Filled,
  Target20Regular,
} from '@fluentui/react-icons';
import {
  COACHING_GAPS,
  DEMO_PROMPT,
  GEOGRAPHY_OPTIONS,
  INDUSTRY_OPTIONS,
  LICENSING_OPTIONS,
  PROFILE_FIELDS,
} from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import AIField from './AIField.jsx';
import AuthorshipBadge from '../shared/AuthorshipBadge.jsx';
import ConfidenceBadge from '../shared/ConfidenceBadge.jsx';
import SectionHeading from '../shared/SectionHeading.jsx';
import StageFooter from '../shared/StageFooter.jsx';
import styles from './CustomerProfile.module.css';

const ICONS = {
  building: <Building20Regular />,
  industry: <Layer20Regular />,
  people: <People20Regular />,
  globe: <Globe20Regular />,
  certificate: <Certificate20Regular />,
  target: <Target20Regular />,
};

const OPTIONS = {
  industry: INDUSTRY_OPTIONS,
  geography: GEOGRAPHY_OPTIONS,
  currentLicensing: LICENSING_OPTIONS,
};

export default function CustomerProfile() {
  const { profile, fieldMeta, vendors, profilePopulated, sectionAuthorship, setField, ask } =
    useAppState();

  const filledCount = Object.values(profile).filter((v) => v && String(v).trim()).length;
  const total = PROFILE_FIELDS.length;

  return (
    <div className={styles.root}>
      <SectionHeading
        eyebrow="Stage 1 of 4"
        title="Customer profile"
        description="Type the details in directly, or describe the customer to the copilot and review what it captures. Every field stays editable either way, and every value shows where it came from."
        actions={
          <div className={styles.headActions}>
            <AuthorshipBadge level={sectionAuthorship.profile} />
            <Badge appearance="tint" color={filledCount === total ? 'success' : 'informative'}>
              {filledCount} of {total} captured
            </Badge>
          </div>
        }
      />

      {/* Offered, never imposed. Nothing downstream is gated on having used it. */}
      {!profilePopulated ? <PrimerCard onUseExample={() => ask(DEMO_PROMPT)} /> : null}

      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <h3 className={styles.cardTitle}>Company details</h3>
          {profilePopulated ? (
            <span className={styles.cardNote}>
              <Sparkle16Filled aria-hidden="true" />
              Populated by the copilot — review and adjust
            </span>
          ) : null}
        </div>

        <div className={styles.grid}>
          {PROFILE_FIELDS.map((field) => (
            <div
              key={field.key}
              className={field.type === 'textarea' ? styles.spanFull : undefined}
            >
              <AIField
                label={field.label}
                type={field.type}
                options={OPTIONS[field.key] || []}
                icon={ICONS[field.icon]}
                value={profile[field.key]}
                meta={fieldMeta[field.key]}
                onChange={(v) => setField(field.key, v)}
              />
            </div>
          ))}
        </div>
      </Card>

      {vendors.length > 0 ? (
        <Card className={styles.card}>
          <div className={styles.cardHead}>
            <h3 className={styles.cardTitle}>Third-party estate detected</h3>
            <span className={styles.cardNote}>Drives the consolidation case in stage 3</span>
          </div>
          <div className={styles.vendorGrid}>
            {vendors.map((v) => (
              <div key={v.id} className={styles.vendorCard}>
                <div className={styles.vendorTop}>
                  <span className={styles.vendorName}>{v.name}</span>
                  <ConfidenceBadge level={v.confidence} basis={v.basis} compact />
                </div>
                <span className={styles.vendorCategory}>{v.category}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {profilePopulated ? (
        <Card className={`${styles.card} ${styles.coachCard}`}>
          <div className={styles.coachHead}>
            <span className={styles.coachIcon} aria-hidden="true">
              <Lightbulb20Filled />
            </span>
            <div>
              <h3 className={styles.cardTitle}>What would make this case stronger</h3>
              <p className={styles.coachSub}>
                Three inputs are still modelled rather than confirmed by the customer.
              </p>
            </div>
          </div>
          <ul className={styles.coachList}>
            {COACHING_GAPS.map((gap) => (
              <li key={gap.id} className={styles.coachItem}>
                <div className={styles.coachItemHead}>
                  <span className={styles.coachTitle}>{gap.title}</span>
                  <Badge
                    appearance="tint"
                    size="small"
                    color={gap.impact === 'high' ? 'danger' : 'warning'}
                  >
                    {gap.impact === 'high' ? 'High impact' : 'Medium impact'}
                  </Badge>
                </div>
                <p className={styles.coachText}>{gap.text}</p>
                <Button
                  size="small"
                  appearance="transparent"
                  className={styles.coachAsk}
                  icon={<Sparkle16Filled />}
                  onClick={() => ask(gap.prompt)}
                >
                  {gap.prompt}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Advancing is never gated on having used the copilot — a part-filled
          profile is a legitimate state to move on from. */}
      <StageFooter
        hint={
          filledCount === 0
            ? 'Fill in what you know, or ask the copilot. You can move on and come back.'
            : 'Next: choose the Microsoft solutions this case will rest on.'
        }
      />
    </div>
  );
}

function PrimerCard({ onUseExample }) {
  return (
    <Card className={styles.primer}>
      <span className={styles.primerMark} aria-hidden="true">
        <Sparkle16Filled />
      </span>
      <div className={styles.primerBody}>
        <h3 className={styles.primerTitle}>Fill this in yourself, or have the copilot do it</h3>
        <p className={styles.primerText}>
          Type straight into any field below and carry on — nothing here waits on the assistant. Or
          describe the customer in a sentence and it will populate the stage, flagging anything it
          had to infer.
        </p>
        <button type="button" className={styles.primerExample} onClick={onUseExample}>
          <span className={styles.primerExampleLabel}>Example prompt</span>
          <span className={styles.primerExampleText}>&ldquo;{DEMO_PROMPT}&rdquo;</span>
        </button>
      </div>
    </Card>
  );
}
