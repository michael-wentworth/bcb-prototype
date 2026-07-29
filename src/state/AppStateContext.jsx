import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  DETECTED_VENDORS,
  DISPLACEMENTS,
  EXTRACTED_PROFILE,
  SKU_RECOMMENDATIONS,
  STAGES,
  buildBusinessCase,
} from '../data/mockData.js';
import {
  AUTHORSHIP,
  NARRATIVE_SECTIONS,
  afterAiAction,
  afterHumanEdit,
  templateById,
} from '../data/authoring.js';
import { applyNarrativeAction } from '../data/aiActions.js';
import { getStageIntro, resolveResponse } from '../data/aiScript.js';

const AppStateContext = createContext(null);

let messageId = 0;
const nextId = () => `m${++messageId}`;

const emptyProfile = {
  companyName: '',
  industry: '',
  employeeCount: '',
  geography: '',
  currentLicensing: '',
  businessObjectives: '',
};

const emptyNarrative = () =>
  NARRATIVE_SECTIONS.reduce(
    (acc, s) => ({ ...acc, [s.id]: { text: '', authorship: AUTHORSHIP.EMPTY, snapshot: null } }),
    {},
  );

const initialState = {
  /* --------------------------- creation ---------------------------- */
  // The workflow does not begin until a creation mode is chosen. Dropping
  // users straight into an AI prompt is what made the assistant feel
  // mandatory; the start screen is the fix.
  phase: 'start',
  creationMode: null,
  templateId: null,
  caseTitle: 'Untitled business case',

  stage: 0,
  maxStageReached: 0,

  profile: { ...emptyProfile },
  /** key -> { confidence, basis, evidence, source, populatedAt } */
  fieldMeta: {},
  profilePopulated: false,
  vendors: [],

  // Nothing is pre-selected. A blank case is genuinely blank, and the AI
  // shortlist is something the copilot does, not a default the user inherits.
  selectedSkus: [],
  manualSkus: [],
  includedDisplacements: [],
  manualDisplacements: [],

  /** Per-section provenance: 'empty' | 'ai' | 'assisted' | 'manual'. */
  sectionAuthorship: {
    profile: AUTHORSHIP.EMPTY,
    solutions: AUTHORSHIP.EMPTY,
    displacement: AUTHORSHIP.EMPTY,
  },

  narrative: emptyNarrative(),

  messages: [],
  thinking: null,
  introShown: {},

  reportReady: false,
  highlightedGap: null,
};

let populateTick = 0;

const setSection = (state, section, next) => ({
  ...state,
  sectionAuthorship: { ...state.sectionAuthorship, [section]: next },
});

