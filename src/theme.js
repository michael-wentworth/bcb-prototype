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

/* The prototype is light-only. A dark theme is a second set of surfaces to
   validate every chart and AI accent against, and it earns nothing in a
   presentation that will be given on a projector. If it comes back, pair
   createDarkTheme(brandRamp) with its own viz steps in global.css — the light
   values there are not safe on a dark surface. */
export const lightTheme = createLightTheme(brandRamp);
