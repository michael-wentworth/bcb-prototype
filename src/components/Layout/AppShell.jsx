import React, { useEffect, useRef } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import WorkflowHeader from '../WorkflowHeader/WorkflowHeader.jsx';
import AIAssistantPanel from '../AIAssistantPanel/AIAssistantPanel.jsx';
import CustomerDetails from '../CustomerDetails/CustomerDetails.jsx';
import SkuSelection from '../SkuSelection/SkuSelection.jsx';
import CustomerReport from '../CustomerReport/CustomerReport.jsx';
import TopBar from './TopBar.jsx';
import styles from './AppShell.module.css';

const STEP_VIEWS = [CustomerDetails, SkuSelection, CustomerReport];

export default function AppShell({ isDark, onToggleTheme, panelOpen, onTogglePanel }) {
  const { step } = useAppState();
  const StepView = STEP_VIEWS[step] || CustomerDetails;
  const workspaceRef = useRef(null);

  // Each step starts at the top of the workflow, not wherever the last one ended.
  useEffect(() => {
    workspaceRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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
          <WorkflowHeader />
          <div className={`${styles.workspace} scrollArea`} ref={workspaceRef}>
            <div className={styles.stageContainer} key={step}>
              <StepView />
            </div>
          </div>
        </main>

        {panelOpen ? <AIAssistantPanel /> : null}
      </div>
    </div>
  );
}
