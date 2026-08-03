import React from 'react';
import { Card } from '@fluentui/react-components';
import { Checkmark16Filled } from '@fluentui/react-icons';
import { ADDON_LICENSES, BASE_LICENSES, licenseById } from '../../data/capabilities.js';
import { grantsOf } from '../../data/capabilityModel.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import CustomerFields from './CustomerFields.jsx';
import styles from './Capability.module.css';

/**
 * Step 1 — what the customer owns today.
 *
 * This is the entire current-state inventory. Naming a base licence and any
 * add-ons is enough, because the capability model already knows what each one
 * grants; asking a seller to list the products underneath would be asking them
 * to retype the licence agreement.
 *
 * The base is single-select on purpose. A customer sits on one bundle, and
 * allowing two would make the delta ambiguous about which one the future state
 * replaces.
 */
export default function CurrentEnvironment() {
  const { currentLicenses, setCurrentLicenses } = useAppState();

  const base = currentLicenses.find((id) => licenseById(id)?.kind === 'base') || '';
  const addons = currentLicenses.filter((id) => licenseById(id)?.kind === 'addon');
  const owned = grantsOf(currentLicenses);

  const pickBase = (id) => {
    const next = id === base ? addons : [id, ...addons];
    setCurrentLicenses(next);
  };

  const toggleAddon = (id) => {
    const next = addons.includes(id) ? addons.filter((a) => a !== id) : [...addons, id];
    setCurrentLicenses([base, ...next].filter(Boolean));
  };

  return (
    <div className={styles.root}>
      <StepMasthead
        description="Name what the customer is licensed for today. The capability model works out what that gives them — there is no product inventory to complete."
      />

      <CustomerFields />

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Which Microsoft licence are they on?</h2>
          <p className={styles.cardLead}>
            One base bundle. Everything the future state is measured against starts here, and it
            also decides which upgrade paths you are shown on the next step.
          </p>
        </div>

        <ul className={styles.tiles}>
          {BASE_LICENSES.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={`${styles.tile} ${base === l.id ? styles.tileOn : ''}`}
                aria-pressed={base === l.id}
                aria-label={`${l.name}, ${l.grants.length} capabilities`}
                onClick={() => pickBase(l.id)}
              >
                <span className={styles.tileName}>
                  {base === l.id ? (
                    <Checkmark16Filled aria-hidden="true" className={styles.tileCheck} />
                  ) : null}
                  {l.name}
                </span>
                <span className={styles.tileMeta}>
                  {l.grants.length} capabilities · ${l.annualPerUser}/user/yr list
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Anything on top of that?</h2>
          <p className={styles.cardLead}>
            Add-ons the customer already holds. Skip this if they are on the base bundle alone —
            anything you miss shows up on the next step as a capability they would gain, which is
            the safer direction to be wrong in.
          </p>
        </div>

        <ul className={styles.tiles}>
          {ADDON_LICENSES.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={`${styles.tile} ${addons.includes(l.id) ? styles.tileOn : ''}`}
                aria-pressed={addons.includes(l.id)}
                aria-label={`${l.name}, ${l.grants.length} capabilities`}
                onClick={() => toggleAddon(l.id)}
              >
                <span className={styles.tileName}>
                  {addons.includes(l.id) ? (
                    <Checkmark16Filled aria-hidden="true" className={styles.tileCheck} />
                  ) : null}
                  {l.name}
                </span>
                <span className={styles.tileMeta}>{l.grants.length} capabilities</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <StepFooter
        hint={
          base
            ? `${owned.size} capabilities owned today across ${currentLicenses.length} licence${currentLicenses.length === 1 ? '' : 's'}.`
            : 'Pick a base licence to continue.'
        }
      />
    </div>
  );
}
