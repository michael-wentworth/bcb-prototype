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

const initialState = {
  stage: 0,
  maxStageReached: 0,

  profile: { ...emptyProfile },
  /** key -> { confidence, basis, evidence, source, populatedAt } */
  fieldMeta: {},
  profilePopulated: false,
  vendors: [],

  selectedSkus: SKU_RECOMMENDATIONS.filter((s) => s.recommended).map((s) => s.id),
  includedDisplacements: DISPLACEMENTS.map((d) => d.id),

  messages: [],
  thinking: null,
  introShown: {},

  reportReady: false,
  highlightedGap: null,
};

let populateTick = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STAGE': {
      const stage = Math.max(0, Math.min(STAGES.length - 1, action.stage));
      return { ...state, stage, maxStageReached: Math.max(state.maxStageReached, stage) };
    }

    case 'SET_FIELD':
      return {
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
      };

    case 'POPULATE_FIELD': {
      const f = action.field;
      return {
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
      };
    }

    case 'POPULATE_VENDORS':
      return { ...state, vendors: DETECTED_VENDORS, profilePopulated: true };

    case 'TOGGLE_SKU': {
      const on = state.selectedSkus.includes(action.id);
      return {
        ...state,
        selectedSkus: on
          ? state.selectedSkus.filter((id) => id !== action.id)
          : [...state.selectedSkus, action.id],
      };
    }

    case 'TOGGLE_DISPLACEMENT': {
      const on = state.includedDisplacements.includes(action.id);
      return {
        ...state,
        includedDisplacements: on
          ? state.includedDisplacements.filter((id) => id !== action.id)
          : DISPLACEMENTS.filter(
              (d) => d.id === action.id || state.includedDisplacements.includes(d.id),
            ).map((d) => d.id),
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
      return { ...initialState, profile: { ...emptyProfile }, fieldMeta: {}, introShown: {} };

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
          schedule(
            () => dispatch({ type: 'POPULATE_VENDORS' }),
            220 + EXTRACTED_PROFILE.length * 300 + 260,
          );
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

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: 'RESET' });
  }, [clearTimers]);

  // Proactive stage commentary — the assistant speaks first when a stage opens.
  useEffect(() => {
    if (state.introShown[state.stage]) return;
    if (state.stage > 0 && !state.profilePopulated) return;

    const intro = getStageIntro(state.stage, buildContext());
    if (!intro) return;

    dispatch({ type: 'MARK_INTRO_SHOWN', stage: state.stage });
    const delay = state.stage === 0 ? 500 : 900;
    schedule(() => pushAssistant(intro.blocks, intro.intent), delay);
  }, [
    state.stage,
    state.introShown,
    state.profilePopulated,
    buildContext,
    pushAssistant,
    schedule,
  ]);

  // The report "assembling" beat — sells that stage 4 is generated, not static.
  useEffect(() => {
    if (state.stage !== 3 || state.reportReady) return;
    schedule(() => dispatch({ type: 'SET_REPORT_READY' }), 1500);
  }, [state.stage, state.reportReady, schedule]);

  const value = useMemo(
    () => ({
      ...state,
      businessCase,
      ask,
      goToStage,
      setField,
      toggleSku,
      toggleDisplacement,
      highlightGap,
      reset,
    }),
    [
      state,
      businessCase,
      ask,
      goToStage,
      setField,
      toggleSku,
      toggleDisplacement,
      highlightGap,
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
