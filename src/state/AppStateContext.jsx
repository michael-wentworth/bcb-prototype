import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { STEPS, bundleById, geographyById, skuById } from '../data/referenceData.js';
import { futureOf } from '../data/capabilities.js';
import { buildCapabilityCase } from '../data/capabilityModel.js';
import { buildConfidence } from '../data/confidence.js';
import { SIGNALS } from '../data/signals.js';
import { buildBusinessCase } from '../data/model.js';
import {
  AUTHORSHIP,
  NARRATIVE_SECTIONS,
  afterAiAction,
  afterHumanEdit,
} from '../data/authoring.js';
import { applyNarrativeAction } from '../data/aiActions.js';
import { DEMO_EXTRACTION, EXTRACTION_EVIDENCE } from '../data/demoCase.js';
import { findCase } from '../data/caseLibrary.js';
import { getStepIntro, resolveResponse } from '../data/aiScript.js';
import { CURRENT_USER, CURRENT_USER_ALIAS } from '../data/session.js';

const AppStateContext = createContext(null);

let messageId = 0;
const nextId = () => `m${++messageId}`;
let rowSeq = 0;
const rowId = (p) => `${p}-${++rowSeq}`;

const emptyCustomer = {
  accountName: '',
  opportunityId: '',
  opportunityName: '',
  notForCustomer: false,
  tpid: '',
  closeDate: '',
  industry: '',
  geography: '',
  segment: '',
  salesMotion: '',
  numberOfUsers: '',
  website: '',
  numberOfDevices: '',
  bcbRole: '',
  description: '',
};

const emptyEnvironment = {
  sellerAlias: CURRENT_USER_ALIAS,
};

const emptyCase = { name: '', analysisPeriod: 3 };

const emptyNarrative = () =>
  NARRATIVE_SECTIONS.reduce(
    (acc, s) => ({ ...acc, [s.id]: { text: '', authorship: AUTHORSHIP.EMPTY, snapshot: null } }),
    {},
  );

/** A blank SKU row. Seats default to the customer's user count where known. */
export const makeSkuRow = (seed = {}, years = 3, users = '') => ({
  id: rowId('sku'),
  skuId: '',
  solutionArea: '',
  solutionPlay: '',
  pricePerMonth: '',
  seats: Array.from({ length: years }, () => users || ''),
  authorship: AUTHORSHIP.MANUAL,
  ...seed,
});

export const makeCompetitorRow = (seed = {}) => ({
  id: rowId('comp'),
  // Whether the product was named in the description or inferred from signal.
  // Two very different claims, and the row badge says which.
  stated: false,
  softwareSolution: '',
  currentProduct: '',
  competitorCost: '',
  newMicrosoftProduct: '',
  yearContractEnds: '',
  authorship: AUTHORSHIP.MANUAL,
  ...seed,
});

/**
 * One vendor contract, covering however many capabilities that vendor supplies.
 *
 * Keyed on the vendor rather than the capability because that is how the
 * customer is billed — one Okta invoice, not one per capability. The previous
 * shape let the same contract be entered against each capability it covered and
 * counted every copy.
 */
export const makeContract = (seed = {}) => ({
  id: rowId('ctr'),
  vendor: '',
  annualCost: '',
  yearContractEnds: '',
  capabilityIds: [],
  soleUseConfirmed: false,
  authorship: AUTHORSHIP.MANUAL,
  ...seed,
});

const initialState = {
  /**
   * Which destination is showing. The builder is deliberately not a nav item —
   * it is always scoped to one case, so you enter it by creating or opening one.
   */
  view: 'myCases',
  activeCaseId: null,
  /**
   * Who owns the open case and what state it is in. Carried on the working case
   * rather than looked up from the library each render, because a new case has no
   * library entry to look up — it is a draft owned by whoever is signed in.
   */
  activeCaseStatus: 'draft',
  activeCaseOwner: CURRENT_USER,

  step: 0,
  maxStepReached: 0,

  customer: { ...emptyCustomer },
  /** key -> { confidence, basis, evidence, source } for AI-populated fields. */
  fieldMeta: {},
  environment: { ...emptyEnvironment },
  caseSetup: { ...emptyCase },

  outcomes: [],
  skus: [],
  bundle: { bundleId: '', annualPerUser: '', additionalValue: '' },
  competitors: { rows: [] },

  /* ------------------------- the capability model ------------------------- */
  /* Two license selections and a short competitor list. Everything the report
     says is derived from these — there is no separate SKU table, and no
     inventory of the existing estate. */
  currentLicenses: [],
  futureMode: 'path',
  futurePath: '',
  futureLicenses: [],
  /* Overrides only. A missing entry means "use the headcount" for seats and
     "use the catalogue price" for the rate, so neither goes stale. */
  seatsByLicense: {},
  rateByLicense: {},
  capabilityCompetitors: { contracts: [] },

  narrative: emptyNarrative(),

  /** Per-section provenance: 'empty' | 'ai' | 'assisted' | 'manual'. */
  sectionAuthorship: {
    customer: AUTHORSHIP.EMPTY,
    outcomes: AUTHORSHIP.EMPTY,
    skus: AUTHORSHIP.EMPTY,
    competitors: AUTHORSHIP.EMPTY,
  },

  /* ------------------------- implicit feedback -------------------------- */
  /* Behaviour recorded as a by-product of the work. Nothing here asks the
     seller anything, and nothing here is rendered while they are working — the
     case-building never pauses to collect it. */
  signals: [],
  /* Sticky, on purpose. fieldMeta provenance is erased the moment a value is
     confirmed, so it cannot answer "was the copilot ever involved" — and the
     one explicit question at the end must not appear for somebody who filled
     the case in by hand. */
  aiUsed: false,
  /* The single explicit answer. null until asked and answered. */
  caseConfidenceAnswer: null,
  /* Asked once. A flag rather than a scan of the message list, because the
     effect that pushes it can fire again on any re-render and "once" has to
     mean once. */
  confidenceAsked: false,
  /* What the copilot proposed, kept so a later edit can be told apart from the
     seller simply building their own case. Without it "recommendation removed"
     fires for a license nobody ever recommended. */
  aiProposal: { futureLicenses: [] },

  messages: [],
  thinking: null,
  introShown: {},

  reportReady: false,
};

