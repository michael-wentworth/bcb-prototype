import React, { useState } from 'react';
import { useId } from '@fluentui/react-components';
import useElementWidth from '../ResultsDashboard/useElementWidth.js';
import { formatCurrency } from '../../data/model.js';
import styles from './Report.module.css';

const ROW_H = 54;
const BAR_H = 26;
const RADIUS = 4;

/* The three columns are proportions of the measured width, not fixed pixels.
   Fixed gutters plus a floored plot meant the drawn content was always at least
   466 units wide inside a viewBox that could be 320, so on a phone the bars ran
   past the edge of the SVG and printed straight over the value labels. As
   fractions the three always sum to the width, whatever the width is. */
const LABEL_FRAC = 0.32;
const VALUE_FRAC = 0.18;
const LABEL_MAX = 210;
const VALUE_MAX = 96;

/**
 * Annual licensing, today to future, one step at a time.
 *
 * A waterfall rather than two bars because the question executives ask is not
 * "which is bigger" but "where did the difference go" — and the two movements
 * pull in opposite directions, which a side-by-side comparison hides inside a
 * single net.
 *
 * Horizontal, not vertical: the labels are phrases rather than dates, and a
 * vertical waterfall would either rotate them or truncate them.
 */
export default function WaterfallChart({ steps, total, totalLabel, symbol = '$' }) {
  const [wrapRef, width] = useElementWidth(680);
  const [showTable, setShowTable] = useState(false);
  const clipId = useId('wf-label');
  const money = (v, opts) => formatCurrency(v, { symbol, ...opts });

  /* Running balance, so each bar starts where the last one finished. */
  const rows = [];
  let running = 0;
  steps.forEach((s) => {
    if (s.kind === 'total') {
      rows.push({ ...s, from: 0, to: s.value });
      running = s.value;
    } else {
      rows.push({ ...s, from: running, to: running + s.value });
      running += s.value;
    }
  });
  rows.push({ id: '__total', label: totalLabel, value: total, kind: 'total', from: 0, to: total });

  /* NaN anywhere in the data would make max NaN and every bar's x and width
     NaN with it — the chart would vanish while the rest of the page rendered
     normally. The model coerces its inputs; this is the second belt. */
  const finite = (v) => (Number.isFinite(v) ? v : 0);
  const max = Math.max(...rows.flatMap((r) => [Math.abs(finite(r.from)), Math.abs(finite(r.to))]), 1);
  const labelW = Math.min(LABEL_MAX, width * LABEL_FRAC);
  const valueW = Math.min(VALUE_MAX, width * VALUE_FRAC);
  const plotW = Math.max(40, width - labelW - valueW);
  const x = (v) => (Math.abs(finite(v)) / max) * plotW;

  const height = rows.length * ROW_H;

  return (
    <div className={styles.chart} ref={wrapRef}>
      <div className={styles.chartHead}>
        <div>
          <h3 className={styles.chartTitle}>Annual licensing, today to future</h3>
          <p className={styles.chartLead}>
            What stops, what starts, and what the estate costs a year either side of the move.
          </p>
        </div>
        <button
          type="button"
          className={styles.chartToggle}
          aria-expanded={showTable}
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? 'Hide data' : 'View data'}
        </button>
      </div>

      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-label={rows.map((r) => `${r.label}: ${money(r.value)}`).join('. ')}
      >
        {/* SVG text does not wrap, so a narrow card would otherwise print the
            step names straight across the bars. Clipped to their own column;
            the View-data table carries the full wording. */}
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={Math.max(0, labelW - 8)} height={height} />
          </clipPath>
        </defs>
        {rows.map((r, i) => {
          const y = i * ROW_H + (ROW_H - BAR_H) / 2;
          const left = labelW + Math.min(x(r.from), x(r.to));
          const w = Math.max(2, Math.abs(x(r.to) - x(r.from)));
          const tone =
            r.kind === 'total' ? styles.wfTotal : r.value < 0 ? styles.wfDown : styles.wfUp;
          return (
            <g key={r.id}>
              <text
                className={styles.wfLabel}
                x={0}
                y={i * ROW_H + ROW_H / 2}
                dominantBaseline="middle"
                clipPath={`url(#${clipId})`}
              >
                {r.label}
              </text>
              <rect className={tone} x={left} y={y} width={w} height={BAR_H} rx={RADIUS} />
              {/* A hairline from the end of one bar to the start of the next, so
                  the running balance is visible rather than implied. */}
              {i < rows.length - 1 && rows[i + 1].kind !== 'total' ? (
                <line
                  className={styles.wfConnector}
                  x1={labelW + x(r.to)}
                  y1={y + BAR_H}
                  x2={labelW + x(r.to)}
                  y2={y + ROW_H}
                />
              ) : null}
              <text
                className={styles.wfValue}
                x={width}
                y={i * ROW_H + ROW_H / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {r.value < 0 ? `−${money(Math.abs(r.value))}` : money(r.value)}
              </text>
            </g>
          );
        })}
      </svg>

      {showTable ? (
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col" className={styles.numeric}>
                Amount
              </th>
              <th scope="col" className={styles.numeric}>
                Running
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.label}</th>
                <td className={styles.numeric}>
                  {r.value < 0
                    ? `−${money(Math.abs(r.value), { compact: false })}`
                    : money(r.value, { compact: false })}
                </td>
                <td className={styles.numeric}>{money(r.to, { compact: false })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
