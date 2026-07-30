import React from 'react';
import { Tooltip } from '@fluentui/react-components';
import { Info16Regular } from '@fluentui/react-icons';
import styles from './MetricTile.module.css';

/**
 * Stat tile. `hero` promotes the value to the dashboard's lead figure.
 * Values use proportional figures — tabular-nums makes large numbers read loose.
 */
export default function MetricTile({
  label,
  value,
  caption,
  icon,
  hero = false,
  explain,
  loading = false,
}) {
  return (
    <div
      className={`${styles.tile} ${hero ? styles.hero : ''} ${loading ? styles.loading : ''}`}
    >
      <div className={styles.labelRow}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <span className={styles.label}>{label}</span>
        {explain ? (
          <Tooltip relationship="description" withArrow content={explain}>
            <span className={styles.explain} tabIndex={0} role="note" aria-label={explain}>
              <Info16Regular aria-hidden="true" />
            </span>
          </Tooltip>
        ) : null}
      </div>

      {loading ? (
        <div className={styles.shimmer} aria-hidden="true" />
      ) : (
        <div className={styles.value}>{value}</div>
      )}

      {caption ? <div className={styles.caption}>{caption}</div> : null}
    </div>
  );
}
