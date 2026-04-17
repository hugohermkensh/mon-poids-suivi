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
  { key: "1y", label: "1an" },
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
    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-muted-foreground mb-1.5 capitalize">
        {format(parseISO(data.date), "EEEE d MMM", { locale: fr })}
      </p>
      <p className="text-lg font-black text-foreground">
        {data.weight} <span className="text-xs font-semibold text-muted-foreground">kg</span>
      </p>
      {data.movingAvg && (
        <p className="text-muted-foreground mt-1.5 text-[11px]">
          Moy. mobile : {data.movingAvg} kg
        </p>
      )}
    </div>
  );
};

export default function WeightChart({ entries, goalWeight }: Props) {
  const [filter, setFilter] = useState<TimeFilter>("all");

  if (entries.length < 2) {
    return (
      <div className="flex flex-col h-48 items-center justify-center text-center">
        <span className="text-3xl mb-3 animate-float">📈</span>
        <p className="text-xs font-bold text-muted-foreground">
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
      {/* Filter pills */}
      <div className="flex gap-1.5 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filter === f.key
                ? "gradient-primary text-primary-foreground shadow-md shadow-primary/30"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-gradient-start))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--chart-gradient-end))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--chart-gradient-start))" />
              <stop offset="100%" stopColor="hsl(var(--chart-gradient-end))" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} strokeOpacity={0.4} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[Math.floor(minW - padding), Math.ceil(maxW + padding)]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            unit=" kg"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.4 }} />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="hsl(var(--primary))"
              strokeDasharray="8 4"
              strokeOpacity={0.4}
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
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            fill="url(#weightGrad)"
            dot={{ r: 3.5, fill: "hsl(var(--chart-primary))", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "hsl(var(--chart-primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            strokeOpacity={0.3}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
