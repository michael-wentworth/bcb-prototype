import React, { useEffect, useRef } from 'react';
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

      {/* The band belongs to a case in progress, not to browsing — and it spans
          the whole app rather than only the content column. The case is the outer
          thing; the copilot is a tool for working inside it, so the copilot sits
          below the band alongside the content it acts on.
          The steps are not in here: they live with the page heading they used to
          duplicate, as shared/StepMasthead.jsx. */}
      {inBuilder ? (
        <WorkflowHeader panelOpen={panelOpen} onTogglePanel={onTogglePanel} />
      ) : null}

      <div className={styles.body}>
        <main className={styles.workflow}>
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
            — it invites a question it cannot answer.
            There is no collapsed-state tab any more: the way back is a Copilot
            toggle that lives in the case band whether the panel is open or shut,
            so nothing has to be discovered after the fact. */}
        {inBuilder && panelOpen ? <AIAssistantPanel onCollapse={onTogglePanel} /> : null}
      </div>
    </div>
  );
}
