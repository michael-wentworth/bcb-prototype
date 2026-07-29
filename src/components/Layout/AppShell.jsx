import React, { useEffect, useRef } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import WorkflowHeader from '../WorkflowHeader/WorkflowHeader.jsx';
import AIAssistantPanel from '../AIAssistantPanel/AIAssistantPanel.jsx';
import CustomerProfile from '../CustomerProfile/CustomerProfile.jsx';
import SKUSelection from '../SKUSelection/SKUSelection.jsx';
import CompetitiveDisplacement from '../CompetitiveDisplacement/CompetitiveDisplacement.jsx';
import ResultsDashboard from '../ResultsDashboard/ResultsDashboard.jsx';
import StartScreen from '../StartScreen/StartScreen.jsx';
import TopBar from './TopBar.jsx';
import styles from './AppShell.module.css';

const STAGE_VIEWS = [CustomerProfile, SKUSelection, CompetitiveDisplacement, ResultsDashboard];

export default function AppShell({ isDark, onToggleTheme, panelOpen, onTogglePanel }) {
  const { phase, stage } = useAppState();
  const StageView = STAGE_VIEWS[stage] || CustomerProfile;
  const workspaceRef = useRef(null);

  // Each stage starts at the top of the workflow, not wherever the last one ended.
  useEffect(() => {
    workspaceRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage, phase]);

  const starting = phase === 'start';

  return (
    <div className={styles.shell}>
      <TopBar
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        panelOpen={panelOpen}
        onTogglePanel={onTogglePanel}
      />

      <div className={styles.body}>
        <main className={styles.workflow}>
          {/* The stepper belongs to a case in progress, not to the act of
              choosing how to start one. */}
          {!starting ? <WorkflowHeader /> : null}
          <div className={`${styles.workspace} scrollArea`} ref={workspaceRef}>
            <div className={styles.stageContainer} key={starting ? 'start' : stage}>
              {starting ? <StartScreen /> : <StageView />}
            </div>
          </div>
        </main>

        {panelOpen ? <AIAssistantPanel /> : null}
      </div>
    </div>
  );
}
