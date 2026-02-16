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
          <div key={i} className="rounded-lg border bg-card p-4 opacity-50">
            <div className="h-3 w-16 rounded bg-muted mb-2" />
            <div className="h-6 w-12 rounded bg-muted" />
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
      value: `${stats.current.toFixed(1)} kg`,
      icon: Scale,
      accent: stats.diff <= 0,
      sub: stats.diff !== 0 ? `${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)} kg` : null,
      subIcon: stats.diff <= 0 ? TrendingDown : TrendingUp,
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
            value: `${stats.avg.toFixed(1)} kg`,
            icon: Activity,
          },
        ]),
    ...(goalWeight && goalDiff !== null
      ? [
          {
            label: "Objectif",
            value: `${goalWeight.toFixed(1)} kg`,
            icon: Target,
            accent: goalDiff <= 0,
            sub: `${goalDiff > 0 ? "+" : ""}${goalDiff.toFixed(1)} kg`,
            subIcon: goalDiff <= 0 ? TrendingDown : TrendingUp,
          },
        ]
      : [
          {
            label: "Min",
            value: `${stats.min.toFixed(1)} kg`,
            icon: TrendingDown,
          },
        ]),
    {
      label: bmi ? "Moyenne" : "Max",
      value: bmi
        ? `${stats.avg.toFixed(1)} kg`
        : `${stats.max.toFixed(1)} kg`,
      icon: bmi ? Activity : TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c: any) => (
        <div
          key={c.label}
          className="animate-fade-in rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <c.icon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{c.label}</span>
          </div>
          <p className="text-lg font-bold text-foreground">{c.value}</p>
          {c.sub && (
            <div
              className={`flex items-center gap-1 mt-0.5 text-xs font-medium ${
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
