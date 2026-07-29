import React, { useEffect, useRef } from 'react';
import { Tooltip } from '@fluentui/react-components';
import { Sparkle20Filled } from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import WorkflowHeader from '../WorkflowHeader/WorkflowHeader.jsx';
import AIAssistantPanel from '../AIAssistantPanel/AIAssistantPanel.jsx';
import CustomerDetails from '../CustomerDetails/CustomerDetails.jsx';
import SkuSelection from '../SkuSelection/SkuSelection.jsx';
import CustomerReport from '../CustomerReport/CustomerReport.jsx';
import MyCases from '../MyCases/MyCases.jsx';
import Placeholder from './Placeholder.jsx';
import TopBar from './TopBar.jsx';
import styles from './AppShell.module.css';

const STEP_VIEWS = [CustomerDetails, SkuSelection, CustomerReport];

export default function AppShell({ panelOpen, onTogglePanel }) {
  const { view, step } = useAppState();
  const StepView = STEP_VIEWS[step] || CustomerDetails;
  const workspaceRef = useRef(null);
  const inBuilder = view === 'builder';

  // Each step (or destination) starts at the top rather than wherever the last
  // one was scrolled to.
  useEffect(() => {
    workspaceRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, view]);

  return (
    <div className={styles.shell}>
      <TopBar />

      <div className={styles.body}>
        <main className={styles.workflow}>
          {/* The stepper belongs to a case in progress, not to browsing. */}
          {inBuilder ? <WorkflowHeader /> : null}
          <div className={`${styles.workspace} scrollArea`} ref={workspaceRef}>
            <div
              className={`${styles.stageContainer} ${inBuilder ? '' : styles.wide}`}
              key={`${view}-${step}`}
            >
              {inBuilder ? (
                <StepView />
              ) : view === 'myCases' ? (
                <MyCases />
              ) : (
                <Placeholder view={view} />
              )}
            </div>
          </div>
        </main>

        {/* The copilot only works on a case, so it only exists where there is
            one. On the library and the resource pages it has nothing to act on,
            and an assistant with no available action is worse than no assistant
            — it invites a question it cannot answer. Its collapsed tab goes with
            it, since a way back into something absent is just clutter. */}
        {inBuilder ? (
          panelOpen ? (
            <AIAssistantPanel onCollapse={onTogglePanel} />
          ) : (
            /* With the minimize control inside the panel, collapsing it would
               otherwise leave no way back — this is that way back. */
            <Tooltip content="Show the copilot" relationship="label" withArrow>
              <button
                type="button"
                className={styles.copilotTab}
                onClick={onTogglePanel}
                aria-label="Show the copilot panel"
              >
                <Sparkle20Filled aria-hidden="true" />
              </button>
            </Tooltip>
          )
        ) : null}
      </div>
    </div>
  );
}
