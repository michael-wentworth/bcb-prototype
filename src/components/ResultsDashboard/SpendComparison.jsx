import React, { useState } from 'react';
import useElementWidth from './useElementWidth.js';
import { formatCurrency } from '../../data/model.js';
import styles from './Charts.module.css';

const BAR_HEIGHT = 22;
const ROW_HEIGHT = 62;
const LABEL_W = 168;
const VALUE_W = 78;
const RADIUS = 4;

/**
 * Horizontal bar path with a rounded data-end and a square baseline end —
 * grows left to right from a single baseline.
 */
function barPath(x0, y0, w, h, r = RADIUS) {
  const rr = Math.min(r, w / 2, h / 2);
  if (w <= 0) return '';
  const x1 = x0 + w;
  return [
    `M${x0},${y0}`,
    `H${x1 - rr}`,
    `A${rr},${rr} 0 0 1 ${x1},${y0 + rr}`,
    `V${y0 + h - rr}`,
    `A${rr},${rr} 0 0 1 ${x1 - rr},${y0 + h}`,
    `H${x0}`,
    'Z',
  ].join(' ');
}

/**
 * Annual security spend, today versus consolidated. Emphasis form: the
 * Microsoft state carries the accent, the current state recedes to gray — the
 * comparison is the point, not the identity of two series.
 */
export default function SpendComparison({ current, future, contractCount, symbol = 'US$' }) {
  const [wrapRef, width] = useElementWidth(620);
  const [showTable, setShowTable] = useState(false);
  const money = (v, opts) => formatCurrency(v, { symbol, ...opts });

  const rows = [
    {
      key: 'current',
      label: 'Today',
      caption: `${contractCount} third-party contract${contractCount === 1 ? '' : 's'}`,
      value: current,
      tone: 'context',
    },
    {
      key: 'future',
      label: 'With Microsoft',
      value: future,
      tone: 'accent',
    },
  ];

  const max = Math.max(current, future, 1);
  const trackW = Math.max(80, width - LABEL_W - VALUE_W);
  const height = rows.length * ROW_HEIGHT;
  const reduction = current - future;

  return (
    <figure className={`${styles.figure} vizRoot`}>
      <figcaption className={styles.caption}>
        <div>
          <h2 className={styles.chartTitle}>Annual security spend</h2>
          <p className={styles.chartSub}>
            {money(reduction)} a year comes out of the licensing line alone.
          </p>
        </div>
        <button type="button" className={styles.tableToggle} onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'Hide data' : 'View data'}
        </button>
      </figcaption>

      <div className={styles.plotWrap} ref={wrapRef}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`Annual security spend. Today ${money(current)}. With Microsoft ${money(future)}.`}
          className={styles.svg}
        >
          {rows.map((row, i) => {
            const y0 = i * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2;
            const w = (row.value / max) * trackW;
            return (
              <g key={row.key}>
                <text x={0} y={y0 + BAR_HEIGHT / 2 - 4} className={styles.barLabel}>
                  {row.label}
                </text>
                {row.caption ? (
                  <text x={0} y={y0 + BAR_HEIGHT / 2 + 11} className={styles.barCaption}>
                    {row.caption}
                  </text>
                ) : null}
                <path
                  d={barPath(LABEL_W, y0, w, BAR_HEIGHT)}
                  className={row.tone === 'accent' ? styles.barAccent : styles.barContext}
                />
                <text
                  x={LABEL_W + w + 10}
                  y={y0 + BAR_HEIGHT / 2}
                  dy="0.34em"
                  className={styles.barValue}
                >
                  {money(row.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {showTable ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.tableCaption}>Annual security spend by state</caption>
            <thead>
              <tr>
                <th scope="col">State</th>
                <th scope="col">Annual spend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  <td>{money(row.value, { compact: false })}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Reduction</th>
                <td>{money(reduction, { compact: false })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </figure>
  );
}

