import { WeightEntry } from "@/lib/weight-storage";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  entries: WeightEntry[];
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
    </div>
  );
};

export default function WeightChart({ entries }: Props) {
  if (entries.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Ajoutez au moins 2 entrées pour voir la courbe
        </p>
      </div>
    );
  }

  const data = entries.map((e) => ({
    date: e.date,
    weight: e.weight,
    label: format(parseISO(e.date), "d MMM", { locale: fr }),
  }));

  const weights = entries.map((e) => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const padding = Math.max((maxW - minW) * 0.2, 1);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(168, 65%, 38%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(168, 65%, 38%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(200, 10%, 50%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[Math.floor(minW - padding), Math.ceil(maxW + padding)]}
          tick={{ fontSize: 11, fill: "hsl(200, 10%, 50%)" }}
          axisLine={false}
          tickLine={false}
          unit=" kg"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="hsl(168, 55%, 48%)"
          strokeWidth={2.5}
          fill="url(#weightGradient)"
          dot={{ r: 3, fill: "hsl(168, 65%, 38%)", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "hsl(168, 65%, 38%)", strokeWidth: 2, stroke: "white" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
