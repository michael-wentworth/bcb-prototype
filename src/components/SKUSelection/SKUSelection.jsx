import React, { useState } from 'react';
import { Badge, Button, Card, Dropdown, Option, Switch } from '@fluentui/react-components';
import { Add16Filled, Delete16Regular, Sparkle16Filled } from '@fluentui/react-icons';
import { SKU_CATALOG, SKU_RECOMMENDATIONS } from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import RecommendationCard from './RecommendationCard.jsx';
import AuthorshipBadge from '../shared/AuthorshipBadge.jsx';
import SectionHeading from '../shared/SectionHeading.jsx';
import StageFooter from '../shared/StageFooter.jsx';
import styles from './SKUSelection.module.css';

export default function SKUSelection() {
  const {
    selectedSkus,
    manualSkus,
    sectionAuthorship,
    toggleSku,
    addManualSku,
    removeManualSku,
    ask,
    profile,
  } = useAppState();

  const [pending, setPending] = useState('');

  const recommended = SKU_RECOMMENDATIONS.filter((s) => s.recommended);
  const considered = SKU_RECOMMENDATIONS.filter((s) => !s.recommended);
  const selectedCount = selectedSkus.length;
  const available = SKU_CATALOG.filter((s) => !manualSkus.some((m) => m.id === s.id));

  return (
    <div className={styles.root}>
      <SectionHeading
        eyebrow="Stage 2 of 4"
        title="Microsoft solutions"
        description={`Shortlisted from ${
          profile.companyName || 'the customer'
        }'s profile and stated objectives. Expand any card for the reasoning, toggle anything you disagree with, and add solutions the shortlist missed.`}
        actions={
          <div className={styles.headActions}>
            <AuthorshipBadge level={sectionAuthorship.solutions} />
            <Badge appearance="tint" color={selectedCount ? 'brand' : 'informative'}>
              {selectedCount} in the case
            </Badge>
          </div>
        }
      />

      {recommended.length > 0 ? (
        <section>
          <div className={styles.groupHead}>
            <h3 className={styles.groupTitle}>Recommended by the copilot</h3>
            <AuthorshipBadge level="ai" />
          </div>
          <div className={styles.list}>
            {recommended.map((sku) => (
              <RecommendationCard
                key={sku.id}
                sku={sku}
                selected={selectedSkus.includes(sku.id)}
                onToggle={() => toggleSku(sku.id)}
                onAsk={() => ask(`Why are you recommending ${sku.name}?`)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Manual additions sit alongside the shortlist as equals, not as an
          afterthought bolted on below it. */}
      <section className={styles.manual}>
        <div className={styles.groupHead}>
          <h3 className={styles.groupTitle}>Added by you</h3>
          <AuthorshipBadge level="manual" />
        </div>

        {manualSkus.length > 0 ? (
          <div className={styles.manualList}>
            {manualSkus.map((sku) => (
              <div key={sku.id} className={styles.manualCard}>
                <div className={styles.manualMain}>
                  <span className={styles.manualName}>{sku.name}</span>
                  <span className={styles.manualCategory}>
                    {sku.category} · {sku.seats}
                  </span>
                  <p className={styles.manualSummary}>{sku.summary}</p>
                </div>
                <div className={styles.manualActions}>
                  <Switch
                    checked={selectedSkus.includes(sku.id)}
                    onChange={() => toggleSku(sku.id)}
                    label={selectedSkus.includes(sku.id) ? 'In case' : 'Excluded'}
                    labelPosition="before"
                  />
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<Delete16Regular />}
                    aria-label={`Remove ${sku.name}`}
                    onClick={() => removeManualSku(sku.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.manualEmpty}>
            Nothing added by hand yet. Pick from the catalogue to include a solution the copilot did
            not propose.
          </p>
        )}

        <div className={styles.addRow}>
          <Dropdown
            className={styles.addPicker}
            placeholder="Choose a solution…"
            value={available.find((s) => s.id === pending)?.name || ''}
            selectedOptions={pending ? [pending] : []}
            onOptionSelect={(_, d) => setPending(d.optionValue)}
            disabled={available.length === 0}
          >
            {available.map((s) => (
              <Option key={s.id} value={s.id} text={s.name}>
                {s.name}
              </Option>
            ))}
          </Dropdown>
          <Button
            appearance="secondary"
            icon={<Add16Filled />}
            disabled={!pending}
            onClick={() => {
              const sku = SKU_CATALOG.find((s) => s.id === pending);
              if (sku) addManualSku(sku);
              setPending('');
            }}
          >
            Add solution
          </Button>
        </div>
      </section>

      {considered.length > 0 ? (
        <section className={styles.considered}>
          <h3 className={styles.consideredTitle}>Considered and held back</h3>
          <p className={styles.consideredText}>
            The copilot evaluated these and left them out of the headline case. Naming what you
            excluded — and why — is usually what makes the rest credible.
          </p>
          <div className={styles.list}>
            {considered.map((sku) => (
              <RecommendationCard
                key={sku.id}
                sku={sku}
                selected={selectedSkus.includes(sku.id)}
                onToggle={() => toggleSku(sku.id)}
                onAsk={() => ask(`Why did you decide not to recommend ${sku.name}?`)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <StageFooter
        hint={
          selectedCount === 0
            ? 'Add at least one solution — by hand or with the copilot — before the numbers mean anything.'
            : 'Next: map these against the third-party tools they replace.'
        }
      />
    </div>
  );
}
