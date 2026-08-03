import React, { useMemo, useState } from 'react';
import { Button, Card, Combobox, Input, Option, Tab, TabList } from '@fluentui/react-components';
import { Checkmark16Filled, Dismiss16Regular } from '@fluentui/react-icons';
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
import { annualPerUserOf, competitorChoices, grantsOf } from '../../data/capabilityModel.js';
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
    addCapabilityRow,
    updateCapabilityRow,
    removeCapabilityRow,
  } = useAppState();


  const base = currentLicenses.find((id) => licenseById(id)?.kind === 'base') || '';
  const paths = pathsFor(base);
  const currentCaps = useMemo(() => grantsOf(currentLicenses), [currentLicenses]);
  const { delta, counts } = capabilityCase;

  const gainedBy = (ids) => [...grantsOf(ids)].filter((c) => !currentCaps.has(c)).length;
  const toggleFuture = (id) =>
    setFutureLicenses(
      futureLicenses.includes(id)
        ? futureLicenses.filter((x) => x !== id)
        : [...futureLicenses, id],
    );

  const listUplift = Math.max(0, annualPerUserOf(futureLicenses) - annualPerUserOf(currentLicenses));
  const groups = competitorChoices(delta);
  const rows = capabilityCompetitors.rows;
  const rowFor = (capId) => rows.find((r) => r.capabilityId === capId);

  /* One draft string per row. Undefined means "not typing", so the field shows
     the committed vendor; a string means the seller is filtering. */
  const [queries, setQueries] = useState({});
  const setQuery = (capId, value) => setQueries((q) => ({ ...q, [capId]: value }));
  const clearQuery = (capId) =>
    setQueries((q) => {
      const next = { ...q };
      delete next[capId];
      return next;
    });

  const pickVendor = (capId, vendor) => {
    const existing = rowFor(capId);
    if (existing && existing.product === vendor) return removeCapabilityRow(existing.id);
    if (existing) return updateCapabilityRow(existing.id, 'product', vendor);
    return addCapabilityRow({ capabilityId: capId, product: vendor });
  };

  return (
    <div className={styles.root}>
      <StepMasthead description="What they own, what they would move to, and what that replaces. The analysis underneath updates as you change either selection." />

      {/* ----------------------------- current state ---------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Which Microsoft license are they on today?</h2>
          <p className={styles.cardLead}>
            One base bundle — the whole current-state inventory. It also decides which upgrade
            paths apply below.
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
                <span className={styles.tileName}>
                  {base === l.id ? (
                    <Checkmark16Filled aria-hidden="true" className={styles.tileCheck} />
                  ) : null}
                  {l.name}
                </span>
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
              : 'Pick a current license above and the applicable paths appear here.'}
          </p>
        </div>

        <TabList selectedValue={futureMode} onTabSelect={(_, d) => setFutureMode(d.value)}>
          <Tab value="path">Upgrade licensing path</Tab>
          <Tab value="products">Individual SKUs</Tab>
        </TabList>

        {futureMode === 'path' ? (
          base ? (
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
            <p className={styles.empty}>Nothing to show until a current license is selected.</p>
          )
        ) : (
          <>
            {/* The orderable add-ons, filtered to what is sold against this
                base. There is no separate product tier any more: a suite and a
                bundle are the same kind of thing, something with a price that
                grants capabilities, and the price list never drew that line. */}
            <ul className={styles.licenseGrid}>
              {(base ? [...BASE_SKUS.filter((b) => b.id !== 'none' && b.id !== base), ...addonsFor(base)] : []).map((item) => {
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
                      <span className={styles.tileName}>
                        {on ? (
                          <Checkmark16Filled aria-hidden="true" className={styles.tileCheck} />
                        ) : null}
                        {item.name}
                      </span>
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
            {!base ? (
              <p className={styles.empty}>Pick a current license above first.</p>
            ) : (
              <p className={styles.cardLead}>
                Bases first, then the add-ons sold against {licenseById(base)?.name}. A customer on
                no bundle at all picks their target base here, or takes one of the starting points
                on the path tab.
              </p>
            )}
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
                      const row = rowFor(c.id);
                      const q = queries[c.id];
                      const typed = q !== undefined ? q : row?.product || '';
                      const matches = c.competitors.filter((v) =>
                        v.toLowerCase().includes((q ?? '').toLowerCase()),
                      );
                      return (
                        <tr key={c.id} className={row?.product ? styles.rowNamed : ''}>
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
                              selectedOptions={row?.product ? [row.product] : []}
                              onChange={(e) => setQuery(c.id, e.target.value)}
                              onOptionSelect={(_, d) => {
                                pickVendor(c.id, d.optionText);
                                clearQuery(c.id);
                              }}
                              onBlur={() => {
                                const v = (q ?? '').trim();
                                if (q !== undefined && v !== (row?.product || '')) {
                                  if (v) pickVendor(c.id, v);
                                  else if (row) removeCapabilityRow(row.id);
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
                            <Input
                              size="small"
                              className={styles.costInput}
                              disabled={!row?.product}
                              value={row?.annualCost || ''}
                              onChange={(_, d) => updateCapabilityRow(row.id, 'annualCost', d.value)}
                              contentBefore="$"
                              aria-label={`Annual cost for ${c.name}`}
                            />
                          </td>
                          <td className={styles.numericCol}>
                            <Input
                              size="small"
                              className={styles.yearInput}
                              disabled={!row?.product}
                              value={row?.yearContractEnds || ''}
                              onChange={(_, d) =>
                                updateCapabilityRow(row.id, 'yearContractEnds', d.value)
                              }
                              placeholder="2027"
                              aria-label={`Contract end year for ${c.name}`}
                            />
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
            ? `${delta.gained.length} gained · ${counts.consolidation} incumbent${counts.consolidation === 1 ? '' : 's'} named · ${delta.strategic.length} net-new.`
            : 'Pick a current license and a future state to see the analysis.'
        }
      />
    </div>
  );
}
