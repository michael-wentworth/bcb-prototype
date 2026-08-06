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
  CURRENT_BUNDLES,
  SKUS,
  SOLUTION_AREAS,
  addonsFor,
  annualOf,
  areaById,
  capabilityById,
  entitlementById,
  futureOf,
  licenseById,
  pathsFor,
} from '../../data/capabilities.js';
import {
  CASE_START_YEAR,
  capabilitiesSoldBy,
  futureCapabilityGroups,
  grantsOf,
} from '../../data/capabilityModel.js';
import { AUTHORSHIP } from '../../data/authoring.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import FormField from '../shared/FormField.jsx';
import ConfidenceBadge from '../shared/ConfidenceBadge.jsx';
import LicensingImpact from './LicensingImpact.jsx';
import StepMasthead from '../shared/StepMasthead.jsx';
import StepFooter from '../shared/StepFooter.jsx';
import styles from './Capability.module.css';

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
    customer,
    caseSetup,
    fieldMeta,
    currentLicenses,
    futureMode,
    futurePath,
    futureLicenses,
    seatsByLicense,
    rateByLicense,
    capabilityCase,
    capabilityCompetitors,
    setCurrentLicenses,
    setFutureMode,
    setFuturePath,
    setFutureLicenses,
    setLicenseSeats,
    setLicenseRate,
    linkVendor,
    unlinkVendor,
    updateContract,
    removeContract,
  } = useAppState();

  const base = currentLicenses.find((id) => licenseById(id)?.kind === 'base') || '';
  /* Paths are matched against the whole current selection, not just the base:
     "Office 365 E3 + EMS E3 to ... + Purview Suite" starts from two licenses,
     and keying on one of them could not express it. */
  const paths = pathsFor(currentLicenses);
  const years = Array.from(
    { length: Math.max(1, Number(caseSetup.analysisPeriod) || 3) },
    (_, i) => CASE_START_YEAR + i,
  );
  const defaultSeats = String(customer.numberOfUsers || '');
  /* One bundle at a time, and clicking the selected one clears it - which is
     how the customer gets back to unlicensed without a tile that says so. */
  const bundleOn = (b) =>
    b.skus.length === currentLicenses.length && b.skus.every((id) => currentLicenses.includes(id));
  const pickBundle = (b) => setCurrentLicenses(bundleOn(b) ? [] : b.skus);
  const currentCaps = useMemo(() => grantsOf(currentLicenses), [currentLicenses]);
  const { delta, competitorLines } = capabilityCase;

  /* Names, not counts. "12 capabilities" is precise about a number nobody in
     the room can check and silent about the thing being chosen between, which
     is coverage. Solution areas say what a bundle reaches without asserting a
     figure that invites an argument about which twelve. */
  const areaLabels = (capIds = []) => {
    const seen = new Set(capIds.map((id) => capabilityById(id)?.area));
    return SOLUTION_AREAS.filter((a) => seen.has(a.id)).map((a) => a.label);
  };
  const gainedAreas = (ids) =>
    areaLabels([...grantsOf(ids)].filter((c) => !currentCaps.has(c)));
  const areaSummary = (capIds) => areaLabels(capIds).join(' · ') || 'No security capabilities';
  const toggleFuture = (id) =>
    setFutureLicenses(
      futureLicenses.includes(id)
        ? futureLicenses.filter((x) => x !== id)
        : [...futureLicenses, id],
    );

  /* Every capability the future state delivers, not only the new ones. The
     table is now the answer to "what will they have", which is why the separate
     four-bucket card above it could go. */
  const groups = futureCapabilityGroups(delta);
  const contracts = capabilityCompetitors.contracts;
  const contractFor = (capId) => contracts.find((c) => c.capabilityIds.includes(capId));
  /* Which bundle already grants it. Naming the license is more use than naming
     the product again — the "Microsoft delivers it with" column beside it
     already says the product. */
  const ownedVia = (capId) =>
    currentLicenses
      .map((id) => licenseById(id))
      .filter(Boolean)
      .find((l) => l.grants.includes(capId))?.name || 'Microsoft';

  /* Adding a vendor links it to every mappable capability the catalogue says it
     sells. That is the whole point of the quick-add: a seller holding a list of
     four products should not have to find fourteen rows. Picking the same vendor
     from a single row's dropdown runs the same function, so the two entry paths
     cannot produce different data. */
  const addVendor = (vendor, capId) => {
    const name = (vendor || '').trim();
    if (!name) return;
    /* A vendor in the catalogue links to everything it sells that this move
       adds. One we have never heard of links to nothing, because we have no
       claim about what it covers — the seller says where it applies, and the
       partial-cover rule stays quiet rather than blocking a contract on a gap
       we invented.

       `capId` is the row it was picked from, and it is always included. The
       catalogue filter is right for the quick-add but wrong for a row: it drops
       any capability the model calls strategic, so picking a vendor on the
       Security AI Assistant row linked to nothing and the field went straight
       back to empty. A dropdown that offers a choice has to keep it. */
    const fromCatalogue = capabilitiesSoldBy(name);
    linkVendor(name, capId ? [...new Set([capId, ...fromCatalogue])] : fromCatalogue);
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

  /* Every capability this move adds, flat, for the card-level picker. Retained
     ones are excluded: Microsoft already supplies them, so there is nothing for
     a competitor contract to attach to. */
  const linkable = useMemo(
    () => groups.flatMap((g) => g.capabilities).filter((c) => !c.retained),
    [groups],
  );
  const [linkQueries, setLinkQueries] = useState({});
  const setLinkQuery = (id, value) => setLinkQueries((q) => ({ ...q, [id]: value }));
  const linkableFor = (l) => {
    const q = (linkQueries[l.id] || '').trim().toLowerCase();
    return linkable.filter(
      (c) => !l.capabilityIds.includes(c.id) && (!q || c.name.toLowerCase().includes(q)),
    );
  };

  /* Same pill step 1 uses. It renders only where the copilot supplied the
     value, and turns into "Confirmed by you" the moment the seller changes it —
     the rate especially, which is a placeholder rather than a quote. */
  /* Per row, from the row's own authorship — not from the one global fieldMeta
     key the fill stamps. Reading the global key branded every contract as the
     copilot's, including vendors the seller typed themselves, and left the
     green "Confirmed by you" state unreachable for the whole list. */
  const contractBadge = (contract) => {
    if (contract.authorship === AUTHORSHIP.AI) {
      const m = fieldMeta.capabilityContracts;
      return (
        <ConfidenceBadge
          level={m?.confidence || 'medium'}
          basis={m?.basis}
          evidence={m?.evidence}
          ai
          compact
        />
      );
    }
    /* ASSISTED means the seller has corrected a row the copilot created. A row
       they authored outright carries no badge at all — there is no provenance
       claim to make about it. */
    if (contract.authorship === AUTHORSHIP.ASSISTED) {
      return <ConfidenceBadge level="confirmed" compact />;
    }
    return null;
  };

  const badge = (key) => {
    const m = fieldMeta[key];
    if (!m) return null;
    return (
      <ConfidenceBadge
        level={m.confidence}
        basis={m.basis}
        evidence={m.evidence}
        ai={m.source === 'ai'}
        compact
      />
    );
  };

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
      <StepMasthead description="Licensing today, the future state, and what it replaces" />

      {/* ----------------------------- current state ---------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>
            Which Microsoft bundle is the customer on today?{' '}
            {badge('currentLicenses')}
          </h2>
          <p className={styles.cardLead}>Leave unselected if none apply</p>
        </div>
        {/* Six options, because that is what a seller is actually asked. One of
            them is two licenses, which is the whole reason the current state is
            a set rather than a single id. */}
        <ul className={styles.licenseGrid}>
          {CURRENT_BUNDLES.map((bundle) => {
            const on = bundleOn(bundle);
            const summary = areaSummary([...grantsOf(bundle.skus)]);
            return (
              <li key={bundle.id}>
                <button
                  type="button"
                  className={`${styles.licenseTile} ${on ? styles.tileOn : ''}`}
                  aria-pressed={on}
                  aria-label={`${bundle.name}, ${summary}`}
                  onClick={() => pickBundle(bundle)}
                >
                  <span className={styles.tileName}>{bundle.name}</span>
                  <span className={styles.tileMeta}>{summary}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ----------------------------- future state ----------------------------- */}
      <Card className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>
            Where is the customer going?{' '}
            {badge('futurePath')}
          </h2>
          <p className={styles.cardLead}>
            {currentLicenses.length
              ? `Paths from ${currentLicenses
                  .map((id) => licenseById(id)?.name)
                  .filter(Boolean)
                  .join(' + ')}`
              : 'No current bundle, so these are starting points, not upgrades'}
          </p>
        </div>

        <TabList selectedValue={futureMode} onTabSelect={(_, d) => setFutureMode(d.value)}>
          <Tab value="path">Upgrade path</Tab>
          <Tab value="products">Individual SKUs</Tab>
        </TabList>

        {futureMode === 'path' ? (
          <ul className={styles.paths}>
              {paths.map((p) => {
                const adds = gainedAreas(futureOf(p, currentLicenses));
                return (
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
                      {adds.length ? (
                        <span className={styles.pathGain}>Adds {adds.join(', ')}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
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
                      aria-label={`${item.name}, ${areaSummary(item.grants)}`}
                      onClick={() => toggleFuture(item.id)}
                    >
                      <span className={styles.tileName}>{item.name}</span>
                      <span className={styles.tileMeta}>{areaSummary(item.grants)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className={styles.cardLead}>
              Bases first, then add-ons{base ? ` for ${licenseById(base)?.name}` : ''}
            </p>
          </>
        )}

        {/* Part of the same question, not a card of its own. Choosing where they
            go and saying how many seats go with it is one decision, and putting
            a card boundary through it made the second half read as unrelated. */}
        {futureLicenses.length > 0 ? (
          <>
            {/* Wrapped, so the Card's own flex gap separates this block from the
                paths above rather than landing between the heading and its own
                lead — which is what pushed them 37px apart. */}
            <div className={styles.subSection}>
              <h3 className={styles.subHead}>How many seats?{' '}{badge('rateByLicense')}</h3>
              <p className={styles.cardLead}>Autofilled from step 1 and the price list</p>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.mapTable}>
                <thead>
                  <tr>
                    <th scope="col">License</th>
                    {years.map((y) => (
                      <th key={y} scope="col" className={styles.numericCol}>{y} seats</th>
                    ))}
                    <th scope="col" className={styles.numericCol}>Rate /user/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {futureLicenses.map((id) => {
                    const sku = licenseById(id);
                    if (!sku) return null;
                    return (
                      <tr key={id}>
                        <th scope="row" className={styles.capCell}>{sku.name}</th>
                        {years.map((y, i) => (
                          <td key={y} className={styles.numericCol}>
                            <Input
                              size="small"
                              className={styles.yearInput}
                              value={seatsByLicense[id]?.[i] ?? defaultSeats}
                              onChange={(_, d) => setLicenseSeats(id, i, d.value)}
                              aria-label={`${sku.name} seats in ${y}`}
                            />
                          </td>
                        ))}
                        <td className={styles.numericCol}>
                          <Input
                            size="small"
                            className={styles.yearInput}
                            contentBefore="$"
                            value={rateByLicense[id] ?? String(sku.pupm)}
                            onChange={(_, d) => setLicenseRate(id, d.value)}
                            aria-label={`${sku.name} rate per user per month`}
                          />
                          {sku.notPerUser ? (
                            <span className={styles.rowEcho}>{sku.notPerUser}</span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </Card>

      {/* Under the recommendation it prices, and above the mapping that changes
          it — moving one incumbent in the table below moves these three figures,
          which is the argument for showing them here rather than only on the
          report. */}
      <LicensingImpact />

      {/* --------------------------- competitor mapping ------------------------- */}
      {groups.length > 0 ? (
        <Card className={styles.card}>
          <div>
            <h2 className={styles.cardTitle}>What the customer would have, and who supplies it today</h2>
            <p className={styles.cardLead}>Name the incumbent where there is one</p>
          </div>

          <div className={styles.quickAdd}>
            <Combobox
              freeform
              className={styles.quickAddBox}
              placeholder="Add a product the customer uses…"
              value={vendorQuery}
              selectedOptions={[]}
              onChange={(e) => setVendorQuery(e.target.value)}
              onOptionSelect={(_, d) => {
                addVendor(d.optionText);
                setVendorQuery('');
              }}
              /* Freeform, so a product the catalogue does not carry is typed and
                 kept rather than silently dropped. 346 entries is nowhere near
                 the whole market and never will be. */
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                addVendor(vendorQuery);
                setVendorQuery('');
              }}
              /* Same rule as the rows: blur discards. Clicking away mid-word
                 used to add a vendor called "Crowd". Enter, or the explicit
                 "Add … — not in the list" option, both still commit. */
              onBlur={() => setVendorQuery('')}
              aria-label="Add a product the customer uses"
            >
              {vendorMatches.slice(0, 30).map((v) => (
                <Option key={v} text={v}>{v}</Option>
              ))}
              {vendorQuery.trim() && !vendorMatches.some((v) => v.toLowerCase() === vendorQuery.trim().toLowerCase()) ? (
                <Option key="__custom" text={vendorQuery.trim()}>
                  Add &ldquo;{vendorQuery.trim()}&rdquo;
                </Option>
              ) : null}
            </Combobox>
            <span className={styles.quickAddHint}>
              Type any name to add one we do not list
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
                    <span className={styles.contractVendor}>
                      {l.vendor} {contractBadge(l)}
                    </span>
                    {/* What the seller said it covers, not what the model can
                        price. `linked` is narrowed to displaceable capabilities,
                        so a contract named against a net-new one reported itself
                        as unlinked while the row above plainly showed it. */}
                    <span className={styles.contractCaps}>
                      {l.capabilityIds.length
                        ? l.capabilityIds
                            .map((id) => capabilityById(id)?.name)
                            .filter(Boolean)
                            .join(', ')
                        : 'Not linked yet'}
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
                  {l.capabilityIds.length === 0 ? (
                    <p className={styles.contractReason}>
                      Not in our catalogue, so say where it applies.
                    </p>
                  ) : l.reason ? (
                    <p className={styles.contractReason}>{l.reason}</p>
                  ) : null}
                  {/* A product the catalogue has never heard of has to be given
                      its capabilities by hand, and sending the seller off to
                      hunt for the right row to do it was the long way round. */}
                  <Combobox
                    size="small"
                    className={styles.contractLink}
                    placeholder="Link to a capability…"
                    value={linkQueries[l.id] ?? ''}
                    selectedOptions={[]}
                    onChange={(e) => setLinkQuery(l.id, e.target.value)}
                    onOptionSelect={(_, d) => {
                      const cap = linkable.find((c) => c.name === d.optionText);
                      if (cap) linkVendor(l.vendor, [cap.id]);
                      setLinkQuery(l.id, '');
                    }}
                    aria-label={`Link ${l.vendor} to a capability`}
                  >
                    {linkableFor(l).slice(0, 40).map((c) => (
                      <Option key={c.id} text={c.name}>{c.name}</Option>
                    ))}
                  </Combobox>
                  {l.blocked ? (
                    <Checkbox
                      label="The customer does not use it for those, so count this contract"
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
                  <th scope="col">Microsoft product</th>
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
                        {/* Area first: it is the parent — Entra owns four of
                            these groups — and leading with the group put the
                            child above the parent. The separator is a real
                            element so the two can never run together, which is
                            how this read as "Endpoint managementIntune". */}
                        <span className={styles.groupArea}>{areaById(g.area)?.label}</span>{' '}
                        <span className={styles.groupSep} aria-hidden="true">·</span>{' '}
                        <span className={styles.groupName}>{g.group}</span>
                      </th>
                    </tr>
                    {g.capabilities.map((c) => {
                      const ctr = contractFor(c.id);
                      const q = queries[c.id];
                      const typed = q !== undefined ? q : ctr?.vendor || '';
                      const matches = c.competitors.filter((v) =>
                        v.toLowerCase().includes((q ?? '').toLowerCase()),
                      );
                      /* Already owned means the answer to "who supplies this
                         today" is Microsoft, and there is no contract to
                         displace. Showing an empty dropdown there invited a
                         seller to claim a saving against something the customer
                         is not paying anyone else for. */
                      if (c.retained) {
                        return (
                          <tr key={c.id} className={styles.rowOwned}>
                            <th scope="row" className={styles.capCell}>{c.name}</th>
                            <td className={styles.msCell}>{c.product}</td>
                            <td>
                              <span className={styles.ownedVendor}>{ownedVia(c.id)}</span>
                              <span className={styles.rowEcho}>Already owned</span>
                            </td>
                            <td className={styles.numericCol} />
                            <td className={styles.numericCol} />
                          </tr>
                        );
                      }
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
                              clearable
                              className={styles.vendorPicker}
                              placeholder="Search or type…"
                              value={typed}
                              selectedOptions={ctr ? [ctr.vendor] : []}
                              /* Emptying the box removes the vendor, and this is
                                 the only place that decides it. Fluent's clear
                                 glyph empties the input, so it lands here too. */
                              onChange={(e) => {
                                const v = e.target.value;
                                setQuery(c.id, v);
                                if (v.trim() === '' && ctr) unlinkVendor(ctr.id, c.id);
                              }}
                              /* Fluent fires onOptionSelect with no option for
                                 two different things: its clear glyph, and
                                 freeform text merely drifting away from the
                                 committed value. Treating the second as a clear
                                 unlinked the contract mid-word and swallowed the
                                 keystroke that caused it — typing over a name
                                 left the box empty. onChange owns clearing; this
                                 handler only commits real choices. */
                              onOptionSelect={(ev, d) => {
                                if (!d.optionText) {
                                  /* Fluent fires this with no option for two
                                     different things: its clear glyph, and
                                     freeform text drifting off the committed
                                     value. They are told apart by what is
                                     actually in the box — the glyph empties it
                                     first, drifting never does. Reading the live
                                     input rather than our own draft state, which
                                     has not re-rendered yet at this point. */
                                  const live =
                                    ev?.currentTarget?.querySelector?.('input')?.value ?? '';
                                  if (live.trim() === '' && ctr) unlinkVendor(ctr.id, c.id);
                                  return;
                                }
                                /* One vendor per row. Replacing the name has to
                                   detach the old contract from this capability
                                   first, or both stay attached and the case
                                   counts two incumbents for one capability. */
                                if (ctr && ctr.vendor !== d.optionText) {
                                  unlinkVendor(ctr.id, c.id);
                                }
                                addVendor(d.optionText, c.id);
                                clearQuery(c.id);
                              }}
                              /* Blur discards a draft, it does not commit one.
                                 Committing whatever was left in the box turned a
                                 half-finished edit of "Forcepoint DLP" into a
                                 second vendor called "Forcepoint DL" — deleting
                                 part of a name and clicking away created junk
                                 rather than removing anything. Choosing an
                                 option, including "Add … — not in the list", is
                                 the only way to commit.

                                 An empty box is the exception, and is the
                                 keyboard route to the clear glyph, which Fluent
                                 renders aria-hidden. */
                              onBlur={() => {
                                if (q !== undefined && q.trim() === '' && ctr) {
                                  unlinkVendor(ctr.id, c.id);
                                }
                                clearQuery(c.id);
                              }}
                              aria-label={`Current vendor for ${c.name}`}
                            >
                              {matches.map((v) => (
                                <Option key={v} text={v}>{v}</Option>
                              ))}
                              {typed.trim() &&
                              !matches.some((v) => v.toLowerCase() === typed.trim().toLowerCase()) ? (
                                <Option key="__custom" text={typed.trim()}>
                                  Add &ldquo;{typed.trim()}&rdquo;
                                </Option>
                              ) : null}
                            </Combobox>
                            {!c.mappable ? (
                              <span className={styles.rowEcho}>Net-new, no saving counted</span>
                            ) : null}
                          </td>
                          <td className={styles.numericCol}>
                            {/* Cost and end year belong to the contract, not to
                                each capability it covers - editing them per row
                                would ask the same question up to nine times. */}
                            <span className={styles.rowEcho}>
                              {ctr?.annualCost ? `$${Number(ctr.annualCost).toLocaleString()}` : ''}
                            </span>
                          </td>
                          <td className={styles.numericCol}>
                            <span className={styles.rowEcho}>{ctr?.yearContractEnds || ''}</span>
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
            ? 'Name an incumbent to turn a capability into a saving'
            : 'Pick a future state to see the analysis'
        }
      />
    </div>
  );
}
