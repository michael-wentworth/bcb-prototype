import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Combobox,
  Input,
  Option,
  Tab,
  TabList,
} from '@fluentui/react-components';
import { Dismiss16Regular } from '@fluentui/react-icons';
import {
  BASE_SKUS,
  SKUS,
  addonsFor,
  annualOf,
  areaById,
  capabilityById,
  entitlementById,
  licenseById,
  pathsFor,
} from '../../data/capabilities.js';
import {
  annualPerUserOf,
  capabilitiesSoldBy,
  competitorChoices,
  grantsOf,
} from '../../data/capabilityModel.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './Capability.module.css';

const BUCKETS = [
  { key: 'retained', name: 'Retained', cls: 'bucketRetained',
    why: 'Already owned and still owned. The floor the case stands on, not part of the return.' },
  { key: 'newMicrosoft', name: 'New Microsoft capabilities', cls: 'bucketNew',
    why: 'Gained in the move, with a market equivalent — each one is a consolidation opportunity until you name the incumbent below.' },
  { key: 'consolidation', name: 'Consolidation opportunities', cls: 'bucketConsolidation',
    why: 'Gained, and you have named who they buy it from. The only capabilities that can carry a saving.' },
  { key: 'strategic', name: 'Net-new strategic', cls: 'bucketStrategic',
    why: 'Gained, with nothing comparable to displace. The argument is capability the estate did not have.' },
];

/**
 * Step 2 — everything about product selection, in one place.
 *
 * Current state, future state, what changes, and what it replaces. They were
 * four screens and that was three too many: the delta is a consequence of the
 * two selections above it, so putting it on its own step made the seller walk
 * away from the controls that produce it. Here, changing a license re-reads the
 * analysis and the mapping underneath without leaving the page.
 */
