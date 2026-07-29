import { createLightTheme, createDarkTheme } from '@fluentui/react-components';

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

export const lightTheme = createLightTheme(brandRamp);

export const darkTheme = {
  ...createDarkTheme(brandRamp),
  // Dark-mode brand foregrounds default too dim for the accent-heavy AI surfaces.
  colorBrandForeground1: brandRamp[110],
  colorBrandForeground2: brandRamp[120],
};
