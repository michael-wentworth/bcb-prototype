import React from 'react';
import { Avatar, Badge, Button, Tooltip } from '@fluentui/react-components';
import {
  ArrowReset20Regular,
  PanelRightContract20Regular,
  PanelRightExpand20Regular,
  Sparkle24Filled,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons';
import { useAppState } from '../../state/AppStateContext.jsx';
import styles from './TopBar.module.css';

export default function TopBar({ isDark, onToggleTheme, panelOpen, onTogglePanel }) {
  const { profile, reset } = useAppState();

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          <Sparkle24Filled />
        </span>
        <div className={styles.brandText}>
          <span className={styles.product}>Business Case Builder</span>
          <span className={styles.org}>Microsoft Solution Selling</span>
        </div>
        <Badge appearance="tint" color="brand" size="small" className={styles.preview}>
          FY27 Preview
        </Badge>
      </div>

      <div className={styles.context}>
        {profile.companyName ? (
          <>
            {/* A plain rule rather than Fluent's Divider: Divider's root sets
                flex-grow: 1, which wins over a CSS Module rule on source order
                and stretches it across the whole header. */}
            <span className={styles.divider} aria-hidden="true" />
            <span className={styles.caseLabel}>Active case</span>
            <span className={styles.caseName}>
              {profile.companyName}
              {profile.industry ? ` · ${profile.industry}` : ''}
            </span>
          </>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Tooltip content="Start a new business case" relationship="label" withArrow>
          <Button appearance="subtle" icon={<ArrowReset20Regular />} onClick={reset} aria-label="Reset prototype" />
        </Tooltip>
        <Tooltip
          content={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          relationship="label"
          withArrow
        >
          <Button
            appearance="subtle"
            icon={isDark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          />
        </Tooltip>
        <Tooltip
          content={panelOpen ? 'Hide the assistant' : 'Show the assistant'}
          relationship="label"
          withArrow
        >
          <Button
            appearance="subtle"
            icon={panelOpen ? <PanelRightContract20Regular /> : <PanelRightExpand20Regular />}
            onClick={onTogglePanel}
            aria-label={panelOpen ? 'Hide the assistant panel' : 'Show the assistant panel'}
          />
        </Tooltip>
        <Avatar name="Alex Mercer" size={32} color="colorful" aria-label="Alex Mercer" />
      </div>
    </header>
  );
}
