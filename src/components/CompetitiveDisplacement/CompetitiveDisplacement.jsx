import React from 'react';
import { Badge, Button, Card, Switch } from '@fluentui/react-components';
import {
  ArrowRight20Filled,
  Lightbulb20Filled,
  ShieldCheckmark24Regular,
  Sparkle16Filled,
} from '@fluentui/react-icons';
import {
  DISPLACEMENTS,
  MICROSOFT_FAMILIES,
  formatCurrency,
} from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import ConfidenceBadge from '../shared/ConfidenceBadge.jsx';
import SectionHeading from '../shared/SectionHeading.jsx';
import StageFooter from '../shared/StageFooter.jsx';
import styles from './CompetitiveDisplacement.module.css';

export default function CompetitiveDisplacement() {
  const { includedDisplacements, toggleDisplacement, businessCase, ask } = useAppState();

  const includedCount = includedDisplacements.length;
  const familiesInPlay = new Set(
    DISPLACEMENTS.filter((d) => includedDisplacements.includes(d.id)).map((d) => d.to.family),
  );

  return (
    <div className={styles.root}>
      <SectionHeading
        eyebrow="Stage 3 of 4"
        title="Competitive displacement"
        description="Four third-party security products map onto three Microsoft platforms. Toggle any mapping off and the business case recalculates immediately."
        actions={
          <Badge appearance="tint" color="brand">
            {includedCount} of {DISPLACEMENTS.length} mappings in the case
          </Badge>
        }
      />

      <Card className={styles.commentary}>
        <span className={styles.commentaryIcon} aria-hidden="true">
          <Lightbulb20Filled />
        </span>
        <div>
          <p className={styles.commentaryTitle}>Vendor consolidation opportunity identified</p>
          <p className={styles.commentaryText}>
            Consolidating into the Microsoft security stack may reduce operational complexity and
            licensing costs. Three of the four mappings are already inside the Microsoft&nbsp;365 E5
            uplift rather than a separate purchase.
          </p>
          <Button
            size="small"
            appearance="transparent"
            className={styles.commentaryAsk}
            icon={<Sparkle16Filled />}
            onClick={() => ask('Explain the consolidation opportunity')}
          >
            Ask the copilot to walk through this
          </Button>
        </div>
      </Card>

      <Card className={styles.mapCard}>
        <div className={styles.columns}>
          <div className={styles.colHead}>
            <span className={styles.colTitle}>Current state</span>
            <span className={styles.colMeta}>
              {DISPLACEMENTS.length} vendors ·{' '}
              {formatCurrency(DISPLACEMENTS.reduce((s, d) => s + d.from.annualSpend, 0))} per year
            </span>
          </div>
          <div className={styles.colSpacer} aria-hidden="true" />
          <div className={styles.colHead}>
            <span className={styles.colTitle}>Future Microsoft state</span>
            <span className={styles.colMeta}>
              {familiesInPlay.size} platform{familiesInPlay.size === 1 ? '' : 's'} · one console
            </span>
          </div>
        </div>

        <ul className={styles.rows}>
          {DISPLACEMENTS.map((d, i) => {
            const included = includedDisplacements.includes(d.id);
            return (
              <li
                key={d.id}
                className={`${styles.row} ${included ? '' : styles.rowExcluded}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={styles.mapping}>
                  <div className={`${styles.node} ${styles.nodeCurrent}`}>
                    <div className={styles.nodeTop}>
                      <span className={styles.vendor}>{d.from.vendor}</span>
                      <ConfidenceBadge level={d.confidence} compact />
                    </div>
                    <span className={styles.product}>{d.from.product}</span>
                    <span className={styles.category}>{d.from.category}</span>
                    <span className={styles.spend}>
                      {formatCurrency(d.from.annualSpend)} <em>per year</em>
                    </span>
                  </div>

                  <div className={styles.connector} aria-hidden="true">
                    <span className={styles.line} />
                    <span className={styles.arrowBubble}>
                      <ArrowRight20Filled />
                    </span>
                    <span className={styles.line} />
                    <span className={styles.coverage}>{d.coverage} coverage</span>
                  </div>

                  <div className={`${styles.node} ${styles.nodeFuture}`}>
                    <div className={styles.nodeTop}>
                      <span className={styles.familyTag}>
                        <ShieldCheckmark24Regular aria-hidden="true" />
                        {d.to.family}
                      </span>
                    </div>
                    <span className={styles.product}>{d.to.product}</span>
                    <span className={styles.category}>{d.to.note}</span>
                    <span className={styles.benefit}>
                      {formatCurrency(d.benefit3yr)} <em>3-year benefit</em>
                    </span>
                  </div>
                </div>

                <div className={styles.rowFooter}>
                  <p className={styles.rowCommentary}>{d.commentary}</p>
                  <Switch
                    checked={included}
                    onChange={() => toggleDisplacement(d.id)}
                    label={included ? 'In the case' : 'Excluded'}
                    labelPosition="before"
                    className={styles.rowSwitch}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Third-party spend displaced</span>
          <span className={styles.summaryValue}>
            {formatCurrency(businessCase.annualThirdPartySpend)}
          </span>
          <span className={styles.summaryCaption}>per year, across {includedCount} contracts</span>
        </Card>
        <Card className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Incremental Microsoft spend</span>
          <span className={styles.summaryValue}>
            {formatCurrency(businessCase.annualMicrosoftSpend)}
          </span>
          <span className={styles.summaryCaption}>per year, for the replacing capability</span>
        </Card>
        <Card className={`${styles.summaryCard} ${styles.summaryPositive}`}>
          <span className={styles.summaryLabel}>Net licensing reduction</span>
          <span className={styles.summaryValue}>
            {formatCurrency(businessCase.annualLicensingReduction)}
          </span>
          <span className={styles.summaryCaption}>per year, before operational benefit</span>
        </Card>
      </div>

      <Card className={styles.platforms}>
        <h3 className={styles.platformsTitle}>What the estate becomes</h3>
        <div className={styles.platformGrid}>
          {MICROSOFT_FAMILIES.map((f) => {
            const active = familiesInPlay.has(f.id);
            const replaced = DISPLACEMENTS.filter(
              (d) => d.to.family === f.id && includedDisplacements.includes(d.id),
            ).length;
            return (
              <div key={f.id} className={`${styles.platform} ${active ? '' : styles.platformOff}`}>
                <span className={styles.platformName}>{f.name}</span>
                <p className={styles.platformDesc}>{f.description}</p>
                <span className={styles.platformReplaces}>
                  {active
                    ? `Replaces ${replaced} ${replaced === 1 ? 'product' : 'products'}`
                    : 'Not in the current case'}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <StageFooter
        nextDisabled={includedCount === 0}
        hint={
          includedCount === 0
            ? 'Keep at least one displacement in the case to build the executive summary.'
            : 'Next: the copilot assembles the executive business case from these inputs.'
        }
      />
    </div>
  );
}
