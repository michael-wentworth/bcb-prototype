import React, { useEffect, useState } from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { darkTheme, lightTheme } from './theme.js';
import { AppStateProvider } from './state/AppStateContext.jsx';
import AppShell from './components/Layout/AppShell.jsx';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // The chart roles in global.css key off [data-theme] so their steps swap with
  // the Fluent theme rather than being flipped programmatically.
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isDark]);

  // No className on FluentProvider on purpose: Fluent copies the provider's
  // className onto every tooltip/popover portal node it mounts on <body>, so a
  // layout or background rule attached here gets duplicated onto a full-viewport
  // layer above the app for each open portal. The shell is sized from global.css
  // via `#root > .fui-FluentProvider`, which portals cannot match.
  return (
    <FluentProvider theme={isDark ? darkTheme : lightTheme}>
      <AppStateProvider>
        <AppShell
          isDark={isDark}
          onToggleTheme={() => setIsDark((v) => !v)}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((v) => !v)}
        />
      </AppStateProvider>
    </FluentProvider>
  );
}
