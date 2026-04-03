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
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
            <div className="h-2 w-14 rounded-full bg-muted mb-4" />
            <div className="h-6 w-12 rounded-lg bg-muted" />
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
      label: "Poids actuel",
      value: stats.current.toFixed(1),
      unit: "kg",
      icon: Scale,
      featured: true,
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
          sub: `${goalDiff > 0 ? "+" : ""}${goalDiff.toFixed(1)} kg restant`,
          subPositive: goalDiff <= 0,
        }]
      : [{
          label: "Minimum",
          value: stats.min.toFixed(1),
          unit: "kg",
          icon: TrendingDown,
        }]),
    {
      label: bmi ? "Moyenne" : "Maximum",
      value: bmi ? stats.avg.toFixed(1) : stats.max.toFixed(1),
      unit: "kg",
      icon: bmi ? Activity : TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c: any) => (
        <div
          key={c.label}
          className={`glass-card rounded-2xl p-4 transition-all hover:shadow-md ${
            c.featured
              ? "bg-gradient-to-br from-primary/8 to-primary/3 border-primary/15"
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {c.label}
            </span>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              c.featured ? "bg-primary/12" : "bg-muted/60"
            }`}>
              <c.icon className={`h-3.5 w-3.5 ${c.featured ? "text-primary" : "text-muted-foreground"}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {c.value}
            </span>
            {c.unit && (
              <span className="text-xs font-semibold text-muted-foreground">{c.unit}</span>
            )}
          </div>
          {c.sub && (
            <p className={`text-[11px] font-semibold mt-1.5 ${
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
