import { WeightEntry, getMovingAverage } from "@/lib/weight-storage";
import {
  Area,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { format, parseISO, subDays, subMonths, subYears } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

interface Props {
  entries: WeightEntry[];
  goalWeight?: number;
}

type TimeFilter = "7d" | "30d" | "3m" | "1y" | "all";

const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "7d", label: "7J" },
  { key: "30d", label: "30J" },
  { key: "3m", label: "3M" },
  { key: "1y", label: "1A" },
  { key: "all", label: "ALL" },
];

function getFilterDate(filter: TimeFilter): Date | null {
  const now = new Date();
  switch (filter) {
    case "7d": return subDays(now, 7);
    case "30d": return subDays(now, 30);
    case "3m": return subMonths(now, 3);
    case "1y": return subYears(now, 1);
    case "all": return null;
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="border border-primary bg-card px-3 py-2 text-xs font-mono shadow-[0_0_20px_rgba(204,255,0,0.2)]">
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
        {format(parseISO(data.date), "dd MMM yyyy", { locale: fr })}
      </p>
      <p className="text-base font-bold text-foreground tabular-nums">
        {data.weight} <span className="text-[10px] text-primary">KG</span>
      </p>
      {data.movingAvg && (
        <p className="text-muted-foreground mt-1 text-[10px] tabular-nums">
          AVG: {data.movingAvg}
        </p>
      )}
    </div>
  );
};

export default function WeightChart({ entries, goalWeight }: Props) {
  const [filter, setFilter] = useState<TimeFilter>("all");

  if (entries.length < 2) {
    return (
      <div className="flex flex-col h-40 items-center justify-center text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">
          ╴ INSUFFICIENT DATA ╴
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/60">
          MIN 2 ENTRIES REQUIRED
        </p>
      </div>
    );
  }

  const filterDate = getFilterDate(filter);
  const filtered = filterDate
    ? entries.filter((e) => new Date(e.date) >= filterDate)
    : entries;

  const displayEntries = filtered.length >= 2 ? filtered : entries;
  const movingAvg = getMovingAverage(displayEntries);

  const data = displayEntries.map((e, i) => ({
    date: e.date,
    weight: e.weight,
    movingAvg: movingAvg[i]?.avg,
    label: format(parseISO(e.date), "d/M", { locale: fr }),
  }));

  const allWeights = displayEntries.map((e) => e.weight);
  if (goalWeight) allWeights.push(goalWeight);
  const minW = Math.min(...allWeights);
  const maxW = Math.max(...allWeights);
  const padding = Math.max((maxW - minW) * 0.2, 1);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-1 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest font-mono uppercase border transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--chart-primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--chart-grid))" strokeOpacity={0.6} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            domain={[Math.floor(minW - padding), Math.ceil(maxW + padding)]}
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "2 2" }} />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="hsl(var(--accent))"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: `▸ ${goalWeight}`,
                position: "right",
                fontSize: 9,
                fill: "hsl(var(--accent))",
                fontFamily: "JetBrains Mono",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--chart-line))"
            strokeWidth={2}
            fill="url(#weightGrad)"
            dot={{ r: 2, fill: "hsl(var(--chart-primary))", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "hsl(var(--chart-primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="hsl(var(--accent))"
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeOpacity={0.4}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
