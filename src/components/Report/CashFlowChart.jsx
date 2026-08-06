import React from 'react';
import { useId } from '@fluentui/react-components';
import useElementWidth from '../ResultsDashboard/useElementWidth.js';
import { formatCurrency } from '../../data/model.js';
import styles from './Report.module.css';

const PAD_T = 16;
const PAD_B = 34;
const AXIS_W = 60;
const RADIUS = 3;

/**
 * Axis steps a reader can do arithmetic on.
 *
 * Dividing the data range into equal thirds gives labels like $885K and $11K,
 * which are exact and useless: nobody reads a bar against $885K. Snapping the
 * step to 1, 2, 2.5 or 5 times a power of ten costs a little headroom and buys
 * labels that mean something. Because the bounds land on multiples of the step,
 * a range that crosses zero always has a tick at zero.
 *
 * The step floors at one dollar. Below that the loop can round two adjacent
 * ticks to the same integer, which renders a duplicate gridline and a duplicate
 * React key, and produces an axis labelled "$0" and "$1" on a case worth
 * millions.
 */
function niceTicks(min, max, count = 4) {
  const lo0 = Number.isFinite(min) ? min : 0;
  const hi0 = Number.isFinite(max) ? max : 0;
  const raw = (hi0 - lo0 || 1) / (count - 1);
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const norm = raw / mag;
  const step = Math.max(
    1,
    (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag,
  );
  const lo = Math.floor(lo0 / step) * step;
  const hi = Math.ceil(hi0 / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v));
  const ticks = [...new Set(out)];
  return ticks.length > 1 ? ticks : [ticks[0] ?? 0, (ticks[0] ?? 0) + step];
}

/**
 * The shape of the table above it, and nothing else.
 *
 * One column per year, pivoting on the zero line: benefit up, cost down, both
 * on the same centre so a year reads as one object. Offsetting them sideways
 * put a year's two figures at a different x AND a different y, which scattered
 * the chart and left the eye pairing columns by guesswork.
 *
 * No data table of its own. The card leads with these figures laid out by year,
 * and a toggle that reprints them transposed is the same content twice.
 */
export default function CashFlowChart({ rows, symbol = '$' }) {
  const [wrapRef, width] = useElementWidth(680);
  const clipId = useId('cf-clip');
  const money = (v) => formatCurrency(v, { symbol });

  /* A case with no vendors and a future state no dearer than today has nothing
     to plot. An axis drawn over it is a fabricated scale, so say so instead:
     the table above already carries the zeros. */
  if (rows.every((r) => r.benefit === 0 && r.cost === 0)) {
    return (
      <p className={styles.chartEmpty}>
        No benefits or costs to plot. Name a vendor, or set a rate above what the customer pays
        today.
      </p>
    );
  }

  /* Start at zero, so the balance line has an origin rather than beginning
     mid-air. */
  const points = [{ label: 'Start', cumulative: 0, benefit: 0, cost: 0, origin: true }, ...rows];

  const values = rows.flatMap((r) => [r.benefit, -r.cost, r.cumulative]);
  const ticks = niceTicks(Math.min(...values, 0), Math.max(...values, 0));
  const top = ticks[ticks.length - 1];
  const bottom = ticks[0];
  const span = top - bottom || 1;

  const height = 260;
  const plotH = height - PAD_T - PAD_B;
  const plotW = Math.max(60, width - AXIS_W - 8);
  const colW = plotW / points.length;
  const barW = Math.max(10, Math.min(34, colW * 0.34));

  const y = (v) => PAD_T + ((top - v) / span) * plotH;
  const x = (i) => AXIS_W + colW * (i + 0.5);
  const zero = y(0);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.cumulative)}`).join(' ');

  return (
    <div className={styles.chart} ref={wrapRef}>
      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-label={`Cash flow by year. ${rows
          .map(
            (r) =>
              `${r.label}: benefit ${money(r.benefit)}, cost ${money(r.cost)}, running balance ${money(r.cumulative)}`,
          )
          .join('. ')}`}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={AXIS_W} y={0} width={Math.max(0, plotW + 8)} height={height} />
          </clipPath>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line
              className={t === 0 ? styles.cfZero : styles.cfGrid}
              x1={AXIS_W}
              y1={y(t)}
              x2={AXIS_W + plotW}
              y2={y(t)}
            />
            <text
              className={styles.cfAxis}
              x={AXIS_W - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {money(t)}
            </text>
          </g>
        ))}
        {/* Zero always has a rule, even when it is not one of the four ticks. */}
        {ticks.includes(0) ? null : (
          <line className={styles.cfZero} x1={AXIS_W} y1={zero} x2={AXIS_W + plotW} y2={zero} />
        )}

        <g clipPath={`url(#${clipId})`}>
          {points.map((p, i) =>
            p.origin ? null : (
              /* No bar for a zero flow. A minimum height would draw a green
                 hairline for "no benefit this year", which on a chart whose
                 whole colour semantic is green-means-benefit says the opposite
                 of the data. */
              <g key={p.label}>
                {p.benefit > 0 ? (
                  <rect
                    className={styles.cfBenefit}
                    x={x(i) - barW / 2}
                    y={y(p.benefit)}
                    width={barW}
                    height={Math.max(1, zero - y(p.benefit))}
                    rx={RADIUS}
                  />
                ) : null}
                {p.cost > 0 ? (
                  <rect
                    className={styles.cfCost}
                    x={x(i) - barW / 2}
                    y={zero}
                    width={barW}
                    height={Math.max(1, y(-p.cost) - zero)}
                    rx={RADIUS}
                  />
                ) : null}
              </g>
            ),
          )}

          <path className={styles.cfLine} d={line} fill="none" />
          {points.map((p, i) => (
            <circle key={p.label} className={styles.cfDot} cx={x(i)} cy={y(p.cumulative)} r={4} />
          ))}
        </g>

        {points.map((p, i) => (
          <text className={styles.cfTick} key={p.label} x={x(i)} y={height - 14} textAnchor="middle">
            {p.label}
          </text>
        ))}
      </svg>

      <ul className={styles.legend}>
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swBenefit}`} aria-hidden="true" />
          Benefits
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swCost}`} aria-hidden="true" />
          Costs
        </li>
        <li className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swLine}`} aria-hidden="true" />
          Running balance
        </li>
      </ul>
    </div>
  );
}
