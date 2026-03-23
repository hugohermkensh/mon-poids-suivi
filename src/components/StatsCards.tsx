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
          <div key={i} className="rounded-2xl border bg-card p-4 opacity-40">
            <div className="h-3 w-16 rounded-full bg-muted mb-3" />
            <div className="h-6 w-12 rounded-full bg-muted" />
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
      value: `${stats.current.toFixed(1)}`,
      unit: "kg",
      icon: Scale,
      accent: stats.diff <= 0,
      sub: stats.diff !== 0 ? `${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)} kg` : null,
      subIcon: stats.diff <= 0 ? TrendingDown : TrendingUp,
      highlight: true,
    },
    ...(bmi && bmiCategory
      ? [
          {
            label: "IMC",
            value: bmi.toFixed(1),
            icon: Heart,
            sub: bmiCategory.label,
            subClassName: bmiCategory.color,
          },
        ]
      : [
          {
            label: "Moyenne",
            value: `${stats.avg.toFixed(1)}`,
            unit: "kg",
            icon: Activity,
          },
        ]),
    ...(goalWeight && goalDiff !== null
      ? [
          {
            label: "Objectif",
            value: `${goalWeight.toFixed(1)}`,
            unit: "kg",
            icon: Target,
            accent: goalDiff <= 0,
            sub: `${goalDiff > 0 ? "+" : ""}${goalDiff.toFixed(1)} kg`,
            subIcon: goalDiff <= 0 ? TrendingDown : TrendingUp,
          },
        ]
      : [
          {
            label: "Min",
            value: `${stats.min.toFixed(1)}`,
            unit: "kg",
            icon: TrendingDown,
          },
        ]),
    {
      label: bmi ? "Moyenne" : "Max",
      value: bmi
        ? `${stats.avg.toFixed(1)}`
        : `${stats.max.toFixed(1)}`,
      unit: "kg",
      icon: bmi ? Activity : TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c: any, i: number) => (
        <div
          key={c.label}
          className={`animate-fade-in rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
            c.highlight
              ? "bg-gradient-to-br from-primary/5 to-accent/30 border-primary/20"
              : "bg-card"
          }`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
              <c.icon className="h-3 w-3 text-primary" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wide">{c.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-extrabold text-foreground tracking-tight">{c.value}</p>
            {c.unit && <span className="text-xs font-medium text-muted-foreground">{c.unit}</span>}
          </div>
          {c.sub && (
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
                c.subClassName || (c.accent ? "text-stat-up" : "text-stat-down")
              }`}
            >
              {c.subIcon && <c.subIcon className="h-3 w-3" />}
              {c.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
