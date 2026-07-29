import React, { useState } from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { lightTheme } from './theme.js';
import { AppStateProvider } from './state/AppStateContext.jsx';
import AppShell from './components/Layout/AppShell.jsx';

export default function App() {
  const [panelOpen, setPanelOpen] = useState(true);

  // No className on FluentProvider on purpose: Fluent copies the provider's
  // className onto every tooltip/popover portal node it mounts on <body>, so a
  // layout or background rule attached here gets duplicated onto a full-viewport
  // layer above the app for each open portal. The shell is sized from global.css
  // via `#root > .fui-FluentProvider`, which portals cannot match.
  return (
    <FluentProvider theme={lightTheme}>
      <AppStateProvider>
        <AppShell panelOpen={panelOpen} onTogglePanel={() => setPanelOpen((v) => !v)} />
      </AppStateProvider>
    </FluentProvider>
  );
}
