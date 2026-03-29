import { TrendingDown, TrendingUp, Scale, Activity, Target, Heart } from "lucide-react";
import { calculateBMI, getBMICategory } from "@/lib/weight-storage";

interface Stats {
  current: number;
  min: number;
  max: number;
  avg: number;
  diff: number;
}

interface Props {
  stats: Stats | null;
  goalWeight?: number;
  height?: number;
}

export default function StatsCards({ stats, goalWeight, height }: Props) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border bg-card p-3.5 animate-pulse">
            <div className="h-2 w-12 rounded bg-muted mb-3" />
            <div className="h-5 w-10 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const bmi = height ? calculateBMI(stats.current, height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const goalDiff = goalWeight ? stats.current - goalWeight : null;

  const cards = [
    {
      label: "Actuel",
      value: stats.current.toFixed(1),
      unit: "kg",
      icon: Scale,
      highlight: true,
      sub: stats.diff !== 0 ? `${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)} kg` : null,
      subPositive: stats.diff <= 0,
    },
    ...(bmi && bmiCategory
      ? [{
          label: "IMC",
          value: bmi.toFixed(1),
          icon: Heart,
          sub: bmiCategory.label,
          subClassName: bmiCategory.color,
        }]
      : [{
          label: "Moyenne",
          value: stats.avg.toFixed(1),
          unit: "kg",
          icon: Activity,
        }]),
    ...(goalWeight && goalDiff !== null
      ? [{
          label: "Objectif",
          value: goalWeight.toFixed(1),
          unit: "kg",
          icon: Target,
          sub: `${goalDiff > 0 ? "+" : ""}${goalDiff.toFixed(1)} kg`,
          subPositive: goalDiff <= 0,
        }]
      : [{
          label: "Min",
          value: stats.min.toFixed(1),
          unit: "kg",
          icon: TrendingDown,
        }]),
    {
      label: bmi ? "Moyenne" : "Max",
      value: bmi ? stats.avg.toFixed(1) : stats.max.toFixed(1),
      unit: "kg",
      icon: bmi ? Activity : TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((c: any) => (
        <div
          key={c.label}
          className={`rounded-2xl border p-3.5 transition-colors ${
            c.highlight ? "bg-primary/5 border-primary/15" : "bg-card"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {c.label}
            </span>
            <c.icon className={`h-3.5 w-3.5 ${c.highlight ? "text-primary" : "text-muted-foreground/50"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-foreground tracking-tight">
              {c.value}
            </span>
            {c.unit && (
              <span className="text-[11px] font-medium text-muted-foreground">{c.unit}</span>
            )}
          </div>
          {c.sub && (
            <p className={`text-[11px] font-semibold mt-1 ${
              c.subClassName || (c.subPositive ? "text-stat-up" : "text-stat-down")
            }`}>
              {c.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
