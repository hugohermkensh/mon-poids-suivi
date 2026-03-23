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
  { key: "7d", label: "7j" },
  { key: "30d", label: "30j" },
  { key: "3m", label: "3m" },
  { key: "1y", label: "1a" },
  { key: "all", label: "Tout" },
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
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm px-3 py-2.5 shadow-lg">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {format(parseISO(data.date), "EEEE d MMM", { locale: fr })}
      </p>
      <p className="text-base font-extrabold text-foreground tracking-tight">
        {data.weight} <span className="text-xs font-semibold text-muted-foreground">kg</span>
      </p>
      {data.movingAvg && (
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Moy. 7j : {data.movingAvg} kg
        </p>
      )}
    </div>
  );
};

export default function WeightChart({ entries, goalWeight }: Props) {
  const [filter, setFilter] = useState<TimeFilter>("all");

  if (entries.length < 2) {
    return (
      <div className="flex flex-col h-44 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
        <span className="text-2xl mb-2">📈</span>
        <p className="text-xs font-medium text-muted-foreground">
          2 pesées minimum pour le graphique
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
    label: format(parseISO(e.date), "d MMM", { locale: fr }),
  }));

  const allWeights = displayEntries.map((e) => e.weight);
  if (goalWeight) allWeights.push(goalWeight);
  const minW = Math.min(...allWeights);
  const maxW = Math.max(...allWeights);
  const padding = Math.max((maxW - minW) * 0.2, 1);

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-1 mb-4 p-0.5 rounded-xl bg-muted/40 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200 ${
              filter === f.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} strokeOpacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[Math.floor(minW - padding), Math.ceil(maxW + padding)]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            unit=" kg"
          />
          <Tooltip content={<CustomTooltip />} />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="hsl(var(--primary))"
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={{
                value: `🎯 ${goalWeight} kg`,
                position: "right",
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--chart-line))"
            strokeWidth={2.5}
            fill="url(#weightGradient)"
            dot={{ r: 3, fill: "hsl(var(--chart-primary))", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "hsl(var(--chart-primary))", strokeWidth: 2.5, stroke: "hsl(var(--card))" }}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            strokeOpacity={0.4}
            dot={false}
            name="Moyenne mobile"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
