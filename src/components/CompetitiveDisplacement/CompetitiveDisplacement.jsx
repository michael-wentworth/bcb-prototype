import React, { useState } from 'react';
import { Badge, Button, Card, Dropdown, Input, Option, Switch } from '@fluentui/react-components';
import {
  Add16Filled,
  ArrowRight20Filled,
  Delete16Regular,
  Lightbulb20Filled,
  ShieldCheckmark24Regular,
  Sparkle16Filled,
} from '@fluentui/react-icons';
import {
  DISPLACEMENTS,
  MICROSOFT_FAMILIES,
  MICROSOFT_TARGETS,
  formatCurrency,
} from '../../data/mockData.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import AuthorshipBadge from '../shared/AuthorshipBadge.jsx';
import ConfidenceBadge from '../shared/ConfidenceBadge.jsx';
import SectionHeading from '../shared/SectionHeading.jsx';
import StageFooter from '../shared/StageFooter.jsx';
import styles from './CompetitiveDisplacement.module.css';

/**
 * Manual displacement entry.
 *
 * Rows entered here are marked as manually authored and carry no confidence
 * score — the seller stated it, so there is nothing to be confident about.
 */
function ManualDisplacementEditor({ rows, onAdd, onRemove }) {
  const [vendor, setVendor] = useState('');
  const [product, setProduct] = useState('');
  const [spend, setSpend] = useState('');
  const [target, setTarget] = useState(MICROSOFT_TARGETS[0]);

  const canAdd = vendor.trim() && target;

  const submit = () => {
    if (!canAdd) return;
    onAdd({
      id: `manual-${Date.now()}`,
      vendor: vendor.trim(),
      product: product.trim(),
      annualSpend: Number(String(spend).replace(/[^0-9.]/g, '')) || 0,
      target,
    });
    setVendor('');
    setProduct('');
    setSpend('');
  };

  return (
    <section className={styles.manual}>
      <div className={styles.groupHead}>
        <h3 className={styles.groupTitle}>Added by you</h3>
        <AuthorshipBadge level="manual" />
      </div>

      {rows.length > 0 ? (
        <ul className={styles.manualRows}>
          {rows.map((r) => (
            <li key={r.id} className={styles.manualRow}>
              <div className={styles.manualFrom}>
                <span className={styles.manualVendor}>{r.vendor}</span>
                {r.product ? <span className={styles.manualProduct}>{r.product}</span> : null}
                {r.annualSpend > 0 ? (
                  <span className={styles.manualSpend}>
                    {formatCurrency(r.annualSpend)} per year
                  </span>
                ) : (
                  <span className={styles.manualNoSpend}>No spend entered</span>
                )}
              </div>
              <ArrowRight20Filled className={styles.manualArrow} aria-hidden="true" />
              <span className={styles.manualTarget}>{r.target}</span>
              <Button
                appearance="subtle"
                size="small"
                icon={<Delete16Regular />}
                aria-label={`Remove ${r.vendor}`}
                onClick={() => onRemove(r.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.manualEmpty}>
          Nothing added by hand yet. Enter a vendor the customer runs today and the Microsoft
          product that replaces it.
        </p>
      )}

      <div className={styles.manualForm}>
        <Input
          className={styles.manualField}
          value={vendor}
          onChange={(_, d) => setVendor(d.value)}
          placeholder="Vendor"
          aria-label="Vendor"
        />
        <Input
          className={styles.manualField}
          value={product}
          onChange={(_, d) => setProduct(d.value)}
          placeholder="Product (optional)"
          aria-label="Product"
        />
        <Input
          className={styles.manualFieldNarrow}
          value={spend}
          onChange={(_, d) => setSpend(d.value)}
          placeholder="Annual spend"
          aria-label="Annual spend"
          contentBefore="$"
        />
        <Dropdown
          className={styles.manualField}
          value={target}
          selectedOptions={[target]}
          onOptionSelect={(_, d) => setTarget(d.optionValue)}
          aria-label="Replaced by"
        >
          {MICROSOFT_TARGETS.map((t) => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Dropdown>
        <Button appearance="secondary" icon={<Add16Filled />} disabled={!canAdd} onClick={submit}>
          Add mapping
        </Button>
      </div>
      <p className={styles.manualNote}>
        Manually entered spend feeds the cost comparison. It carries no confidence score — you
        stated it, so there is nothing to infer.
      </p>
    </section>
  );
}

export default function CompetitiveDisplacement() {
  const {
    includedDisplacements,
    manualDisplacements,
    sectionAuthorship,
    toggleDisplacement,
    addManualDisplacement,
    removeManualDisplacement,
    businessCase,
    ask,
  } = useAppState();

  const includedCount = includedDisplacements.length;
  const familiesInPlay = new Set(
    DISPLACEMENTS.filter((d) => includedDisplacements.includes(d.id)).map((d) => d.to.family),
  );

  return (
    <div className={styles.root}>
      <SectionHeading
        eyebrow="Stage 3 of 4"
        title="Competitive displacement"
        description="Map what the customer runs today onto the Microsoft products that replace it. The copilot can detect these from the profile, or you can enter them yourself."
        actions={
          <div className={styles.headActions}>
            <AuthorshipBadge level={sectionAuthorship.displacement} />
            <Badge appearance="tint" color={includedCount ? 'brand' : 'informative'}>
              {includedCount + manualDisplacements.length} mapping
              {includedCount + manualDisplacements.length === 1 ? '' : 's'} in the case
            </Badge>
          </div>
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

      <ManualDisplacementEditor
        rows={manualDisplacements}
        onAdd={addManualDisplacement}
        onRemove={removeManualDisplacement}
      />

      <Card className={styles.mapCard}>
        <div className={styles.groupHead}>
          <h3 className={styles.groupTitle}>Detected by the copilot</h3>
          <AuthorshipBadge level="ai" />
        </div>
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
        hint={
          includedCount + manualDisplacements.length === 0
            ? 'A case with no displacements still works — it just rests on operational benefit alone.'
            : 'Next: the results, and the narrative you write around them.'
        }
      />
    </div>
  );
}