export default function ProductSelection() {
  const {
    currentLicenses,
    futureMode,
    futurePath,
    futureLicenses,
    negotiatedUplift,
    capabilityCase,
    capabilityCompetitors,
    setCurrentLicenses,
    setFutureMode,
    setFuturePath,
    setFutureLicenses,
    setNegotiatedUplift,
    linkVendor,
    unlinkVendor,
    updateContract,
    removeContract,
  } = useAppState();


  const base = currentLicenses.find((id) => licenseById(id)?.kind === 'base') || '';
  const paths = pathsFor(base);
  const currentCaps = useMemo(() => grantsOf(currentLicenses), [currentLicenses]);
  const { delta, counts, competitorLines } = capabilityCase;

  const gainedBy = (ids) => [...grantsOf(ids)].filter((c) => !currentCaps.has(c)).length;
  const toggleFuture = (id) =>
    setFutureLicenses(
      futureLicenses.includes(id)
        ? futureLicenses.filter((x) => x !== id)
        : [...futureLicenses, id],
    );

  const listUplift = Math.max(0, annualPerUserOf(futureLicenses) - annualPerUserOf(currentLicenses));
  const groups = competitorChoices(delta);
  const contracts = capabilityCompetitors.contracts;
  const mappable = new Set(delta.potentialConsolidation);
  const contractFor = (capId) => contracts.find((c) => c.capabilityIds.includes(capId));

  /* Adding a vendor links it to every mappable capability the catalogue says it
     sells. That is the whole point of the quick-add: a seller holding a list of
     four products should not have to find fourteen rows. Picking the same vendor
     from a single row's dropdown runs the same function, so the two entry paths
     cannot produce different data. */
  const addVendor = (vendor) => {
    const caps = capabilitiesSoldBy(vendor).filter((id) => mappable.has(id));
    linkVendor(vendor, caps.length ? caps : []);
  };

  const allVendors = useMemo(() => {
    const set = new Set();
    groups.forEach((g) => g.capabilities.forEach((c) => c.competitors.forEach((v) => set.add(v))));
    return [...set].sort();
  }, [groups]);

  const [vendorQuery, setVendorQuery] = useState('');
  const vendorMatches = allVendors.filter((v) =>
    v.toLowerCase().includes(vendorQuery.trim().toLowerCase()),
  );

  const [queries, setQueries] = useState({});
  const setQuery = (capId, value) => setQueries((q) => ({ ...q, [capId]: value }));
  const clearQuery = (capId) =>
    setQueries((q) => {
      const next = { ...q };
      delete next[capId];
      return next;
    });

  return (
    <div className={styles.root}>
      <StepMasthead description="What they own, what they would move to, and what that replaces. The analysis underneath updates as you change either selection." />

      {/* ----------------------------- current state ---------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Which Microsoft license are they on today?</h2>
          <p className={styles.cardLead}>
            One base bundle, and the whole current-state inventory. Leave it unselected if they
            are not on a Microsoft bundle — the analysis assumes none rather than asking you to
            say so.
          </p>
        </div>
        <ul className={styles.licenseGrid}>
          {BASE_SKUS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={`${styles.licenseTile} ${base === l.id ? styles.tileOn : ''}`}
                aria-pressed={base === l.id}
                aria-label={`${l.name}, ${l.grants.length} capabilit${l.grants.length === 1 ? 'y' : 'ies'}`}
                onClick={() => setCurrentLicenses(base === l.id ? [] : [l.id])}
              >
                <span className={styles.tileName}>{l.name}</span>
                <span className={styles.tileMeta}>
                  {l.grants.length} capabilit{l.grants.length === 1 ? 'y' : 'ies'} · ${l.pupm}
                  /user/mo
                  {l.source === 'estimate' ? (
                    <span className={styles.estimate} title="Not from the price list">
                      est.
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {/* ----------------------------- future state ----------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Where are they going?</h2>
          <p className={styles.cardLead}>
            {base
              ? `Paths are filtered to what applies from ${licenseById(base)?.name}.`
              : 'No current bundle assumed, so these are starting points rather than upgrades.'}
          </p>
        </div>

        <TabList selectedValue={futureMode} onTabSelect={(_, d) => setFutureMode(d.value)}>
          <Tab value="path">Upgrade licensing path</Tab>
          <Tab value="products">Individual SKUs</Tab>
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
                      <span className={styles.pathGainValue}>+{gainedBy([p.base, ...p.addons])}</span>
                      capabilities
                    </span>
                  </button>
                </li>
            ))}
          </ul>
        ) : (
          <>
            {/* The orderable add-ons, filtered to what is sold against this
                base. There is no separate product tier any more: a suite and a
                bundle are the same kind of thing, something with a price that
                grants capabilities, and the price list never drew that line. */}
            <ul className={styles.licenseGrid}>
              {[...BASE_SKUS.filter((b) => b.id !== base), ...addonsFor(base)].map((item) => {
                const on = futureLicenses.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`${styles.licenseTile} ${on ? styles.tileOn : ''}`}
                      aria-pressed={on}
                      aria-label={`${item.name}, ${item.grants.length} capabilit${item.grants.length === 1 ? 'y' : 'ies'}`}
                      onClick={() => toggleFuture(item.id)}
                    >
                      <span className={styles.tileName}>{item.name}</span>
                      <span className={styles.tileMeta}>
                        {item.grants.length} capabilit{item.grants.length === 1 ? 'y' : 'ies'} · $
                        {item.pupm}/user/mo
                        {item.source === 'estimate' ? (
                          <span className={styles.estimate} title={item.notPerUser || 'Not from the price list'}>
                            est.
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className={styles.cardLead}>
              Bases first, then the add-ons{base ? ` sold against ${licenseById(base)?.name}` : ''}.
              A customer on no bundle picks their target base here, or takes a starting point on
              the path tab.
            </p>
          </>
        )}

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
            The investment is the <strong>difference</strong> between what they pay now and what
            they would pay — the current spend continues either way. List works out at $
            {Math.round(listUplift / 12)}/user/month; leave this blank and the model uses it, which
            overstates the investment on any enterprise agreement.
          </p>
        </div>
      </Card>

      {/* ------------------------------ the delta ------------------------------- */}
      {delta.future.length > 0 ? (
        <Card className={styles.card}>
          <div>
            <h2 className={styles.cardTitle}>
              {delta.gained.length} capabilities gained, {delta.retained.length} retained
            </h2>
            <p className={styles.cardLead}>
              Computed from the two selections above. Only the consolidation bucket can carry a
              saving, and only once you name what it replaces.
            </p>
          </div>
          <div className={styles.buckets}>
            {BUCKETS.map((b) => {
              const ids = delta[b.key] || [];
              const shown = ids.slice(0, 5);
              return (
                <div key={b.key} className={`${styles.bucket} ${styles[b.cls]}`}>
                  <span className={styles.bucketCount}>{counts[b.key] ?? ids.length}</span>
                  <span className={styles.bucketName}>{b.name}</span>
                  <p className={styles.bucketWhy}>{b.why}</p>
                  {ids.length > 0 ? (
                    <ul className={styles.capList}>
                      {shown.map((id) => (
                        <li key={id} className={styles.capChip}>{capabilityById(id)?.name}</li>
                      ))}
                      {ids.length > shown.length ? (
                        <li className={styles.capMore}>+{ids.length - shown.length} more</li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {/* --------------------------- competitor mapping ------------------------- */}
      {groups.length > 0 ? (
        <Card className={styles.card}>
          <div>
            <h2 className={styles.cardTitle}>What are they using for this today?</h2>
            <p className={styles.cardLead}>
              Only the capabilities this move would add. Leave a row blank if nobody supplies it —
              a blank is an honest answer and most rows will be blank. Only named incumbents with a
              cost produce a saving.
            </p>
          </div>

          <div className={styles.quickAdd}>
            <Combobox
              freeform
              className={styles.quickAddBox}
              placeholder="Add a product they already use..."
              value={vendorQuery}
              selectedOptions={[]}
              onChange={(e) => setVendorQuery(e.target.value)}
              onOptionSelect={(_, d) => {
                addVendor(d.optionText);
                setVendorQuery('');
              }}
              aria-label="Add a product the customer already uses"
            >
              {vendorMatches.slice(0, 30).map((v) => (
                <Option key={v} text={v}>{v}</Option>
              ))}
            </Combobox>
            <span className={styles.quickAddHint}>
              Added once, against every capability it covers.
            </span>
          </div>

          {competitorLines.length > 0 ? (
            <ul className={styles.contracts}>
              {competitorLines.map((l) => (
                <li
                  key={l.id}
                  className={`${styles.contract} ${l.blocked ? styles.contractBlocked : ''}`}
                >
                  <div className={styles.contractHead}>
                    <span className={styles.contractVendor}>{l.vendor}</span>
                    <span className={styles.contractCaps}>
                      {l.linked.length} capabilit{l.linked.length === 1 ? 'y' : 'ies'}
                    </span>
                    <Input
                      size="small"
                      className={styles.costInput}
                      value={l.annualCost || ''}
                      onChange={(_, d) => updateContract(l.id, 'annualCost', d.value)}
                      contentBefore="$"
                      placeholder="Annual cost"
                      aria-label={`Annual cost for ${l.vendor}`}
                    />
                    <Input
                      size="small"
                      className={styles.yearInput}
                      value={l.yearContractEnds || ''}
                      onChange={(_, d) => updateContract(l.id, 'yearContractEnds', d.value)}
                      placeholder="Ends"
                      aria-label={`Contract end year for ${l.vendor}`}
                    />
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Dismiss16Regular />}
                      aria-label={`Remove ${l.vendor}`}
                      onClick={() => removeContract(l.id)}
                    />
                  </div>
                  {l.reason ? <p className={styles.contractReason}>{l.reason}</p> : null}
                  {l.blocked ? (
                    <Checkbox
                      label="They do not use it for those - count this contract"
                      checked={!!l.soleUseConfirmed}
                      onChange={(_, d) => updateContract(l.id, 'soleUseConfirmed', !!d.checked)}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <div className={styles.tableWrap}>
            <table className={styles.mapTable}>
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  <th scope="col">Microsoft delivers it with</th>
                  <th scope="col">Current vendor</th>
                  <th scope="col" className={styles.numericCol}>Annual cost</th>
                  <th scope="col" className={styles.numericCol}>Contract ends</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <React.Fragment key={`${g.area}:${g.group}`}>
                    <tr className={styles.groupRow}>
                      <th scope="colgroup" colSpan={5}>
                        {g.group}
                        <span className={styles.groupArea}>{areaById(g.area)?.label}</span>
                      </th>
                    </tr>
                    {g.capabilities.map((c) => {
                      const ctr = contractFor(c.id);
                      const q = queries[c.id];
                      const typed = q !== undefined ? q : ctr?.vendor || '';
                      const matches = c.competitors.filter((v) =>
                        v.toLowerCase().includes((q ?? '').toLowerCase()),
                      );
                      return (
                        <tr key={c.id} className={ctr ? styles.rowNamed : ''}>
                          <th scope="row" className={styles.capCell}>{c.name}</th>
                          <td className={styles.msCell}>{c.product}</td>
                          <td>
                            {/* Freeform so it doubles as a search box and still
                                accepts a vendor the catalogue has never heard
                                of — there are more of those than there are
                                entries in any list we could ship. */}
                            <Combobox
                              size="small"
                              freeform
                              className={styles.vendorPicker}
                              placeholder="Search or type…"
                              value={typed}
                              selectedOptions={ctr ? [ctr.vendor] : []}
                              onChange={(e) => setQuery(c.id, e.target.value)}
                              onOptionSelect={(_, d) => {
                                addVendor(d.optionText);
                                clearQuery(c.id);
                              }}
                              onBlur={() => {
                                const v = (q ?? '').trim();
                                if (q !== undefined && v !== (ctr?.vendor || '')) {
                                  if (v) linkVendor(v, [c.id]);
                                  else if (ctr) unlinkVendor(ctr.id, c.id);
                                }
                                clearQuery(c.id);
                              }}
                              aria-label={`Current vendor for ${c.name}`}
                            >
                              {matches.map((v) => (
                                <Option key={v} text={v}>{v}</Option>
                              ))}
                              {matches.length === 0 ? (
                                <Option key="__none" text={typed} disabled>
                                  No match — press Tab to use what you typed
                                </Option>
                              ) : null}
                            </Combobox>
                          </td>
                          <td className={styles.numericCol}>
                            {/* Cost and end year belong to the contract, not to
                                each capability it covers - editing them per row
                                would ask the same question up to nine times. */}
                            <span className={styles.rowEcho}>
                              {ctr?.annualCost ? `$${Number(ctr.annualCost).toLocaleString()}` : '-'}
                            </span>
                          </td>
                          <td className={styles.numericCol}>
                            <span className={styles.rowEcho}>{ctr?.yearContractEnds || '-'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <StepFooter
        hint={
          delta.future.length
            ? `${delta.gained.length} gained · ${contracts.length} contract${contracts.length === 1 ? '' : 's'} named · ${delta.strategic.length} net-new.`
            : 'Pick a future state to see the analysis.'
        }
      />
    </div>
  );
}
