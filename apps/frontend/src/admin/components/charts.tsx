/**
 * Tiny dependency-free SVG charts for the admin analytics page.
 * Brand palette; each chart is self-contained and responsive (viewBox scaled).
 */

export interface Datum {
  label: string;
  value: number;
  color?: string;
}

export const CHART_COLORS = [
  '#0A2647', // navy
  '#C8102E', // red
  '#C9A227', // gold
  '#2C74B3', // blue
  '#2E7D32', // green
  '#7B4BC9', // violet
  '#E07A00', // orange
  '#5C6B7A', // slate
];

/* --------------------------------- Bars --------------------------------- */
export function BarList({ data, unit }: { data: Datum[]; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <Empty />;
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-ala-grey-500" title={d.label}>{d.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-ala-grey-100">
            <div
              className="flex h-full items-center justify-end rounded pr-2 text-[0.65rem] font-semibold text-white"
              style={{ width: `${Math.max(6, (d.value / max) * 100)}%`, background: d.color ?? CHART_COLORS[i % CHART_COLORS.length] }}
            >
              {d.value}
            </div>
          </div>
        </div>
      ))}
      {unit && <p className="pt-1 text-right text-[0.65rem] text-ala-grey-400">{unit}</p>}
    </div>
  );
}

/* -------------------------------- Donut --------------------------------- */
export function Donut({ data, size = 160 }: { data: Datum[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <Empty />;
  const r = size / 2;
  const stroke = size * 0.18;
  const radius = r - stroke / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const seg = (
            <circle
              key={d.label}
              cx={r}
              cy={r}
              r={radius}
              fill="none"
              stroke={d.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return seg;
        })}
        <text x={r} y={r} textAnchor="middle" dominantBaseline="central" className="rotate-90" style={{ transformOrigin: 'center' }} fontSize={size * 0.2} fontWeight="700" fill="#0A2647">
          {total}
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: d.color ?? CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="capitalize text-ala-grey-600">{d.label.replace(/_/g, ' ')}</span>
            <span className="font-semibold text-ala-navy">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------- Area line ------------------------------ */
export function AreaChart({ data, height = 180 }: { data: Datum[]; height?: number }) {
  const width = 640;
  const pad = { t: 10, r: 10, b: 22, l: 10 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const n = data.length;
  if (n === 0) return <Empty />;

  const x = (i: number) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');
  const area = `${line} L ${x(n - 1)} ${pad.t + ih} L ${x(0)} ${pad.t + ih} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C8102E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="#C8102E" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={3} fill="#C8102E" />
          <text x={x(i)} y={height - 6} textAnchor="middle" fontSize="10" fill="#9aa5b1">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

function Empty() {
  return <p className="py-8 text-center text-sm text-ala-grey-400">No data yet.</p>;
}

/** Convert a Record<string,number> into a sorted Datum[]. */
export function toData(rec: Record<string, number> | undefined): Datum[] {
  if (!rec) return [];
  return Object.entries(rec)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
