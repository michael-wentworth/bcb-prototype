import React, { useMemo, useState } from 'react';
import { Card, Input, Tab, TabList } from '@fluentui/react-components';
import { Checkmark16Filled } from '@fluentui/react-icons';
import {
  ADDON_LICENSES,
  BASE_LICENSES,
  MICROSOFT_PRODUCTS,
  SOLUTION_AREAS,
  entitlementById,
  licenseById,
  pathsFor,
} from '../../data/capabilities.js';
import { annualPerUserOf, grantsOf } from '../../data/capabilityModel.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './Capability.module.css';

/**
 * Step 2 — what they would move to.
 *
 * Two routes to the same place. A path is the fast one: it names a base and its
 * add-ons in a single click, and only paths that start from the licence chosen on
 * step 1 are offered, so a customer already on E5 is never shown "E3 to E5".
 *
 * The slow route exists because sellers often know exactly what they are
 * quoting. Either way the selection resolves to capabilities, so a case built
 * from single products is identical to one built from a bundle containing them.
 *
 * Both modes stack: a path can be extended with add-ons and individual products
 * without leaving it, because "E5 plus Security Copilot plus Entra Governance"
 * is a real deal shape and forcing it into one canned path would not be.
 */
export default function FutureEnvironment() {
  const {
    currentLicenses,
    futureMode,
    futurePath,
    futureLicenses,
    negotiatedUplift,
    setFutureMode,
    setFuturePath,
    setFutureLicenses,
    setNegotiatedUplift,
  } = useAppState();

  const [area, setArea] = useState('entra');

  const currentBase = currentLicenses.find((id) => licenseById(id)?.kind === 'base') || '';
  const paths = pathsFor(currentBase);
  const currentCaps = useMemo(() => grantsOf(currentLicenses), [currentLicenses]);
  const futureCaps = useMemo(() => grantsOf(futureLicenses), [futureLicenses]);

  const gainedBy = (ids) => {
    const g = grantsOf(ids);
    return [...g].filter((c) => !currentCaps.has(c)).length;
  };

  const toggle = (id) => {
    const next = futureLicenses.includes(id)
      ? futureLicenses.filter((x) => x !== id)
      : [...futureLicenses, id];
    setFutureLicenses(next);
  };

  const listUplift = Math.max(0, annualPerUserOf(futureLicenses) - annualPerUserOf(currentLicenses));
  const gained = [...futureCaps].filter((c) => !currentCaps.has(c)).length;

  if (!currentBase) {
    return (
      <div className={styles.root}>
        <StepMasthead description="Pick what the customer would move to. The capability inventory follows from it." />
        <Card className={styles.card}>
          <p className={styles.empty}>
            Choose the customer's current licence on the previous step first — the paths offered
            here depend on where they are starting from.
          </p>
        </Card>
        <StepFooter hint="Nothing to compare against yet." />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <StepMasthead description="Pick a licensing path, or assemble the future state product by product. Either way the capability inventory follows from it." />

      <Card className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Where are they going?</h2>
            <p className={styles.cardLead}>
              Paths are filtered to what applies from {licenseById(currentBase)?.name}. You can
              extend whichever you pick below.
            </p>
          </div>
        </div>

        <TabList selectedValue={futureMode} onTabSelect={(_, d) => setFutureMode(d.value)}>
          <Tab value="path">Licensing path</Tab>
          <Tab value="products">Individual products</Tab>
        </TabList>

        {futureMode === 'path' ? (
          <ul className={styles.paths}>
            {paths.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`${styles.path} ${futurePath === p.id ? styles.pathOn : ''}`}
                  aria-pressed={futurePath === p.id}
                  onClick={() => setFuturePath(p)}
                >
                  <span>
                    <span className={styles.pathLabel}>{p.label}</span>
                    <span className={styles.pathNote}>{p.note}</span>
                  </span>
                  <span className={styles.pathGain}>
                    <span className={styles.pathGainValue}>
                      +{gainedBy([p.base, ...p.addons])}
                    </span>
                    capabilities
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className={styles.groupLabel}>Base licence</p>
            <ul className={styles.tiles}>
              {BASE_LICENSES.map((l) => (
                <Tile key={l.id} item={l} on={futureLicenses.includes(l.id)} onClick={() => toggle(l.id)} />
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>
            {futureMode === 'path' ? 'Anything on top of the path?' : 'Add-on suites'}
          </h2>
          <p className={styles.cardLead}>
            Suites stack on whatever is selected above. Pick as many as the deal actually includes.
          </p>
        </div>
        <ul className={styles.tiles}>
          {ADDON_LICENSES.map((l) => (
            <Tile key={l.id} item={l} on={futureLicenses.includes(l.id)} onClick={() => toggle(l.id)} />
          ))}
        </ul>
      </Card>

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Individual products</h2>
          <p className={styles.cardLead}>
            For a deal quoted at the product level. Selecting one that a suite above already covers
            changes nothing — capabilities are deduped, so you cannot double-count by picking both.
          </p>
        </div>
        <TabList selectedValue={area} onTabSelect={(_, d) => setArea(d.value)}>
          {SOLUTION_AREAS.map((a) => (
            <Tab key={a.id} value={a.id}>{a.label}</Tab>
          ))}
        </TabList>
        <ul className={styles.tiles}>
          {MICROSOFT_PRODUCTS.filter((p) => p.area === area).map((p) => (
            <Tile key={p.id} item={p} on={futureLicenses.includes(p.id)} onClick={() => toggle(p.id)} />
          ))}
        </ul>
      </Card>

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>What will they pay for the uplift?</h2>
          <p className={styles.cardLead}>
            The investment is the <strong>difference</strong> between what they pay now and what
            they would pay — not the whole future bill, because the current spend continues either
            way. List works out at ${Math.round(listUplift / 12)}/user/month; an estate this size
            does not pay rate card, so enter what you expect to land.
          </p>
        </div>
        <div className={styles.uplift}>
          <FormField label="Negotiated uplift" help="Per user, per month, above what they pay today">
            <Input
              value={negotiatedUplift}
              onChange={(_, d) => setNegotiatedUplift(d.value)}
              placeholder={String(Math.round(listUplift / 12) || 0)}
              contentBefore="$"
            />
          </FormField>
          <p className={styles.cardLead}>
            Leave it blank and the model falls back to list, which will overstate the investment on
            any enterprise agreement.
          </p>
        </div>
      </Card>

      <StepFooter
        hint={
          futureLicenses.length
            ? `${gained} capabilities gained, ${futureCaps.size} in the future state.`
            : 'Pick a path or a product to continue.'
        }
      />
    </div>
  );
}

function Tile({ item, on, onClick }) {
  const e = entitlementById(item.id) || item;
  return (
    <li>
      <button
        type="button"
        className={`${styles.tile} ${on ? styles.tileOn : ''}`}
        aria-pressed={on}
        aria-label={`${item.name}, ${e.grants.length} capabilities`}
        onClick={onClick}
      >
        <span className={styles.tileName}>
          {on ? <Checkmark16Filled aria-hidden="true" className={styles.tileCheck} /> : null}
          {item.name}
        </span>
        <span className={styles.tileMeta}>
          {e.grants.length} capabilit{e.grants.length === 1 ? 'y' : 'ies'} · ${item.annualPerUser}/user/yr
        </span>
      </button>
    </li>
  );
}