function reducer(state, action) {
  switch (action.type) {
    /* ---------------------------- creation ---------------------------- */
    case 'START_CASE': {
      const template = action.templateId ? templateById(action.templateId) : null;
      return {
        ...state,
        phase: 'workflow',
        creationMode: action.mode,
        templateId: action.templateId || null,
        caseTitle:
          action.title?.trim() ||
          (template ? template.titleTemplate : 'Untitled business case'),
        stage: 0,
        introShown: {},
      };
    }

    case 'SET_CASE_TITLE':
      return { ...state, caseTitle: action.title };

    case 'BACK_TO_START':
      return { ...initialState, narrative: emptyNarrative(), profile: { ...emptyProfile } };

    case 'SET_STAGE': {
      const stage = Math.max(0, Math.min(STAGES.length - 1, action.stage));
      return { ...state, stage, maxStageReached: Math.max(state.maxStageReached, stage) };
    }

    case 'SET_FIELD':
      return setSection(
        {
          ...state,
          profile: { ...state.profile, [action.key]: action.value },
          fieldMeta: {
            ...state.fieldMeta,
            [action.key]: {
              ...(state.fieldMeta[action.key] || {}),
              source: 'user',
              confidence: 'confirmed',
              basis: 'Edited by you',
            },
          },
        },
        'profile',
        afterHumanEdit(state.sectionAuthorship.profile),
      );

    case 'POPULATE_FIELD': {
      const f = action.field;
      return setSection(
        {
          ...state,
          profile: { ...state.profile, [f.key]: f.value },
          fieldMeta: {
            ...state.fieldMeta,
            [f.key]: {
              confidence: f.confidence,
              basis: f.basis,
              evidence: f.evidence,
              source: 'ai',
              populatedAt: ++populateTick,
            },
          },
        },
        'profile',
        afterAiAction(state.sectionAuthorship.profile, {
          fromScratch: state.sectionAuthorship.profile === AUTHORSHIP.EMPTY,
        }),
      );
    }

    case 'POPULATE_VENDORS':
      return { ...state, vendors: DETECTED_VENDORS, profilePopulated: true };

    /** The copilot shortlisting solutions — distinct from the seller picking them. */
    case 'AI_SHORTLIST':
      return setSection(
        {
          ...state,
          selectedSkus: SKU_RECOMMENDATIONS.filter((s) => s.recommended).map((s) => s.id),
        },
        'solutions',
        afterAiAction(state.sectionAuthorship.solutions, {
          fromScratch: state.sectionAuthorship.solutions === AUTHORSHIP.EMPTY,
        }),
      );

    case 'AI_DETECT_DISPLACEMENTS':
      return setSection(
        { ...state, includedDisplacements: DISPLACEMENTS.map((d) => d.id) },
        'displacement',
        afterAiAction(state.sectionAuthorship.displacement, {
          fromScratch: state.sectionAuthorship.displacement === AUTHORSHIP.EMPTY,
        }),
      );

    case 'TOGGLE_SKU': {
      const on = state.selectedSkus.includes(action.id);
      return setSection(
        {
          ...state,
          selectedSkus: on
            ? state.selectedSkus.filter((id) => id !== action.id)
            : [...state.selectedSkus, action.id],
        },
        'solutions',
        afterHumanEdit(state.sectionAuthorship.solutions),
      );
    }

    case 'ADD_MANUAL_SKU': {
      if (state.manualSkus.some((s) => s.id === action.sku.id)) return state;
      return setSection(
        {
          ...state,
          manualSkus: [...state.manualSkus, action.sku],
          selectedSkus: [...state.selectedSkus, action.sku.id],
        },
        'solutions',
        afterHumanEdit(state.sectionAuthorship.solutions),
      );
    }

    case 'REMOVE_MANUAL_SKU':
      return setSection(
        {
          ...state,
          manualSkus: state.manualSkus.filter((s) => s.id !== action.id),
          selectedSkus: state.selectedSkus.filter((id) => id !== action.id),
        },
        'solutions',
        afterHumanEdit(state.sectionAuthorship.solutions),
      );

    case 'TOGGLE_DISPLACEMENT': {
      const on = state.includedDisplacements.includes(action.id);
      return setSection(
        {
          ...state,
          includedDisplacements: on
            ? state.includedDisplacements.filter((id) => id !== action.id)
            : DISPLACEMENTS.filter(
                (d) => d.id === action.id || state.includedDisplacements.includes(d.id),
              ).map((d) => d.id),
        },
        'displacement',
        afterHumanEdit(state.sectionAuthorship.displacement),
      );
    }

    case 'ADD_MANUAL_DISPLACEMENT':
      return setSection(
        { ...state, manualDisplacements: [...state.manualDisplacements, action.row] },
        'displacement',
        afterHumanEdit(state.sectionAuthorship.displacement),
      );

    case 'REMOVE_MANUAL_DISPLACEMENT':
      return setSection(
        {
          ...state,
          manualDisplacements: state.manualDisplacements.filter((d) => d.id !== action.id),
        },
        'displacement',
        afterHumanEdit(state.sectionAuthorship.displacement),
      );

    /* --------------------------- narrative ---------------------------- */
    case 'SET_NARRATIVE': {
      const current = state.narrative[action.id];
      return {
        ...state,
        narrative: {
          ...state.narrative,
          [action.id]: {
            ...current,
            text: action.text,
            authorship: action.text.trim()
              ? afterHumanEdit(current.authorship)
              : AUTHORSHIP.EMPTY,
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
            // Snapshot so "revert to my version" is a real undo rather than a
            // promise the prototype cannot keep.
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
        narrative: {
          ...state.narrative,
          [action.id]: { ...current.snapshot, snapshot: null },
        },
      };
    }

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
      return { ...state, introShown: { ...state.introShown, [action.stage]: true } };

    case 'SET_REPORT_READY':
      return { ...state, reportReady: true };

    case 'HIGHLIGHT_GAP':
      return { ...state, highlightedGap: action.id };

    case 'RESET':
      populateTick = 0;
      return {
        ...initialState,
        profile: { ...emptyProfile },
        fieldMeta: {},
        introShown: {},
        narrative: emptyNarrative(),
      };

    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Every scheduled callback registers here so a reset or unmount can cancel
  // in-flight scripted sequences instead of writing into a stale tree.
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

  const businessCase = useMemo(
    () => buildBusinessCase(state.includedDisplacements),
    [state.includedDisplacements],
  );
  const businessCaseRef = useRef(businessCase);
  businessCaseRef.current = businessCase;

  const buildContext = useCallback(() => {
    const s = stateRef.current;
    return {
      stage: s.stage,
      profile: s.profile,
      profilePopulated: s.profilePopulated,
      selectedSkus: s.selectedSkus,
      includedDisplacements: s.includedDisplacements,
      creationMode: s.creationMode,
      sectionAuthorship: s.sectionAuthorship,
      narrative: s.narrative,
      businessCase: businessCaseRef.current,
    };
  }, []);

  const pushAssistant = useCallback((blocks, intent) => {
    dispatch({
      type: 'ADD_MESSAGE',
      message: { id: nextId(), role: 'assistant', blocks, intent },
    });
  }, []);

  /** The scripted POPULATE behaviour: fields land one at a time, not all at once. */
  const runActions = useCallback(
    (actions) => {
      actions.forEach((action) => {
        if (action.type === 'populateProfile') {
          EXTRACTED_PROFILE.forEach((field, i) => {
            schedule(() => dispatch({ type: 'POPULATE_FIELD', field }), 220 + i * 300);
          });
          const after = 220 + EXTRACTED_PROFILE.length * 300 + 260;
          schedule(() => dispatch({ type: 'POPULATE_VENDORS' }), after);
          // The copilot fills the downstream sections too, so the AI path really
          // is "describe it once and get a draft" rather than a partial start.
          schedule(() => dispatch({ type: 'AI_SHORTLIST' }), after + 200);
          schedule(() => dispatch({ type: 'AI_DETECT_DISPLACEMENTS' }), after + 400);
        }
        if (action.type === 'aiShortlist') {
          schedule(() => dispatch({ type: 'AI_SHORTLIST' }), 300);
        }
        if (action.type === 'aiDetectDisplacements') {
          schedule(() => dispatch({ type: 'AI_DETECT_DISPLACEMENTS' }), 300);
        }
        if (action.type === 'goToStage') {
          schedule(() => dispatch({ type: 'SET_STAGE', stage: action.stage }), 400);
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

      // Walk the thinking steps so the wait reads as work, not as latency.
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

  const goToStage = useCallback((stage) => {
    dispatch({ type: 'SET_STAGE', stage });
  }, []);

  const setField = useCallback((key, value) => {
    dispatch({ type: 'SET_FIELD', key, value });
  }, []);

  const toggleSku = useCallback((id) => dispatch({ type: 'TOGGLE_SKU', id }), []);
  const toggleDisplacement = useCallback((id) => dispatch({ type: 'TOGGLE_DISPLACEMENT', id }), []);
  const highlightGap = useCallback((id) => dispatch({ type: 'HIGHLIGHT_GAP', id }), []);

  /* ----------------------- creation & authoring ------------------------ */

  const startCase = useCallback(
    ({ mode, templateId, title, prompt }) => {
      dispatch({ type: 'START_CASE', mode, templateId, title });
      // Only the AI path hands work to the copilot. The other two leave the case
      // alone until the author asks for something.
      if (mode === 'ai' && prompt?.trim()) {
        schedule(() => ask(prompt.trim()), 650);
      }
    },
    [ask, schedule],
  );

  const backToStart = useCallback(() => {
    clearTimers();
    dispatch({ type: 'BACK_TO_START' });
  }, [clearTimers]);

  const setCaseTitle = useCallback((title) => dispatch({ type: 'SET_CASE_TITLE', title }), []);
  const addManualSku = useCallback((sku) => dispatch({ type: 'ADD_MANUAL_SKU', sku }), []);
  const removeManualSku = useCallback((id) => dispatch({ type: 'REMOVE_MANUAL_SKU', id }), []);
  const addManualDisplacement = useCallback(
    (row) => dispatch({ type: 'ADD_MANUAL_DISPLACEMENT', row }),
    [],
  );
  const removeManualDisplacement = useCallback(
    (id) => dispatch({ type: 'REMOVE_MANUAL_DISPLACEMENT', id }),
    [],
  );
  const setNarrative = useCallback((id, text) => dispatch({ type: 'SET_NARRATIVE', id, text }), []);
  const revertNarrative = useCallback((id) => dispatch({ type: 'REVERT_NARRATIVE', id }), []);

  /** Section-level AI. Narrates what it did so an in-document action is never silent. */
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
                  title: 'It is yours to change',
                  text: 'Edit it like any other text, or use “Revert to my version” on the section to undo what I did.',
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

  // Proactive stage commentary — the assistant speaks first when a stage opens,
  // but only once a case exists and only in a tone that matches how it was
  // created. A blank case gets an offer of help, not a sales pitch for AI.
  useEffect(() => {
    if (state.phase !== 'workflow') return;
    if (state.introShown[state.stage]) return;

    const intro = getStageIntro(state.stage, buildContext());
    if (!intro) return;

    dispatch({ type: 'MARK_INTRO_SHOWN', stage: state.stage });
    const delay = state.stage === 0 ? 600 : 900;
    schedule(() => pushAssistant(intro.blocks, intro.intent), delay);
  }, [
    state.phase,
    state.stage,
    state.introShown,
    buildContext,
    pushAssistant,
    schedule,
  ]);

  // The report "assembling" beat — sells that stage 4 is generated, not static.
  useEffect(() => {
    if (state.stage !== 3 || state.reportReady) return;
    schedule(() => dispatch({ type: 'SET_REPORT_READY' }), 1500);
  }, [state.stage, state.reportReady, schedule]);

  /** Case-level lineage, for the authorship summary in the header. */
  const authorship = useMemo(() => {
    const levels = [
      state.sectionAuthorship.profile,
      state.sectionAuthorship.solutions,
      state.sectionAuthorship.displacement,
      ...NARRATIVE_SECTIONS.map((s) => state.narrative[s.id].authorship),
    ];
    const counts = { ai: 0, assisted: 0, manual: 0, empty: 0 };
    levels.forEach((l) => {
      counts[l || AUTHORSHIP.EMPTY] += 1;
    });
    return { ...counts, total: levels.length, aiTouched: counts.ai + counts.assisted };
  }, [state.sectionAuthorship, state.narrative]);

  const template = useMemo(
    () => (state.templateId ? templateById(state.templateId) : null),
    [state.templateId],
  );

  const value = useMemo(
    () => ({
      ...state,
      businessCase,
      authorship,
      template,
      ask,
      goToStage,
      setField,
      toggleSku,
      toggleDisplacement,
      highlightGap,
      startCase,
      backToStart,
      setCaseTitle,
      addManualSku,
      removeManualSku,
      addManualDisplacement,
      removeManualDisplacement,
      setNarrative,
      revertNarrative,
      runNarrativeAction,
      reset,
    }),
    [
      state,
      businessCase,
      authorship,
      template,
      ask,
      goToStage,
      setField,
      toggleSku,
      toggleDisplacement,
      highlightGap,
      startCase,
      backToStart,
      setCaseTitle,
      addManualSku,
      removeManualSku,
      addManualDisplacement,
      removeManualDisplacement,
      setNarrative,
      revertNarrative,
      runNarrativeAction,
      reset,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