const confirmMeta = (fieldMeta, key) =>
  fieldMeta[key]
    ? { ...fieldMeta, [key]: { confidence: 'confirmed', basis: 'Edited by you', source: 'user' } }
    : fieldMeta;

let signalSeq = 0;

/**
 * Append one behavioural signal to the state being returned.
 *
 * A wrapper rather than its own action, deliberately: a correction is not a
 * separate thing the seller did, it is the same edit seen from another angle.
 * Recording it anywhere but inside the case that already handles the edit lets
 * the two drift apart.
 */
const withSignal = (state, type, detail) => ({
  ...state,
  signals: [...state.signals, { id: `sig-${(signalSeq += 1)}`, type, detail, step: state.step }],
});

/* Only a change to a value the copilot supplied is a correction. Typing into a
   field it never touched teaches nothing — there is no wrong answer for the
   right one to be measured against. */
const isAiValue = (fieldMeta, key) => fieldMeta[key]?.source === 'ai';

/* Whether a contract is the copilot's claim or the seller's own row. Every
   mapping signal carries this, and only the copilot's rows count as
   corrections. */
const aiAuthored = (contract) => contract?.authorship === AUTHORSHIP.AI;

const setSection = (state, section, next) => ({
  ...state,
  sectionAuthorship: { ...state.sectionAuthorship, [section]: next },
});

const humanTouch = (state, section) =>
  setSection(state, section, afterHumanEdit(state.sectionAuthorship[section]));

/* Every AI population routes through here, so this is the one place the sticky
   flag has to be set. Setting it per-case would mean seven chances to forget,
   and the flag decides whether a seller is ever asked a question at all. */
const aiTouch = (state, section) =>
  setSection(
    { ...state, aiUsed: true },
    section,
    afterAiAction(state.sectionAuthorship[section], {
      fromScratch: state.sectionAuthorship[section] === AUTHORSHIP.EMPTY,
    }),
  );

