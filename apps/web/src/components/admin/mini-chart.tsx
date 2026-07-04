"use client";

export interface MiniChartPoint {
  date: string;
  count: number;
}

export interface MiniChartSeries {
  label: string;
  color: string;
  data: MiniChartPoint[];
}

interface MiniChartProps {
  series: MiniChartSeries[];
  height?: number;
}

/**
 * Minimal dependency-free SVG line chart for admin analytics. All series share a single
 * count axis (same unit), so one shared y-scale is correct here — never a dual axis.
 * Fixed categorical color order is passed in by the caller (royal / cyan / gold) so identity
 * never gets reassigned when a series is toggled elsewhere.
 */
export function MiniChart({ series, height = 180 }: MiniChartProps) {
  const width = 640;
  const paddingX = 8;
  const paddingY = 12;
  const maxCount = Math.max(1, ...series.flatMap((s) => s.data.map((p) => p.count)));
  const pointCount = Math.max(1, ...series.map((s) => s.data.length));

  const toXY = (index: number, count: number) => {
    const x =
      pointCount <= 1
        ? width / 2
        : paddingX + (index / (pointCount - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (count / maxCount) * (height - paddingY * 2);
    return { x, y };
  };

  const firstDate = series[0]?.data[0]?.date;
  const lastDate = series[0]?.data.at(-1)?.date;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Évolution dans le temps">
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="var(--border-subtle)"
          strokeWidth={1}
        />
        {series.map((s) => {
          const points = s.data.map((p, i) => toXY(i, p.count));
          const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
          return (
            <g key={s.label}>
              <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={s.color}>
                  <title>
                    {s.data[i]?.date} — {s.data[i]?.count}
                  </title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
              {s.label}
            </span>
          ))}
        </div>
        {firstDate && lastDate && (
          <span>
            {firstDate} → {lastDate}
          </span>
        )}
      </div>
    </div>
  );
}
