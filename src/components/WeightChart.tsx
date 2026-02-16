import { WeightEntry, getMovingAverage } from "@/lib/weight-storage";
import {
  Area,
  AreaChart,
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
import { Button } from "@/components/ui/button";

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
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">
        {format(parseISO(data.date), "d MMM yyyy", { locale: fr })}
      </p>
      <p className="text-sm font-bold text-foreground">{data.weight} kg</p>
      {data.movingAvg && (
        <p className="text-xs text-muted-foreground">
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
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Ajoutez au moins 2 entrées pour voir la courbe
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
      <div className="flex gap-1 mb-3">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[Math.floor(minW - padding), Math.ceil(maxW + padding)]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
              strokeOpacity={0.6}
              label={{
                value: `Objectif: ${goalWeight} kg`,
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
            activeDot={{ r: 5, fill: "hsl(var(--chart-primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            strokeOpacity={0.5}
            dot={false}
            name="Moyenne mobile"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