function reducer(state, action) {
  switch (action.type) {
    /* ------------------------------ routing ----------------------------- */
    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'NEW_CASE':
      return {
        ...initialState,
        view: 'builder',
        activeCaseId: null,
        activeCaseStatus: 'draft',
        activeCaseOwner: CURRENT_USER,
        customer: { ...emptyCustomer },
        environment: { ...emptyEnvironment },
        caseSetup: { ...emptyCase },
        narrative: emptyNarrative(),
      };

    /** Open a seeded case: its snapshot becomes the working input set. */
    case 'LOAD_CASE': {
      const i = action.entry.input;
      return {
        ...initialState,
        view: 'builder',
        activeCaseId: action.entry.id,
        activeCaseStatus: action.entry.status || 'draft',
        activeCaseOwner: action.entry.owner || CURRENT_USER,
        step: 0,
        /* Opening a saved case unlocks the whole stepper. Was hardcoded to the
           last index of the old three-step flow, which would have stranded a
           reopened case two steps short of its own report. */
        maxStepReached: STEPS.length - 1,
        customer: { ...emptyCustomer, ...i.customer },
        environment: { ...emptyEnvironment },
        caseSetup: { ...emptyCase, ...i.caseSetup },
        outcomes: i.outcomes || [],
        skus: (i.skus || []).map((s) => ({ ...s, authorship: AUTHORSHIP.MANUAL })),
        bundle: { ...initialState.bundle, ...i.bundle },
        competitors: {
          rows: (i.competitors?.rows || []).map((r) => ({ ...r, authorship: AUTHORSHIP.MANUAL })),
        },
        /* The capability flow reads none of the four fields above. A saved case
           that did not carry these opened onto an empty step 2 and a report with
           nothing to report — which is what every fixture did until they were
           given a current bundle, a future state and its contracts. */
        currentLicenses: i.currentLicenses || [],
        futureMode: i.futureMode || 'path',
        futurePath: i.futurePath || '',
        futureLicenses: i.futureLicenses || [],
        seatsByLicense: i.seatsByLicense || {},
        rateByLicense: i.rateByLicense || {},
        capabilityCompetitors: {
          contracts: (i.capabilityContracts || []).map((c) => ({
            ...c,
            authorship: AUTHORSHIP.MANUAL,
          })),
        },
        narrative: emptyNarrative(),
        sectionAuthorship: {
          customer: AUTHORSHIP.MANUAL,
          outcomes: AUTHORSHIP.MANUAL,
          skus: AUTHORSHIP.MANUAL,
          competitors: AUTHORSHIP.MANUAL,
        },
      };
    }

    case 'SET_STEP': {
      const step = Math.max(0, Math.min(STEPS.length - 1, action.step));
      return { ...state, step, maxStepReached: Math.max(state.maxStepReached, step) };
    }

    /* --------------------------- customer form -------------------------- */
    case 'SET_CUSTOMER': {
      const next = { ...state.customer, [action.key]: action.value };
      // Editing an AI-populated field replaces its provenance with your own.
      const meta = state.fieldMeta[action.key]
        ? {
            ...state.fieldMeta,
            [action.key]: { confidence: 'confirmed', basis: 'Edited by you', source: 'user' },
          }
        : state.fieldMeta;
      const after = humanTouch({ ...state, customer: next, fieldMeta: meta }, 'customer');
      /* Industry: Manufacturing -> Technology. The pair is the signal. A rating
         would say somebody was unhappy; this says what the answer was. */
      /* A change, not a re-selection: picking Manufacturing again is agreement.
         `to` is deliberately absent — this fires on the first keystroke, so the
         value at that moment is a fragment. The corrected answer is whatever
         the field holds when the case is read. */
      const changed = String(state.customer[action.key] ?? '') !== String(action.value ?? '');
      return isAiValue(state.fieldMeta, action.key) && changed
        ? withSignal(after, SIGNALS.FIELD_CORRECTED, {
            field: action.key,
            from: state.customer[action.key],
            ai: true,
          })
        : after;
    }

    case 'SET_ENVIRONMENT':
      return humanTouch(
        { ...state, environment: { ...state.environment, [action.key]: action.value } },
        'customer',
      );

    case 'SET_CASE_SETUP': {
      const caseSetup = { ...state.caseSetup, [action.key]: action.value };
      // Changing the horizon reshapes every SKU row's per-year seat entry.
      const years = Number(caseSetup.analysisPeriod) || 3;
      const skus =
        action.key === 'analysisPeriod'
          ? state.skus.map((r) => ({
              ...r,
              seats: Array.from({ length: years }, (_, i) => r.seats[i] ?? ''),
            }))
          : state.skus;
      return { ...state, caseSetup, skus };
    }

    /* ----------------------------- outcomes ------------------------------ */
    case 'TOGGLE_OUTCOME': {
      const on = state.outcomes.includes(action.id);
      return humanTouch(
        {
          ...state,
          outcomes: on
            ? state.outcomes.filter((o) => o !== action.id)
            : [...state.outcomes, action.id],
        },
        'outcomes',
      );
    }

    case 'SET_ALL_OUTCOMES':
      return humanTouch({ ...state, outcomes: action.ids }, 'outcomes');

    /* ------------------------------- SKUs -------------------------------- */
    /* Add this SKU unless the case already has it.
       Selecting several competitors at once fires one of these per competitor,
       and two of them routinely resolve to the same Microsoft product — pick
       CrowdStrike and Trellix and both want Defender for Endpoint P2. The
       component cannot dedupe that: React has not re-rendered between the
       calls, so its view of state.skus is stale for every call after the first.
       Deduping here is the only place that sees the truth. */
    case 'ENSURE_SKU_ROW': {
      if (state.skus.some((r) => r.skuId === action.seed.skuId)) return state;
      return humanTouch(
        {
          ...state,
          skus: [
            ...state.skus,
            makeSkuRow(action.seed, Number(state.caseSetup.analysisPeriod) || 3, action.users),
          ],
        },
        'skus',
      );
    }

    case 'ADD_SKU_ROW':
      return humanTouch(
        {
          ...state,
          skus: [
            ...state.skus,
            makeSkuRow(action.seed, Number(state.caseSetup.analysisPeriod) || 3, action.users),
          ],
        },
        'skus',
      );

    case 'UPDATE_SKU_ROW':
      return humanTouch(
        {
          ...state,
          skus: state.skus.map((r) =>
            r.id === action.id
              ? { ...r, ...action.patch, authorship: afterHumanEdit(r.authorship) }
              : r,
          ),
        },
        'skus',
      );

    case 'UPDATE_SKU_SEATS':
      return humanTouch(
        {
          ...state,
          skus: state.skus.map((r) =>
            r.id === action.id
              ? {
                  ...r,
                  seats: r.seats.map((s, i) => (i === action.index ? action.value : s)),
                  authorship: afterHumanEdit(r.authorship),
                }
              : r,
          ),
        },
        'skus',
      );

    case 'REMOVE_SKU_ROW':
      return humanTouch({ ...state, skus: state.skus.filter((r) => r.id !== action.id) }, 'skus');

    /* ------------------------------ bundle ------------------------------- */
    case 'SET_BUNDLE': {
      const bundle = { ...state.bundle, [action.key]: action.value };
      /* Mirrors SET_CUSTOMER: an edited field is no longer the copilot's claim.
         Without this the sparkle pill survives a human edit, and on a bundle
         change it survives into a flat contradiction — still quoting
         "…currently uses Microsoft 365 E3…" against a value the seller has just
         changed to something else. The prefilled price goes with it, since that
         list figure is a consequence of the bundle rather than of the prompt. */
      const meta = { ...state.fieldMeta };
      if (meta[action.key])
        meta[action.key] = { confidence: 'confirmed', basis: 'Edited by you', source: 'user' };
      if (action.key === 'bundleId') {
        const b = bundleById(action.value);
        if (b) bundle.annualPerUser = b.annualPerUser ? String(b.annualPerUser) : '';
        delete meta.annualPerUser;
      }
      return { ...state, bundle, fieldMeta: meta };
    }

    /* ---------------------------- competitors ---------------------------- */
    case 'ADD_COMPETITOR_ROW':
      return humanTouch(
        {
          ...state,
          competitors: {
            ...state.competitors,
            rows: [...state.competitors.rows, makeCompetitorRow(action.seed)],
          },
        },
        'competitors',
      );

    // The competitor row is captured on step 1 and mapped to its Microsoft
    // replacement on step 2, so the same row is edited from two screens. One
    // patch action serves both, exactly as UPDATE_SKU_ROW does for the SKU table.
    case 'UPDATE_COMPETITOR_ROW':
      return humanTouch(
        {
          ...state,
          competitors: {
            ...state.competitors,
            rows: state.competitors.rows.map((r) =>
              r.id === action.id
                ? { ...r, ...action.patch, authorship: afterHumanEdit(r.authorship) }
                : r,
            ),
          },
        },
        'competitors',
      );

    case 'REMOVE_COMPETITOR_ROW':
      return humanTouch(
        {
          ...state,
          competitors: {
            ...state.competitors,
            rows: state.competitors.rows.filter((r) => r.id !== action.id),
          },
        },
        'competitors',
      );

    /* ----------------------------- narrative ----------------------------- */
    case 'SET_NARRATIVE': {
      const current = state.narrative[action.id];
      return {
        ...state,
        narrative: {
          ...state.narrative,
          [action.id]: {
            ...current,
            text: action.text,
            authorship: action.text.trim() ? afterHumanEdit(current.authorship) : AUTHORSHIP.EMPTY,
          },
        },
      };
    }

    case 'AI_NARRATIVE': {
      const current = state.narrative[action.id];
      const result = applyNarrativeAction(action.id, current.text, action.action, action.ctx);
      if (!result) return state;
      return {
        ...state,
        aiUsed: true,
        narrative: {
          ...state.narrative,
          [action.id]: {
            text: result.text,
            authorship: afterAiAction(current.authorship, { fromScratch: result.fromScratch }),
            snapshot: { text: current.text, authorship: current.authorship },
          },
        },
      };
    }

    case 'REVERT_NARRATIVE': {
      const current = state.narrative[action.id];
      if (!current?.snapshot) return state;
      return {
        ...state,
        narrative: { ...state.narrative, [action.id]: { ...current.snapshot, snapshot: null } },
      };
    }

    /* -------------------------- AI bulk population ----------------------- */
    case 'AI_FILL_CUSTOMER': {
      const meta = { ...state.fieldMeta };
      Object.keys(action.patch).forEach((key) => {
        if (EXTRACTION_EVIDENCE[key]) meta[key] = { ...EXTRACTION_EVIDENCE[key], source: 'ai' };
      });
      return aiTouch(
        { ...state, customer: { ...state.customer, ...action.patch }, fieldMeta: meta },
        'customer',
      );
    }

    case 'AI_FILL_OUTCOMES':
      return aiTouch({ ...state, outcomes: action.ids }, 'outcomes');

    /* Same provenance treatment the customer fields get. The bundle drives both
       bars of the spend comparison, and its price is a list figure the seller is
       meant to replace — a pill saying so is the only thing that tells them. */
    case 'AI_FILL_BUNDLE': {
      const meta = { ...state.fieldMeta };
      Object.keys(action.patch).forEach((key) => {
        if (EXTRACTION_EVIDENCE[key]) meta[key] = { ...EXTRACTION_EVIDENCE[key], source: 'ai' };
      });
      /* The one AI fill that does not route through aiTouch, so it sets the
         flag itself rather than leaving a bundle-only populate invisible. */
      return { ...state, aiUsed: true, bundle: { ...state.bundle, ...action.patch }, fieldMeta: meta };
    }

    case 'AI_FILL_SKUS': {
      const years = Number(state.caseSetup.analysisPeriod) || 3;
      const users = state.customer.numberOfUsers;
      return aiTouch(
        {
          ...state,
          skus: action.rows.map((seed) => ({
            ...makeSkuRow({}, years, users),
            ...seed,
            seats: Array.from({ length: years }, () => users || ''),
            authorship: AUTHORSHIP.AI,
          })),
        },
        'skus',
      );
    }

    case 'AI_FILL_COMPETITORS':
      return aiTouch(
        {
          ...state,
          competitors: {
            ...state.competitors,
            rows: action.rows.map((seed) => makeCompetitorRow({ ...seed, authorship: AUTHORSHIP.AI })),
          },
        },
        'competitors',
      );

    /* ---------------------------- capabilities ---------------------------- */

    case 'SET_CURRENT_LICENSES': {
      /* Changing what the customer owns invalidates the path they were on — an
         E3 path makes no sense once the base is E5, and leaving it selected
         would quietly compute a delta against a license they no longer hold. */
      const after = humanTouch(
        {
          ...state,
          currentLicenses: action.ids,
          futurePath: '',
          futureLicenses: [],
          /* Both keys. The path this cleared was the copilot's, and leaving its
             provenance behind made the seller's next pick look like a rejection
             of a recommendation that no longer existed. */
          fieldMeta: confirmMeta(
            confirmMeta(state.fieldMeta, 'currentLicenses'),
            'futurePath',
          ),
        },
        'customer',
      );
      const bundleChanged =
        state.currentLicenses.join('|') !== (action.ids || []).join('|');
      return isAiValue(state.fieldMeta, 'currentLicenses') && bundleChanged
        ? withSignal(after, SIGNALS.FIELD_CORRECTED, {
            field: 'currentLicenses',
            from: state.currentLicenses,
            to: action.ids,
            ai: true,
          })
        : after;
    }

    case 'SET_FUTURE_MODE':
      /* The tab is two ways of describing one future state, not two separate
         answers, so switching between them keeps the selection. It used to clear
         both fields: taking a path, glancing at the SKU list and coming back
         emptied the case, and the seller had to pick the path again.

         Nothing goes stale. Editing individual SKUs clears futurePath on its own
         (SET_FUTURE_LICENSES below), so a path can never stay highlighted while
         describing something the seller has since changed. */
      return { ...state, futureMode: action.mode };

    case 'SET_FUTURE_PATH': {
      /* futureOf carries through anything they own that the path never mentions.
         Without it a customer on Office 365 E3 + EMS E3 + Sentinel taking the
         Purview path would lose Sentinel from the future state, and the delta
         would report a capability loss that is not happening. */
      const after = humanTouch(
        {
          ...state,
          futurePath: action.path.id,
          futureLicenses: futureOf(action.path, state.currentLicenses),
          fieldMeta: confirmMeta(state.fieldMeta, 'futurePath'),
        },
        'skus',
      );
      /* Only a change counts. Re-selecting the path the copilot already chose
         is acceptance, not correction. */
      if (!isAiValue(state.fieldMeta, 'futurePath')) return after;
      return state.futurePath === action.path.id
        ? withSignal(after, SIGNALS.RECOMMENDATION_ACCEPTED, { what: 'path', id: action.path.id })
        : withSignal(after, SIGNALS.RECOMMENDATION_REMOVED, {
            what: 'path',
            from: state.futurePath,
            to: action.path.id,
            ai: true,
          });
    }

    /* The copilot proposed a set of licenses and this is the seller editing it.
       Dropping one is the signal worth having: it says the recommendation was
       wrong, and which one. Only recorded once the copilot has contributed —
       otherwise every tile a seller ticks would look like a verdict on it. */
    case 'SET_FUTURE_LICENSES': {
      const kept = new Set(action.ids);
      /* Only what the copilot put there counts as a recommendation removed.
         Unticking a license the seller added themselves is them changing their
         own mind, which teaches nothing about the copilot. */
      const proposed = new Set(state.aiProposal.futureLicenses);
      const removed = state.futureLicenses.filter((id) => !kept.has(id) && proposed.has(id));
      const base = humanTouch(
        {
          ...state,
          futurePath: '',
          futureLicenses: action.ids,
          /* Editing SKUs by hand is the seller answering the future-state
             question themselves, so the copilot's claim over it ends here too. */
          fieldMeta: confirmMeta(state.fieldMeta, 'futurePath'),
        },
        'skus',
      );
      return removed.reduce(
        (acc, id) =>
          withSignal(acc, SIGNALS.RECOMMENDATION_REMOVED, { what: 'license', id, ai: true }),
        base,
      );
    }

    case 'SET_LICENSE_SEATS': {
      const row = [...(state.seatsByLicense[action.id] || [])];
      row[action.year] = action.value;
      return humanTouch(
        { ...state, seatsByLicense: { ...state.seatsByLicense, [action.id]: row } },
        'skus',
      );
    }

    /* The capability half of a populate, in one dispatch. The licensing fill
       above writes slices no screen reads any more; this is the one that makes
       step 2 show anything. */
    case 'AI_FILL_CAPABILITY': {
      /* Same provenance treatment step 1's fields get. Without it the seller
         cannot tell which half of step 2 the copilot invented — and the rate in
         particular is a placeholder, not a quote. */
      const meta = { ...state.fieldMeta };
      ['currentLicenses', 'futurePath', 'rateByLicense', 'capabilityContracts'].forEach((key) => {
        if (EXTRACTION_EVIDENCE[key]) meta[key] = { ...EXTRACTION_EVIDENCE[key], source: 'ai' };
      });
      return aiTouch(
        {
          ...state,
          fieldMeta: meta,
          aiProposal: { futureLicenses: action.payload.futureLicenses || [] },
          currentLicenses: action.payload.currentLicenses || [],
          futureMode: action.payload.futureMode || 'path',
          futurePath: action.payload.futurePath || '',
          futureLicenses: action.payload.futureLicenses || [],
          rateByLicense: action.payload.rateByLicense || {},
          capabilityCompetitors: {
            contracts: (action.payload.capabilityContracts || []).map((c) => ({
              ...c,
              authorship: AUTHORSHIP.AI,
            })),
          },
        },
        'competitors',
      );
    }

    case 'SET_LICENSE_RATE':
      {
        /* The most valuable correction in the flow: the copilot's rate is
           explicitly a placeholder, and the seller replacing it carries both the
           wrong answer and the right one. It was the one confirmMeta call with
           no signal beside it. */
        const wasAi = isAiValue(state.fieldMeta, 'rateByLicense');
        const after = humanTouch(
          {
            ...state,
            rateByLicense: { ...state.rateByLicense, [action.id]: action.value },
            fieldMeta: confirmMeta(state.fieldMeta, 'rateByLicense'),
          },
          'skus',
        );
        return wasAi
          ? withSignal(after, SIGNALS.FIELD_CORRECTED, {
              field: 'rateByLicense',
              license: action.id,
              from: state.rateByLicense[action.id],
              ai: true,
            })
          : after;
      }

    /* Linking a vendor to a capability and creating its contract are the same
       action, so the dropdown and the quick-add cannot diverge: whichever the
       seller uses, one vendor means one contract. */
    case 'LINK_VENDOR': {
      const list = state.capabilityCompetitors.contracts;
      const existing = list.find((c) => c.vendor === action.vendor);
      const next = existing
        ? list.map((c) =>
            c.id === existing.id
              ? { ...c, capabilityIds: [...new Set([...c.capabilityIds, ...action.capabilityIds])] }
              : c,
          )
        : [...list, makeContract({ vendor: action.vendor, capabilityIds: action.capabilityIds })];
      const after = humanTouch(
        { ...state, capabilityCompetitors: { ...state.capabilityCompetitors, contracts: next } },
        'competitors',
      );
      /* A mapping the seller made themselves. Against an AI-populated case this
         is them extending the copilot's answer rather than replacing it. */
      /* Extending a row the copilot created is a correction. Adding a vendor it
         never mentioned is the seller doing the work, so it is recorded as a
         mapping accepted rather than counted against the copilot. */
      return withSignal(
        after,
        aiAuthored(existing) ? SIGNALS.MAPPING_CHANGED : SIGNALS.MAPPING_ACCEPTED,
        {
          vendor: action.vendor,
          capabilityIds: action.capabilityIds,
          ai: aiAuthored(existing),
        },
      );
    }

    case 'UNLINK_VENDOR': {
      const next = state.capabilityCompetitors.contracts
        .map((c) =>
          c.id === action.id
            ? { ...c, capabilityIds: c.capabilityIds.filter((x) => x !== action.capabilityId) }
            : c,
        )
        /* A contract with nothing left to displace is not a contract the case
           has anything to say about. */
        .filter((c) => c.capabilityIds.length > 0);
      const gone = state.capabilityCompetitors.contracts.find((c) => c.id === action.id);
      const after = humanTouch(
        { ...state, capabilityCompetitors: { ...state.capabilityCompetitors, contracts: next } },
        'competitors',
      );
      /* CrowdStrike -> Defender, unwired. Whether the whole contract went or
         only this capability is the difference between "wrong vendor" and
         "wrong mapping", so the two are recorded as different signals. */
      const survives = next.some((c) => c.id === action.id);
      return withSignal(after, survives ? SIGNALS.MAPPING_CHANGED : SIGNALS.MAPPING_REMOVED, {
        vendor: gone?.vendor,
        capabilityId: action.capabilityId,
        ai: aiAuthored(gone),
      });
    }

    case 'UPDATE_CONTRACT': {
      const before = state.capabilityCompetitors.contracts.find((c) => c.id === action.id);
      /* Once. Authorship on the contract is what marks it as the copilot's
         claim, and it has to move on the first edit — otherwise every keystroke
         into a cost field records another correction and a seven-digit number
         arrives as seven of them. */
      const corrected = before?.authorship === AUTHORSHIP.AI;
      const after = humanTouch(
        {
          ...state,
          capabilityCompetitors: {
            ...state.capabilityCompetitors,
            contracts: state.capabilityCompetitors.contracts.map((c) =>
              c.id === action.id
                ? {
                    ...c,
                    [action.key]: action.value,
                    authorship: corrected ? AUTHORSHIP.ASSISTED : c.authorship,
                  }
                : c,
            ),
          },
        },
        'competitors',
      );
      /* Editing the cost or end year the copilot estimated is a correction with
         a right answer attached, which is the most useful shape a signal has. */
      return corrected
        ? withSignal(after, SIGNALS.FIELD_CORRECTED, {
            field: `contract.${action.key}`,
            vendor: before.vendor,
            from: before[action.key],
            ai: true,
          })
        : after;
    }

    case 'REMOVE_CONTRACT': {
      const gone = state.capabilityCompetitors.contracts.find((c) => c.id === action.id);
      const after = humanTouch(
        {
          ...state,
          capabilityCompetitors: {
            ...state.capabilityCompetitors,
            contracts: state.capabilityCompetitors.contracts.filter((c) => c.id !== action.id),
          },
        },
        'competitors',
      );
      return withSignal(after, SIGNALS.MAPPING_REMOVED, {
        vendor: gone?.vendor,
        ai: aiAuthored(gone),
      });
    }

    /* ----------------------------- assistant ----------------------------- */
    case 'ADD_MESSAGE':
      /* A user-role message is the only one a person can cause. The step intro
         pushes an assistant message unprompted, so counting messages at all
         would mark every case as AI-assisted before anybody typed a word. */
      return {
        ...state,
        messages: [...state.messages, action.message],
        aiUsed: state.aiUsed || action.message.role === 'user',
      };

    case 'START_THINKING':
      return { ...state, thinking: { steps: action.steps, index: 0 } };

    case 'ADVANCE_THINKING':
      return state.thinking
        ? {
            ...state,
            thinking: {
              ...state.thinking,
              index: Math.min(state.thinking.index + 1, state.thinking.steps.length - 1),
            },
          }
        : state;

    case 'STOP_THINKING':
      return { ...state, thinking: null };

    case 'MARK_CONFIDENCE_ASKED':
      return { ...state, confidenceAsked: true };

    case 'MARK_INTRO_SHOWN':
      return { ...state, introShown: { ...state.introShown, [action.step]: true } };

    case 'SET_REPORT_READY':
      return state.reportReady
        ? state
        : withSignal({ ...state, reportReady: true }, SIGNALS.REPORT_GENERATED, {
            confidenceAsked: state.aiUsed,
          });

    /* Outcomes. A case somebody shared is a case they stood behind, which is a
       stronger endorsement than anything they would have ticked in a survey. */
    case 'RECORD_SIGNAL':
      return withSignal(state, action.signalType, action.detail || {});

    case 'ANSWER_CONFIDENCE':
      return withSignal({ ...state, caseConfidenceAnswer: action.answer }, SIGNALS.CONFIDENCE_ANSWERED, {
        answer: action.answer,
      });

    case 'RESET':
      return {
        ...initialState,
        customer: { ...emptyCustomer },
        environment: { ...emptyEnvironment },
        caseSetup: { ...emptyCase },
        narrative: emptyNarrative(),
      };

    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const timers = useRef([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /* --------------------------- derived values --------------------------- */

  const currency = useMemo(
    () => geographyById(state.customer.geography)?.currency || 'USD',
    [state.customer.geography],
  );

  /** Devices default to 1.2x users when the seller leaves the field blank. */
  const effectiveDevices = useMemo(() => {
    const entered = Number(String(state.customer.numberOfDevices).replace(/[^0-9.]/g, ''));
    if (entered > 0) return Math.round(entered);
    const users = Number(String(state.customer.numberOfUsers).replace(/[^0-9.]/g, ''));
    return users > 0 ? Math.round(users * 1.2) : 0;
  }, [state.customer.numberOfDevices, state.customer.numberOfUsers]);

  const businessCase = useMemo(
    () =>
      buildBusinessCase({
        analysisPeriod: state.caseSetup.analysisPeriod,
        numberOfUsers: state.customer.numberOfUsers,
        skus: state.skus,
        bundle: state.bundle,
        competitors: state.competitors,
      }),
    [
      state.caseSetup.analysisPeriod,
      state.customer.numberOfUsers,
      state.skus,
      state.bundle,
      state.competitors,
    ],
  );
  /* The capability case. Recomputed from the same five inputs the seller
     touches, so every screen from step 3 on is a read of this object. */
  const capabilityCase = useMemo(
    () =>
      buildCapabilityCase({
        analysisPeriod: state.caseSetup.analysisPeriod,
        numberOfUsers: state.customer.numberOfUsers,
        currentLicenses: state.currentLicenses,
        futureLicenses: state.futureLicenses,
        contracts: state.capabilityCompetitors.contracts,
        seatsByLicense: state.seatsByLicense,
        rateByLicense: state.rateByLicense,
      }),
    [
      state.caseSetup.analysisPeriod,
      state.customer.numberOfUsers,
      state.currentLicenses,
      state.futureLicenses,
      state.capabilityCompetitors,
      state.seatsByLicense,
      state.rateByLicense,
    ],
  );

  /* Recomputed from the same inputs the report reads, plus provenance. Kept
     beside the capability case so no screen can disagree with another about how
     complete the case is. */
  const caseConfidence = useMemo(
    () =>
      buildConfidence({
        capabilityCase,
        customer: state.customer,
        caseSetup: state.caseSetup,
        currentLicenses: state.currentLicenses,
        futureLicenses: state.futureLicenses,
        seatsByLicense: state.seatsByLicense,
        rateByLicense: state.rateByLicense,
        contracts: state.capabilityCompetitors.contracts,
        fieldMeta: state.fieldMeta,
      }),
    [
      capabilityCase,
      state.customer,
      state.caseSetup,
      state.currentLicenses,
      state.futureLicenses,
      state.seatsByLicense,
      state.rateByLicense,
      state.capabilityCompetitors,
      state.fieldMeta,
    ],
  );

  const businessCaseRef = useRef(businessCase);
  businessCaseRef.current = businessCase;

  const capabilityCaseRef = useRef(capabilityCase);
  capabilityCaseRef.current = capabilityCase;

  const buildContext = useCallback(
    () => ({
      step: stateRef.current.step,
      customer: stateRef.current.customer,
      environment: stateRef.current.environment,
      caseSetup: stateRef.current.caseSetup,
      outcomes: stateRef.current.outcomes,
      skus: stateRef.current.skus,
      competitors: stateRef.current.competitors,
      narrative: stateRef.current.narrative,
      sectionAuthorship: stateRef.current.sectionAuthorship,
      businessCase: businessCaseRef.current,
      /* The capability flow drives every screen now, so the copilot has to be
         able to see it. Without these it answered from the licensing model,
         which nothing on screen is computed from any more. */
      capabilityCase: capabilityCaseRef.current,
      currentLicenses: stateRef.current.currentLicenses,
      futureLicenses: stateRef.current.futureLicenses,
      contracts: stateRef.current.capabilityCompetitors.contracts,
      currency,
    }),
    [currency],
  );

  const pushAssistant = useCallback((blocks, intent) => {
    dispatch({ type: 'ADD_MESSAGE', message: { id: nextId(), role: 'assistant', blocks, intent } });
  }, []);

  /** The scripted POPULATE behaviour, now filling the real form fields. */
  const runActions = useCallback(
    (actions) => {
      actions.forEach((action) => {
        if (action.type === 'fillCase') {
          const d = DEMO_EXTRACTION;
          schedule(() => dispatch({ type: 'AI_FILL_CUSTOMER', patch: d.customer }), 260);
            schedule(() => dispatch({ type: 'AI_FILL_OUTCOMES', ids: d.outcomes }), 900);
          if (d.caseSetup?.name)
            schedule(
              () => dispatch({ type: 'SET_CASE_SETUP', key: 'name', value: d.caseSetup.name }),
              1100,
            );
          schedule(() => dispatch({ type: 'AI_FILL_SKUS', rows: d.skus }), 1200);
          schedule(() => dispatch({ type: 'AI_FILL_BUNDLE', patch: d.bundle }), 1400);
          schedule(() => dispatch({ type: 'AI_FILL_COMPETITORS', rows: d.competitors }), 1600);
          /* The licensing move and its contracts come from the saved Contoso
             case, so the fill lands the seller in exactly the state that opening
             it from My cases would. */
          schedule(
            () => dispatch({ type: 'AI_FILL_CAPABILITY', payload: findCase('case-contoso')?.input || {} }),
            1800,
          );
        }
        if (action.type === 'goToStep') {
          schedule(() => dispatch({ type: 'SET_STEP', step: action.step }), 400);
        }
      });
    },
    [schedule],
  );

  const ask = useCallback(
    (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || stateRef.current.thinking) return;

      dispatch({
        type: 'ADD_MESSAGE',
        message: { id: nextId(), role: 'user', blocks: [{ type: 'text', text: trimmed }] },
      });

      const response = resolveResponse(trimmed, buildContext());
      dispatch({ type: 'START_THINKING', steps: response.thinking });

      const stepGap = response.delay / Math.max(response.thinking.length, 1);
      response.thinking.forEach((_, i) => {
        if (i === 0) return;
        schedule(() => dispatch({ type: 'ADVANCE_THINKING' }), stepGap * i);
      });

      schedule(() => {
        dispatch({ type: 'STOP_THINKING' });
        pushAssistant(response.blocks, response.intent);
        runActions(response.actions);
      }, response.delay);
    },
    [buildContext, pushAssistant, runActions, schedule],
  );

  /* ------------------------------- actions ------------------------------ */

  const actions = useMemo(
    () => ({
      setView: (view) => dispatch({ type: 'SET_VIEW', view }),
      newCase: () => dispatch({ type: 'NEW_CASE' }),
      openCase: (entry) => dispatch({ type: 'LOAD_CASE', entry }),
      goToStep: (step) => dispatch({ type: 'SET_STEP', step }),
      setCustomer: (key, value) => dispatch({ type: 'SET_CUSTOMER', key, value }),
      setEnvironment: (key, value) => dispatch({ type: 'SET_ENVIRONMENT', key, value }),
      setCaseSetup: (key, value) => dispatch({ type: 'SET_CASE_SETUP', key, value }),
      setCurrentLicenses: (ids) => dispatch({ type: 'SET_CURRENT_LICENSES', ids }),
      setFutureMode: (mode) => dispatch({ type: 'SET_FUTURE_MODE', mode }),
      setFuturePath: (path) => dispatch({ type: 'SET_FUTURE_PATH', path }),
      setLicenseSeats: (id, year, value) =>
        dispatch({ type: 'SET_LICENSE_SEATS', id, year, value }),
      setLicenseRate: (id, value) => dispatch({ type: 'SET_LICENSE_RATE', id, value }),
      setFutureLicenses: (ids) => dispatch({ type: 'SET_FUTURE_LICENSES', ids }),
      linkVendor: (vendor, capabilityIds) => dispatch({ type: 'LINK_VENDOR', vendor, capabilityIds }),
      unlinkVendor: (id, capabilityId) => dispatch({ type: 'UNLINK_VENDOR', id, capabilityId }),
      updateContract: (id, key, value) => dispatch({ type: 'UPDATE_CONTRACT', id, key, value }),
      removeContract: (id) => dispatch({ type: 'REMOVE_CONTRACT', id }),
      toggleOutcome: (id) => dispatch({ type: 'TOGGLE_OUTCOME', id }),
      setAllOutcomes: (ids) => dispatch({ type: 'SET_ALL_OUTCOMES', ids }),
      addSkuRow: (seed, users) => dispatch({ type: 'ADD_SKU_ROW', seed, users }),
      ensureSkuRow: (seed, users) => dispatch({ type: 'ENSURE_SKU_ROW', seed, users }),
      updateSkuRow: (id, patch) => dispatch({ type: 'UPDATE_SKU_ROW', id, patch }),
      updateSkuSeats: (id, index, value) =>
        dispatch({ type: 'UPDATE_SKU_SEATS', id, index, value }),
      removeSkuRow: (id) => dispatch({ type: 'REMOVE_SKU_ROW', id }),
      setBundle: (key, value) => dispatch({ type: 'SET_BUNDLE', key, value }),
      addCompetitorRow: (seed) => dispatch({ type: 'ADD_COMPETITOR_ROW', seed }),
      updateCompetitorRow: (id, patch) => dispatch({ type: 'UPDATE_COMPETITOR_ROW', id, patch }),
      removeCompetitorRow: (id) => dispatch({ type: 'REMOVE_COMPETITOR_ROW', id }),
      /* Outcome signals. Fired from the buttons that already exist rather than
         from anything new the seller has to click. */
      recordSignal: (signalType, detail) => dispatch({ type: 'RECORD_SIGNAL', signalType, detail }),
      answerConfidence: (answer) => dispatch({ type: 'ANSWER_CONFIDENCE', answer }),
      setNarrative: (id, text) => dispatch({ type: 'SET_NARRATIVE', id, text }),
      revertNarrative: (id) => dispatch({ type: 'REVERT_NARRATIVE', id }),
    }),
    [],
  );

  const runNarrativeAction = useCallback(
    (id, actionId) => {
      const ctx = buildContext();
      const section = NARRATIVE_SECTIONS.find((s) => s.id === id);
      const preview = applyNarrativeAction(id, stateRef.current.narrative[id].text, actionId, ctx);
      dispatch({ type: 'AI_NARRATIVE', id, action: actionId, ctx });

      if (preview?.note) {
        schedule(
          () =>
            pushAssistant(
              [
                { type: 'text', text: `**${section?.label}** — ${preview.note}` },
                {
                  type: 'callout',
                  tone: 'coach',
                  title: 'How to undo this',
                  text: 'Use "Revert to my version" on the section.',
                },
              ],
              'SECTION_ACTION',
            ),
          420,
        );
      }
    },
    [buildContext, pushAssistant, schedule],
  );

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RESET' });
  }, [clearTimers]);

  // Step commentary belongs to the builder — it should not fire while the
  // seller is browsing their case list.
  useEffect(() => {
    if (state.view !== 'builder') return;
    if (state.introShown[state.step]) return;
    const intro = getStepIntro(state.step, buildContext());
    if (!intro) return;
    dispatch({ type: 'MARK_INTRO_SHOWN', step: state.step });
    schedule(() => pushAssistant(intro.blocks, intro.intent), state.step === 0 ? 600 : 900);
  }, [state.view, state.step, state.introShown, buildContext, pushAssistant, schedule]);

  useEffect(() => {
    if (state.view !== 'builder' || state.step !== 2 || state.reportReady) return;
    schedule(() => dispatch({ type: 'SET_REPORT_READY' }), 1200);
  }, [state.view, state.step, state.reportReady, schedule]);

  /* The one explicit question, asked by the copilot once the report exists — and
     only if the copilot actually contributed to it. Somebody who filled the case
     in by hand has no opinion to give about a thing they did not use, and asking
     anyway is how a product teaches people to dismiss its prompts. */
  useEffect(() => {
    if (!state.reportReady || !state.aiUsed) return;
    if (state.confidenceAsked || state.caseConfidenceAnswer) return;
    dispatch({ type: 'MARK_CONFIDENCE_ASKED' });
    schedule(
      () =>
        pushAssistant(
          [
            { type: 'text', text: 'How confident do you feel in this business case?' },
            { type: 'confidence' },
          ],
          'CONFIDENCE_ASK',
        ),
      1800,
    );
  }, [
    state.reportReady,
    state.aiUsed,
    state.confidenceAsked,
    state.caseConfidenceAnswer,
    pushAssistant,
    schedule,
  ]);

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
      businessCase,
      capabilityCase,
      caseConfidence,
      currency,
      effectiveDevices,
      skuById,
      ask,
      runNarrativeAction,
      reset,
    }),
    [state, actions, businessCase, capabilityCase, caseConfidence, currency, effectiveDevices, ask, runNarrativeAction, reset],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
