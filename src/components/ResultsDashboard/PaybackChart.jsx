import React, { useId, useMemo, useState } from 'react';
import useElementWidth from './useElementWidth.js';
import styles from './Charts.module.css';

const M = { top: 22, right: 20, bottom: 30, left: 62 };
const PLOT_HEIGHT = 190;

function formatAxisMoney(v) {
  const sign = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (a === 0) return '$0';
  if (a >= 1_000_000) {
    const m = a / 1_000_000;
    return `${sign}$${(Math.round(m * 10) / 10).toString()}M`;
  }
  return `${sign}$${Math.round(a / 1000)}K`;
}

function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const rawStep = span / count;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) || mag * 10;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = start; v <= end + step * 0.001; v += step) ticks.push(Math.round(v));
  return { ticks, min: start, max: end };
}

/**
 * Cumulative net benefit against a zero baseline across the analysis horizon.
 * One series, so no legend — the title names what is plotted. Fill diverges
 * around zero: investment below the line, return above it.
 */
export default function PaybackChart({ cashflow, paybackMonths }) {
  const [wrapRef, width] = useElementWidth(680);
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const clipId = useId().replace(/:/g, '');

  const innerW = Math.max(120, width - M.left - M.right);
  const innerH = PLOT_HEIGHT;

  const { ticks, min: yMin, max: yMax } = useMemo(() => {
    const values = cashflow.map((d) => d.cumulative);
    return niceTicks(Math.min(0, ...values), Math.max(0, ...values), 5);
  }, [cashflow]);

  const x = (month) => ((month - 1) / Math.max(cashflow.length - 1, 1)) * innerW;
  const y = (value) => innerH - ((value - yMin) / (yMax - yMin || 1)) * innerH;
  const zeroY = y(0);

  const linePath = cashflow
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d.month).toFixed(2)},${y(d.cumulative).toFixed(2)}`)
    .join(' ');

  const areaPath = `${linePath} L${x(cashflow[cashflow.length - 1].month).toFixed(2)},${zeroY.toFixed(
    2,
  )} L${x(cashflow[0].month).toFixed(2)},${zeroY.toFixed(2)} Z`;

  const breakeven = cashflow.find((d) => d.month === paybackMonths);
  const last = cashflow[cashflow.length - 1];
  const xTicks = cashflow.filter((d) => d.month % 6 === 0);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left - M.left;
    const ratio = Math.min(1, Math.max(0, px / innerW));
    const index = Math.round(ratio * (cashflow.length - 1));
    setHover(cashflow[index] || null);
  };

  const handleKey = (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const current = hover ? cashflow.indexOf(hover) : (paybackMonths || 1) - 1;
    const next = Math.min(
      cashflow.length - 1,
      Math.max(0, current + (event.key === 'ArrowRight' ? 1 : -1)),
    );
    setHover(cashflow[next]);
  };

  return (
    <figure className={`${styles.figure} vizRoot`}>
      <figcaption className={styles.caption}>
        <div>
          <h3 className={styles.chartTitle}>Cumulative net benefit</h3>
          <p className={styles.chartSub}>
            Investment first, return after. The case crosses zero in month {paybackMonths}.
          </p>
        </div>
        <button type="button" className={styles.tableToggle} onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'Hide data' : 'View data'}
        </button>
      </figcaption>

      <div className={styles.plotWrap} ref={wrapRef}>
        <svg
          width={width}
          height={innerH + M.top + M.bottom}
          role="img"
          tabIndex={0}
          aria-label={`Cumulative net benefit over ${cashflow.length} months. Breakeven in month ${paybackMonths}. Ends at ${formatAxisMoney(last.cumulative)}.`}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          onKeyDown={handleKey}
          className={styles.svg}
        >
          <defs>
            <clipPath id={`${clipId}-above`}>
              <rect x="0" y="0" width={innerW} height={Math.max(0, zeroY)} />
            </clipPath>
            <clipPath id={`${clipId}-below`}>
              <rect x="0" y={zeroY} width={innerW} height={Math.max(0, innerH - zeroY)} />
            </clipPath>
          </defs>

          <g transform={`translate(${M.left},${M.top})`}>
            {/* gridlines — solid hairlines, one step off surface */}
            {ticks.map((t) => (
              <line
                key={t}
                x1={0}
                x2={innerW}
                y1={y(t)}
                y2={y(t)}
                className={styles.grid}
                shapeRendering="crispEdges"
              />
            ))}

            {/* y-axis labels */}
            {ticks.map((t) => (
              <text key={`l${t}`} x={-10} y={y(t)} dy="0.32em" className={styles.axisLabelRight}>
                {formatAxisMoney(t)}
              </text>
            ))}

            {/* diverging area wash */}
            <path d={areaPath} className={styles.areaAbove} clipPath={`url(#${clipId}-above)`} />
            <path d={areaPath} className={styles.areaBelow} clipPath={`url(#${clipId}-below)`} />

            {/* zero baseline sits above the wash, below the line */}
            <line
              x1={0}
              x2={innerW}
              y1={zeroY}
              y2={zeroY}
              className={styles.baseline}
              shapeRendering="crispEdges"
            />

            <path d={linePath} className={styles.line} />

            {/* x-axis */}
            {xTicks.map((d) => (
              <text key={d.month} x={x(d.month)} y={innerH + 18} className={styles.axisLabel}>
                M{d.month}
              </text>
            ))}

            {/* breakeven marker — 8px with a 2px surface ring */}
            {breakeven ? (
              <>
                <line
                  x1={x(breakeven.month)}
                  x2={x(breakeven.month)}
                  y1={y(breakeven.cumulative)}
                  y2={zeroY}
                  className={styles.markerStem}
                />
                <circle
                  cx={x(breakeven.month)}
                  cy={y(breakeven.cumulative)}
                  r={4.5}
                  className={styles.marker}
                />
                <text
                  x={x(breakeven.month) + 10}
                  y={y(breakeven.cumulative) - 10}
                  className={styles.markerLabel}
                >
                  Breakeven · month {breakeven.month}
                </text>
              </>
            ) : null}

            {/* endpoint direct label */}
            <text x={innerW} y={y(last.cumulative) - 10} className={styles.endLabel}>
              {formatAxisMoney(last.cumulative)}
            </text>

            {/* hover crosshair */}
            {hover ? (
              <>
                <line
                  x1={x(hover.month)}
                  x2={x(hover.month)}
                  y1={0}
                  y2={innerH}
                  className={styles.crosshair}
                  shapeRendering="crispEdges"
                />
                <circle
                  cx={x(hover.month)}
                  cy={y(hover.cumulative)}
                  r={4.5}
                  className={styles.hoverDot}
                />
              </>
            ) : null}
          </g>
        </svg>

        {hover ? (
          <div
            className={styles.tooltip}
            style={{
              left: Math.min(width - 168, Math.max(0, M.left + x(hover.month) - 84)),
              top: M.top + y(hover.cumulative) - 74,
            }}
            role="status"
          >
            <span className={styles.tooltipTitle}>Month {hover.month}</span>
            <span className={styles.tooltipRow}>
              Cumulative <strong>{formatAxisMoney(hover.cumulative)}</strong>
            </span>
            <span className={styles.tooltipRow}>
              Net this month <strong>{formatAxisMoney(hover.net)}</strong>
            </span>
          </div>
        ) : null}
      </div>

      {showTable ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={styles.tableCaption}>
              Cumulative net benefit by month (every third month shown)
            </caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Benefit</th>
                <th scope="col">Cost</th>
                <th scope="col">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {cashflow
                .filter((d) => d.month % 3 === 0 || d.month === paybackMonths)
                .map((d) => (
                  <tr key={d.month} data-breakeven={d.month === paybackMonths ? 'true' : undefined}>
                    <th scope="row">{d.month}</th>
                    <td>{formatAxisMoney(d.benefit)}</td>
                    <td>{formatAxisMoney(d.cost)}</td>
                    <td>{formatAxisMoney(d.cumulative)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </figure>
  );
}
