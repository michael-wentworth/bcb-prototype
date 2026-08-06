/* ---------------------------------------------------------------------------
   The executive report, derived once.

   Nine sections read from this and nothing else, so no two of them can disagree
   about the same deal. Everything here comes from buildCapabilityCase and
   buildConfidence; where a figure the brief asked for does not exist in the
   model, this says so rather than inventing one.

   Four rules the numbers depend on.

   ROI and payback are NULLABLE. The model returns null for both when there is
   no investment to return on, and rendering that as 0% or 0 months states the
   opposite of what it means.

   "What the customer has today" is not delta.current. That set is the Microsoft
   bundle alone, so reading it as today's coverage claims the customer has no
   single sign-on while they are paying Okta for exactly that. Today is the union
   of the Microsoft bundle and every capability a named contract covers.

   "After" is not delta.future either. A vendor that cannot be displaced keeps
   running and keeps covering what it covers, so the future estate is the
   Microsoft future state plus every surviving contract. This is what makes the
   coverage row reconcile: today + gained − lost = after, exactly.

   Coverage is counted, never judged. "Partial" at solution-area level is
   arithmetic — some of the capabilities in the area, not all — and the fraction
   is always printed beside it. There is no per-capability partial state,
   because grantsOf builds a Set and set membership has no middle.
   --------------------------------------------------------------------------- */

import {
  CAPABILITIES,
  SOLUTION_AREAS,
  capabilityById,
  entitlementById,
  licenseById,
} from './capabilities.js';
import { CASE_START_YEAR, num } from './capabilityModel.js';

const uniq = (xs) => [...new Set(xs)];
const nameList = (xs) => xs.filter(Boolean).join(', ');

/* "A, B and C" rather than "A and B and C", which is what join(' and ') gives
   the moment a case picks a third SKU. */
const prose = (xs) => {
  const list = xs.filter(Boolean);
  if (list.length < 2) return list[0] || '';
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
};
const money = (v) => `$${Math.round(v).toLocaleString()}`;

/** Coverage of a bucket: how many of its capabilities a set contains. */
function coverage(ids, set) {
  const covered = ids.filter((id) => set.has(id)).length;
  return {
    covered,
    total: ids.length,
    state: covered === 0 ? 'none' : covered === ids.length ? 'full' : 'partial',
  };
}

/* One short line per Microsoft product, for the solution stack. Only says what
   the product is for — what it is worth on this case is derived per customer
   from the capabilities it actually adds. Every SKU in the catalogue has one,
   because a product card with an empty description reads as a rendering fault
   rather than as a product nobody wrote a line for. */
const BLURBS = {
  'm365-e5': 'Identity, endpoint, email and compliance in one bundle.',
  'm365-e3': 'Productivity, device management and identity.',
  'm365-f1': 'Frontline identity for staff who do not sit at a desk.',
  'm365-f3': 'Frontline productivity with device management and identity.',
  'bus-premium': 'Small-business device management, identity and baseline threat protection.',
  'bus-standard': 'Small-business productivity, without security or device management.',
  'bus-basic': 'Small-business productivity on the web, without desktop apps or device management.',
  'o365-e1': 'Office 365 on the web, with basic retention.',
  'o365-e3': 'Office 365 with desktop apps, eDiscovery and audit.',
  'o365-e5': 'Office 365 with advanced compliance, email protection and cloud app security.',
  'ems-e3': 'Identity and device management for Office 365.',
  'ems-e5': 'Identity and device management with identity protection and cloud app security.',
  'defender-suite': 'Threat protection across endpoint, email, identity and cloud apps.',
  'bp-defender': 'The Defender Suite priced for Business Premium.',
  'purview-suite': 'Data security, governance and compliance.',
  'bp-purview': 'The Purview Suite priced for Business Premium.',
  'bp-defender-purview': 'Defender and Purview together, priced for Business Premium.',
  'entra-suite': 'Identity governance, network access and privileged access.',
  'external-id': 'Identity for customers and partners, separate from the workforce directory.',
  'intune-suite': 'Advanced endpoint management and privilege control.',
  sentinel: 'Cloud-native security operations: SIEM, SOAR and unified investigation.',
  'security-copilot': 'AI assistance for the security operations team.',
  'defender-cloud': 'Protection and posture management for cloud workloads.',
  'm365-copilot': 'AI assistance across Microsoft 365.',
  'agent-365': 'Governance for AI agents.',
};

