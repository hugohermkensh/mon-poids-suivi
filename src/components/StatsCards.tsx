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
      <div className="grid grid-cols-2 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border bg-card/60 p-4 animate-pulse">
            <div className="h-2.5 w-14 rounded-full bg-muted mb-3" />
            <div className="h-5 w-10 rounded-full bg-muted" />
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
      gradient: true,
      sub: stats.diff !== 0 ? `${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)}` : null,
      subPositive: stats.diff <= 0,
      subIcon: stats.diff <= 0 ? TrendingDown : TrendingUp,
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
          sub: `${goalDiff > 0 ? "+" : ""}${goalDiff.toFixed(1)}`,
          subPositive: goalDiff <= 0,
          subIcon: goalDiff <= 0 ? TrendingDown : TrendingUp,
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
    <div className="grid grid-cols-2 gap-2.5">
      {cards.map((c: any, i: number) => (
        <div
          key={c.label}
          className={`animate-fade-in rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-md group ${
            c.gradient
              ? "bg-gradient-to-br from-primary/8 via-card to-accent/20 border-primary/15 shadow-sm"
              : "bg-card/80 backdrop-blur-sm"
          }`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {c.label}
            </span>
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
              c.gradient ? "bg-primary/15" : "bg-muted/60"
            }`}>
              <c.icon className={`h-3 w-3 ${c.gradient ? "text-primary" : "text-muted-foreground"}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-foreground tracking-tight leading-none">
              {c.value}
            </span>
            {c.unit && (
              <span className="text-[11px] font-semibold text-muted-foreground">{c.unit}</span>
            )}
          </div>
          {c.sub && (
            <div
              className={`flex items-center gap-1 mt-1.5 text-[11px] font-bold ${
                c.subClassName || (c.subPositive ? "text-stat-up" : "text-stat-down")
              }`}
            >
              {c.subIcon && <c.subIcon className="h-3 w-3" />}
              <span>{c.sub}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
