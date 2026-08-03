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
import { buildCapabilityCase } from '../data/capabilityModel.js';
import { buildBusinessCase } from '../data/model.js';
import {
  AUTHORSHIP,
  NARRATIVE_SECTIONS,
  afterAiAction,
  afterHumanEdit,
} from '../data/authoring.js';
import { applyNarrativeAction } from '../data/aiActions.js';
import { DEMO_EXTRACTION, EXTRACTION_EVIDENCE } from '../data/demoCase.js';
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
  negotiatedUplift: '',
  capabilityCompetitors: { contracts: [] },

  narrative: emptyNarrative(),

  /** Per-section provenance: 'empty' | 'ai' | 'assisted' | 'manual'. */
  sectionAuthorship: {
    customer: AUTHORSHIP.EMPTY,
    outcomes: AUTHORSHIP.EMPTY,
    skus: AUTHORSHIP.EMPTY,
    competitors: AUTHORSHIP.EMPTY,
  },

  messages: [],
  thinking: null,
  introShown: {},

  reportReady: false,
};

const setSection = (state, section, next) => ({
  ...state,
  sectionAuthorship: { ...state.sectionAuthorship, [section]: next },
});

const humanTouch = (state, section) =>
  setSection(state, section, afterHumanEdit(state.sectionAuthorship[section]));

const aiTouch = (state, section) =>
  setSection(
    state,
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
      return humanTouch({ ...state, customer: next, fieldMeta: meta }, 'customer');
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
      return { ...state, bundle: { ...state.bundle, ...action.patch }, fieldMeta: meta };
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

    case 'SET_CURRENT_LICENSES':
      /* Changing what the customer owns invalidates the path they were on — an
         E3 path makes no sense once the base is E5, and leaving it selected
         would quietly compute a delta against a license they no longer hold. */
      return humanTouch(
        { ...state, currentLicenses: action.ids, futurePath: '', futureLicenses: [] },
        'customer',
      );

    case 'SET_FUTURE_MODE':
      return { ...state, futureMode: action.mode, futurePath: '', futureLicenses: [] };

    case 'SET_FUTURE_PATH':
      return humanTouch(
        { ...state, futurePath: action.path.id, futureLicenses: [action.path.base, ...action.path.addons] },
        'skus',
      );

    case 'SET_FUTURE_LICENSES':
      return humanTouch({ ...state, futurePath: '', futureLicenses: action.ids }, 'skus');

    case 'SET_NEGOTIATED_UPLIFT':
      return humanTouch({ ...state, negotiatedUplift: action.value }, 'skus');

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
      return humanTouch(
        { ...state, capabilityCompetitors: { ...state.capabilityCompetitors, contracts: next } },
        'competitors',
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
      return humanTouch(
        { ...state, capabilityCompetitors: { ...state.capabilityCompetitors, contracts: next } },
        'competitors',
      );
    }

    case 'UPDATE_CONTRACT':
      return humanTouch(
        {
          ...state,
          capabilityCompetitors: {
            ...state.capabilityCompetitors,
            contracts: state.capabilityCompetitors.contracts.map((c) =>
              c.id === action.id ? { ...c, [action.key]: action.value } : c,
            ),
          },
        },
        'competitors',
      );

    case 'REMOVE_CONTRACT':
      return humanTouch(
        {
          ...state,
          capabilityCompetitors: {
            ...state.capabilityCompetitors,
            contracts: state.capabilityCompetitors.contracts.filter((c) => c.id !== action.id),
          },
        },
        'competitors',
      );

    /* ----------------------------- assistant ----------------------------- */
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };

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

    case 'MARK_INTRO_SHOWN':
      return { ...state, introShown: { ...state.introShown, [action.step]: true } };

    case 'SET_REPORT_READY':
      return { ...state, reportReady: true };

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
        negotiatedUplift: state.negotiatedUplift,
      }),
    [
      state.caseSetup.analysisPeriod,
      state.customer.numberOfUsers,
      state.currentLicenses,
      state.futureLicenses,
      state.capabilityCompetitors,
      state.negotiatedUplift,
    ],
  );

  const businessCaseRef = useRef(businessCase);
  businessCaseRef.current = businessCase;

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
      setFutureLicenses: (ids) => dispatch({ type: 'SET_FUTURE_LICENSES', ids }),
      setNegotiatedUplift: (value) => dispatch({ type: 'SET_NEGOTIATED_UPLIFT', value }),
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

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
      businessCase,
      capabilityCase,
      currency,
      effectiveDevices,
      skuById,
      ask,
      runNarrativeAction,
      reset,
    }),
    [state, actions, businessCase, capabilityCase, currency, effectiveDevices, ask, runNarrativeAction, reset],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