export function buildReport({
  capabilityCase,
  caseConfidence,
  currentLicenses = [],
  futureLicenses = [],
  contracts = [],
  rateByLicense = {},
  customer = {},
} = {}) {
  const c = capabilityCase || {};
  const delta = c.delta || {};
  const lines = c.competitorLines || [];
  const years = c.years || 3;

  const displaced = lines.filter((l) => l.displaceable);
  const surviving = lines.filter((l) => !l.displaceable);
  const named = contracts.filter((ct) => ct.vendor);
  /* Distinct, because the model does not dedupe by vendor — only the reducer
     does — and a hand-entered duplicate would otherwise inflate the headline
     consolidation count. */
  const vendors = uniq(named.map((ct) => ct.vendor));

  /* What the ESTATE covers today, Microsoft or otherwise. delta.current is the
     Microsoft bundle alone, so counting gains against it tells the customer
     they are gaining endpoint detection they are already buying from
     CrowdStrike. Every capability count shown to a reader uses this basis; the
     model's own buckets keep theirs, because consolidation and strategic are
     defined against what Microsoft grants. */
  const todaySet = new Set([
    ...(delta.current || []),
    ...lines.flatMap((l) => l.capabilityIds || []),
  ]);
  /* And what it covers afterwards. Microsoft's future state plus every contract
     that survives the move — a vendor nobody can displace is still covering
     what it covers on the day the deal signs. */
  const afterSet = new Set([
    ...(delta.future || []),
    ...surviving.flatMap((l) => l.capabilityIds || []),
  ]);

  const netNew = CAPABILITIES.filter((cap) => afterSet.has(cap.id) && !todaySet.has(cap.id));
  const netNewByArea = (areaId) => netNew.filter((cap) => cap.area === areaId).length;

  /* The other direction, which a report that only counts gains never tells the
     reader: a displaced contract takes its whole capability set with it, and
     the future state does not necessarily deliver all of it. The seller
     confirmed sole use, not that the customer stopped needing the capability. */
  const dropped = CAPABILITIES.filter((cap) => todaySet.has(cap.id) && !afterSet.has(cap.id));
  const droppedFrom = uniq(
    displaced.filter((l) => (l.capabilityIds || []).some((id) => !afterSet.has(id))).map((l) => l.vendor),
  );

  /* ------------------------------ 1. headline ----------------------------- */

  /* The run-rate once contracts lapse, not competitorTotal/years. Savings are
     dated to each contract's end, so the average across the horizon understates
     what the customer actually stops paying. */
  const annualSavings = displaced.reduce((sum, l) => sum + l.annualCost, 0);
  const msByYear = c.microsoftByYear || [];
  const annualInvestment = msByYear.length
    ? msByYear[msByYear.length - 1]
    : c.incrementalAnnual || 0;

  const kpis = {
    roi: c.roi,
    annualSavings,
    annualInvestment,
    annualNet: annualSavings - annualInvestment,
    paybackMonths: c.paybackMonths,
    confidence: caseConfidence?.percent ?? null,
  };

  /* --------------------------- 2. current / future ------------------------ */

  const state = {
    current: {
      licenses: currentLicenses.map((id) => licenseById(id)?.name).filter(Boolean),
      vendors,
    },
    future: {
      licenses: futureLicenses.map((id) => licenseById(id)?.name).filter(Boolean),
    },
  };

  /* --------------------------- 3. solution stack -------------------------- */

  /* Two SKUs in one basket can grant the same capability — Microsoft 365 E5
     already contains the Purview Suite — so each capability is credited to
     exactly one product. Without this the cards add up to more than the move
     delivers and the same ten capability names print twice.

     Claimed biggest-bundle-first rather than in selection order, so the credit
     lands on the bundle and the add-on is the one flagged as redundant, which
     is the way round a seller can act on. */
  const claimedBy = new Map();
  const records = new Map();
  [...futureLicenses]
    .sort((a, b) => (licenseById(b)?.grants.length || 0) - (licenseById(a)?.grants.length || 0))
    .forEach((id) => {
      const sku = licenseById(id);
      if (!sku) return;
      /* Catalogue order, so the list does not reshuffle when a license is
         toggled — delta sets are insertion-ordered. */
      const newToEstate = CAPABILITIES.filter(
        (cap) => sku.grants.includes(cap.id) && !todaySet.has(cap.id),
      );
      const adds = newToEstate.filter((cap) => !claimedBy.has(cap.id));
      const alreadyInStack = newToEstate.filter((cap) => claimedBy.has(cap.id));
      adds.forEach((cap) => claimedBy.set(cap.id, sku.name));

      const areas = uniq(adds.map((a) => a.area)).length;
      const redundant = adds.length === 0 && alreadyInStack.length > 0;
      records.set(id, {
        id,
        name: sku.name,
        blurb: BLURBS[id] || '',
        isNew: adds.length > 0,
        redundant,
        adds: adds.map((cap) => cap.name),
        /* Why it is here, in the customer's terms rather than the catalogue's. */
        rationale: adds.length
          ? `Adds ${adds.length} new capabilit${adds.length === 1 ? 'y' : 'ies'} across ${areas} area${areas === 1 ? '' : 's'}.`
          : redundant
            ? `Already granted by ${nameList(uniq(alreadyInStack.map((cap) => claimedBy.get(cap.id))))}. Check the quote is not paying twice.`
            : 'Already owned',
        estimated: sku.source === 'estimate',
        notPerUser: sku.notPerUser || null,
      });
    });
  const stack = futureLicenses.map((id) => records.get(id)).filter(Boolean);

  /* The one figure a sponsor repeats after the meeting, and the three that let
     anyone reconstruct it.

     `buying` is what is NEW, not the whole future basket. An upgrade path keeps
     the base bundle in futureLicenses, so naming the basket credited the saving
     to the licence the customer already runs: "With Microsoft 365 E3, Defender
     Suite and Sentinel, Northwind could save", two lines above a summary saying
     Northwind runs E3 today.

     Direction has three values, not two. Zero is neither a saving nor a spend,
     and "could spend a net $0" is a sentence nobody should have to parse. */
  const buying = stack.filter((s) => s.isNew).map((s) => s.name);
  const net = c.netBenefit || 0;
  const headline = {
    net,
    direction: net > 0 ? 'save' : net < 0 ? 'spend' : 'even',
    benefits: c.benefitTotal || 0,
    costs: c.investmentTotal || 0,
    account: customer.accountName || 'This customer',
    buying: prose(buying.length ? buying : state.future.licenses),
  };

  /* --------------------------- 4. financial impact ------------------------ */

  /* Free text on the form, so a seller typing the natural "1,350,000" arrives
     as a string with a comma in it. num() strips it; a bare Number() returns
     NaN and takes every bar on the chart with it. */
  const competitorSpend = named.reduce((s, ct) => s + num(ct.annualCost), 0);
  const todaySpend = (c.currentAnnual || 0) + competitorSpend;

  /* The SIGNED Microsoft movement, not the model's investment figure.
     microsoftByYear is floored at zero because ROI has no meaning against a
     negative investment — but a chart whose last bar claims to be "what the
     estate costs a year after" cannot use a floored number, or it reports
     tomorrow's bill as today's whenever a negotiated rate lands below the
     current bundle's list price. */
  const futureAnnualSteady = (c.futureByYear || [])[years - 1] ?? c.futureAnnual ?? 0;
  const microsoftChange = futureAnnualSteady - (c.currentAnnual || 0);

  /* Year by year, with the running balance. The horizon totals alone cannot
     answer the two questions a CFO asks first: when does this turn positive,
     and how lumpy is it getting there. Both are properties of the curve. */
  const benefitByYear = c.competitorByYear || [];
  const costByYear = c.microsoftByYear || [];
  let running = 0;
  const byYear = Array.from({ length: years }, (_, y) => {
    const benefit = benefitByYear[y] || 0;
    const cost = costByYear[y] || 0;
    running += benefit - cost;
    return { year: y + 1, label: `Year ${y + 1}`, benefit, cost, net: benefit - cost, cumulative: running };
  });

  /* Where the saving comes from, one bar per contract. Section 6 counts vendors
     coming off the estate; this is the same list priced, which is the question
     the count invites and never answers. */
  const vendorSavings = displaced
    .map((l) => ({ id: l.id, vendor: l.vendor, saved: l.saved, annual: l.annualCost, endYear: l.endYear }))
    .sort((a, b) => b.saved - a.saved);

  const financial = {
    byYear,
    vendorSavings,
    vendorSavingsTotal: vendorSavings.reduce((s, v) => s + v.saved, 0),
    steps: [
      { id: 'today', label: 'Annual licensing today', value: todaySpend, kind: 'total' },
      { id: 'stops', label: 'Competitor spend that stops', value: -annualSavings, kind: 'down' },
      {
        id: 'invest',
        label: microsoftChange < 0 ? 'Microsoft licensing falls' : 'Microsoft investment',
        value: microsoftChange,
        kind: microsoftChange < 0 ? 'down' : 'up',
      },
    ],
    /* The arithmetic result of the three steps above, not a separate claim. */
    futureSpend: todaySpend - annualSavings + microsoftChange,
    microsoftChange,
    continuingSpend: competitorSpend - annualSavings,
    horizonSavings: c.competitorTotal || 0,
    horizonInvestment: c.investmentTotal || 0,
    horizonNet: c.netBenefit || 0,
    years,
  };

  /* -------------------------- 5. capability coverage ---------------------- */

  /* Which half of "today" is already Microsoft — the difference between
     "you have this" and "you are paying someone else for this", which is the
     consolidation argument in one column. */
  const msTodaySet = new Set(delta.current || []);

  const coverageRows = SOLUTION_AREAS.map((area) => {
    const ids = CAPABILITIES.filter((cap) => cap.area === area.id).map((cap) => cap.id);
    return {
      id: area.id,
      label: area.label,
      blurb: area.blurb,
      today: coverage(ids, todaySet),
      microsoftToday: coverage(ids, msTodaySet),
      future: coverage(ids, afterSet),
      gained: ids.filter((id) => afterSet.has(id) && !todaySet.has(id)).length,
      lost: ids.filter((id) => todaySet.has(id) && !afterSet.has(id)).length,
    };
  }).filter((row) => row.today.total > 0);

  /* ------------------------- 6. vendor consolidation ---------------------- */

  const consolidation = {
    vendors,
    vendorCount: vendors.length,
    displacedCount: uniq(displaced.map((l) => l.vendor)).length,
    /* The Microsoft products doing the replacing: the distinct products behind
       the capabilities actually being displaced. */
    replacedBy: uniq(
      displaced
        .flatMap((l) => l.linked || [])
        .map((id) => capabilityById(id)?.product)
        .filter(Boolean),
    ),
    remaining: uniq(surviving.map((l) => l.vendor)),
    dropped: dropped.map((cap) => cap.name),
    droppedFrom,
  };

  /* --------------------------- 7. value drivers --------------------------- */

  const displacedVendorCount = uniq(displaced.map((l) => l.vendor)).length;

  const drivers = [
    {
      id: 'cost',
      title: 'Cost reduction',
      value: annualSavings,
      /* Three states, not two. "Nobody has been named" and "everybody has been
         named and none of them can be counted" both produce zero savings and
         mean opposite things to whoever is reading. */
      text: annualSavings
        ? `${displacedVendorCount} contract${displacedVendorCount === 1 ? '' : 's'} stop inside the horizon.`
        : named.length
          ? `${named.length} vendor${named.length === 1 ? ' is' : 's are'} named, but none can be counted inside the horizon.`
          : 'No vendor spend named against what this move adds.',
    },
    {
      id: 'consolidation',
      title: 'Operational efficiency',
      value: null,
      text: consolidation.displacedCount
        ? `${consolidation.displacedCount} vendor${consolidation.displacedCount === 1 ? '' : 's'} retired.`
        : named.length
          ? 'Every named vendor keeps running, so there is no consolidation to claim.'
          : 'Consolidation shows once vendors are named.',
    },
    {
      id: 'security',
      title: 'Security modernisation',
      value: null,
      text: `${netNewByArea('defender') + netNewByArea('entra')} new capabilities across Defender and Entra, and ${netNewByArea('purview')} across Purview.`,
    },
    {
      id: 'ai',
      title: 'AI enablement',
      value: null,
      text: netNewByArea('ai')
        ? `${netNewByArea('ai')} new AI capabilit${netNewByArea('ai') === 1 ? 'y' : 'ies'}.`
        : 'No AI capability in this move. Security Copilot and Agent 365 carry it.',
    },
  ];

  /* ----------------------------- 8. assumptions --------------------------- */

  const estimatedSkus = futureLicenses
    .map((id) => entitlementById(id))
    .filter((sku) => sku && sku.source === 'estimate');
  const notPerUser = futureLicenses
    .map((id) => entitlementById(id))
    .filter((sku) => sku && sku.notPerUser);

  /* Per license, not all-or-nothing. c.usingList is every-or-none, so one
     negotiated rate out of three flips the whole statement to "negotiated"
     while the confidence panel at the top of the same page is still docking the
     case for the two that are at list. */
  const rated = futureLicenses.filter((id) => String(rateByLicense[id] ?? '').trim() !== '');
  const atList = futureLicenses.filter((id) => String(rateByLicense[id] ?? '').trim() === '');
  const nameOf = (id) => licenseById(id)?.name;

  const assumptions = [
    { label: 'Analysis horizon', value: `${years} years from ${CASE_START_YEAR}` },
    { label: 'Users', value: (c.users || 0).toLocaleString() },
    {
      label: 'Microsoft pricing',
      value:
        futureLicenses.length === 0
          ? 'No future state selected.'
          : atList.length === 0
            ? 'Negotiated rate on every future license, not list.'
            : rated.length === 0
              ? 'List price throughout, so the investment is overstated.'
              : `Negotiated rate for ${nameList(rated.map(nameOf))}. ${nameList(atList.map(nameOf))} still at list, which overstates the investment.`,
    },
    {
      label: 'Competitor pricing',
      value: named.length
        ? 'Seller-entered annual cost per contract.'
        : 'No vendors named.',
    },
    {
      label: 'Contract dates',
      value: `Each saving starts the year after its contract lapses. A blank end year is read as ${CASE_START_YEAR}, losing the first year of that saving.`,
    },
    {
      label: 'Savings method',
      value:
        'Only competitor spend that stops is counted. Security, compliance and productivity value stay as capability, never currency.',
    },
    {
      label: 'ROI method',
      value: `${years}-year nominal, no discount rate. Investment is the difference from what the customer pays today.`,
    },
  ];

  if (microsoftChange < 0) {
    assumptions.push({
      label: 'Microsoft spend falls',
      value: `At the rates entered, the future state costs ${money(Math.abs(microsoftChange))} a year less than the current bundle. ROI is not shown against a negative investment.`,
    });
  }
  if (dropped.length) {
    assumptions.push({
      label: 'Capabilities not replaced',
      value: `${nameList(dropped.map((cap) => cap.name))}: covered today by ${nameList(droppedFrom)}, not delivered by the future state. The saving assumes the customer does not need ${dropped.length === 1 ? 'it' : 'them'}.`,
    });
  }
  if (estimatedSkus.length) {
    assumptions.push({
      label: 'Estimated prices',
      value: `${estimatedSkus.map((s) => s.name).join(', ')}: our own estimate, not the price list. Replace before quoting.`,
    });
  }
  if (notPerUser.length) {
    assumptions.push({
      label: 'Not billed per user',
      value: notPerUser.map((s) => `${s.name}: ${s.notPerUser}`).join('; '),
    });
  }

  /* ---------------------------- 9. next steps ----------------------------- */

  const steps = [];
  stack
    .filter((s) => s.isNew)
    .forEach((s) => steps.push({ id: `buy-${s.id}`, text: `Move to ${s.name}`, detail: s.rationale }));
  stack
    .filter((s) => s.redundant)
    .forEach((s) => steps.push({ id: `drop-${s.id}`, text: `Review ${s.name} in the quote`, detail: s.rationale }));
  displaced.forEach((l) =>
    steps.push({
      id: `stop-${l.id}`,
      text: `Plan the exit from ${l.vendor}`,
      detail: `Contract ends ${l.endYear}; the saving starts the year after.`,
    }),
  );
  displaced
    .filter((l) => (l.capabilityIds || []).some((id) => !afterSet.has(id)))
    .forEach((l) =>
      steps.push({
        id: `cover-${l.id}`,
        text: `Confirm nothing is lost when ${l.vendor} goes`,
        detail: `${nameList((l.capabilityIds || []).filter((id) => !afterSet.has(id)).map((id) => capabilityById(id)?.name))} has no replacement in the future state.`,
      }),
    );
  lines
    .filter((l) => l.blocked)
    .forEach((l) =>
      steps.push({
        id: `confirm-${l.id}`,
        text: `Confirm how ${l.vendor} is used`,
        detail: l.reason || 'No saving until sole use is confirmed.',
      }),
    );
  /* Deliberately no confidence gaps here. "Seats per year" and "Incumbents
     named" are things the seller still owes the model, not things leadership is
     being asked to approve — they belong to the confidence component in the
     summary, which already ranks them by what each one is worth. */

  /* ---------------------------- the summary ------------------------------- */

  const summary = (() => {
    const head = `${customer.accountName || 'This customer'} runs ${prose(state.current.licenses) || 'no Microsoft bundle'} today${vendors.length ? `, alongside ${vendors.length} named security vendor${vendors.length === 1 ? '' : 's'}` : ''}.`;
    const gain = ` The move adds ${netNew.length} new capabilities.`;
    if (annualSavings) {
      return `${head}${gain} Displacing the named vendors stops ${money(annualSavings)} a year against ${money(annualInvestment)} of new Microsoft licensing.`;
    }
    if (named.length) {
      return `${head}${gain} None of those contracts can be counted inside the ${years}-year horizon, so the case rests on capability rather than savings.`;
    }
    return `${head}${gain} No vendor spend named against those capabilities, so the case rests on capability rather than savings.`;
  })();

  return {
    kpis,
    headline,
    summary,
    state,
    stack,
    financial,
    coverage: coverageRows,
    consolidation,
    drivers,
    assumptions,
    steps,
  };
}
