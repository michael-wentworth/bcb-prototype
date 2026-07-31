import { createLightTheme } from '@fluentui/react-components';

/**
 * Microsoft brand ramp (Fluent 2 web brand). Kept explicit so the prototype's
 * accent can be re-pointed at a workload brand (Security, Fabric, Power Platform)
 * without touching component code.
 */
export const brandRamp = {
  10: '#061724',
  20: '#082338',
  30: '#0A2E4A',
  40: '#0C3B5E',
  50: '#0E4775',
  60: '#0F548C',
  70: '#115EA3',
  80: '#0F6CBD',
  90: '#2886DE',
  100: '#479EF5',
  110: '#62ABF5',
  120: '#77B7F7',
  130: '#96C6FA',
  140: '#B4D6FA',
  150: '#CFE4FA',
  160: '#EBF3FC',
};

/**
 * The elevation ramp, re-pointed.
 *
 * Fluent's stock ramp is built for a canvas where a card floats: every step
 * carries a 0.14-alpha drop plus a 0.12-alpha ambient ring, and <Card> lands on
 * shadow4 with no border at all. That reads as Material — separation comes from
 * the shadow, and the card has no edge of its own.
 *
 * The enterprise surfaces this is meant to sit beside — Copilot, Power Apps,
 * Fabric, the admin centres — separate with a border and a surface change, and
 * spend shadow only on things that genuinely float above the workflow. So the
 * ramp is remapped rather than removed: resting surfaces get almost nothing,
 * hover gets a hint, and the two steps that mean "above the page" — flyouts and
 * dialogs — keep enough to read as such.
 *
 * Overriding the tokens rather than the components matters: Fluent styles its
 * own Card, Popover, Menu and DialogSurface from these, and a CSS-module class
 * from outside loses to them. Changing the token is the only edit that reaches
 * all of it.
 */
const RESTING = '0 1px 2px rgba(0, 0, 0, 0.06)';
const RAISED = '0 2px 8px rgba(0, 0, 0, 0.08)';
const FLOATING = '0 8px 24px rgba(0, 0, 0, 0.12)';

const elevation = {
  shadow2: RESTING,
  shadow4: RESTING, // where Fluent's <Card> lands, so this is the card's resting state
  shadow8: RAISED, // hover, and anything deliberately lifted off the page
  shadow16: FLOATING, // menus, dropdowns, popovers
  shadow28: FLOATING, // dialogs
  shadow64: FLOATING, // the ceiling: nothing in this app is heavier than a modal
  shadow2Brand: RESTING,
  shadow4Brand: RESTING,
  shadow8Brand: RAISED,
  shadow16Brand: FLOATING,
  shadow28Brand: FLOATING,
  shadow64Brand: FLOATING,
};

/* The prototype is light-only. A dark theme is a second set of surfaces to
   validate every chart and AI accent against, and it earns nothing in a
   presentation that will be given on a projector. If it comes back, pair
   createDarkTheme(brandRamp) with its own viz steps in global.css — the light
   values there are not safe on a dark surface. */
export const lightTheme = {
  ...createLightTheme(brandRamp),
  ...elevation,

  /* Cards and section containers sit at 8px. Fluent ships Large at 6px, which is
     the radius everything card-shaped in this app already asks for — so moving
     the token moves all twenty-one of them at once and leaves Medium (4px) to go
     on doing controls and Small (2px) on chips. */
  borderRadiusLarge: '8px',
};
