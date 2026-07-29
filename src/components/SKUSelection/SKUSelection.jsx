import React from 'react';
import { Badge } from '@fluentui/react-components';
import { SKU_RECOMMENDATIONS } from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import RecommendationCard from './RecommendationCard.jsx';
import SectionHeading from '../shared/SectionHeading.jsx';
import StageFooter from '../shared/StageFooter.jsx';
import styles from './SKUSelection.module.css';

export default function SKUSelection() {
  const { selectedSkus, toggleSku, ask, profile } = useAppState();

  const recommended = SKU_RECOMMENDATIONS.filter((s) => s.recommended);
  const considered = SKU_RECOMMENDATIONS.filter((s) => !s.recommended);
  const selectedCount = selectedSkus.length;

  return (
    <div className={styles.root}>
      <SectionHeading
        eyebrow="Stage 2 of 4"
        title="Recommended Microsoft solutions"
        description={`Shortlisted from ${
          profile.companyName || 'the customer'
        }'s profile, current licensing and stated objectives. Expand any card to see the reasoning and the evidence behind it.`}
        actions={
          <Badge appearance="tint" color="brand">
            {selectedCount} in the case
          </Badge>
        }
      />

      <div className={styles.list}>
        {recommended.map((sku, i) => (
          <div key={sku.id} style={{ animationDelay: `${i * 70}ms` }} className={styles.item}>
            <RecommendationCard
              sku={sku}
              selected={selectedSkus.includes(sku.id)}
              onToggle={() => toggleSku(sku.id)}
              onAsk={() => ask(`Why are you recommending ${sku.name}?`)}
            />
          </div>
        ))}
      </div>

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
        nextDisabled={selectedCount === 0}
        hint={
          selectedCount === 0
            ? 'Select at least one solution to continue.'
            : 'Next: map these against the third-party tools they replace.'
        }
      />
    </div>
  );
}
