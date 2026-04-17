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
          <div key={i} className="glass-card rounded-3xl p-5 animate-pulse">
            <div className="h-2 w-14 rounded-full bg-muted mb-5" />
            <div className="h-7 w-14 rounded-lg bg-muted" />
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
      featured: true,
      emoji: "⚡",
      sub: stats.diff !== 0 ? `${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)} kg` : null,
      subPositive: stats.diff <= 0,
    },
    ...(bmi && bmiCategory
      ? [{
          label: "IMC",
          value: bmi.toFixed(1),
          icon: Heart,
          emoji: "❤️",
          sub: bmiCategory.label,
          subClassName: bmiCategory.color,
        }]
      : [{
          label: "Moyenne",
          value: stats.avg.toFixed(1),
          unit: "kg",
          icon: Activity,
          emoji: "📊",
        }]),
    ...(goalWeight && goalDiff !== null
      ? [{
          label: "Objectif",
          value: goalWeight.toFixed(1),
          unit: "kg",
          icon: Target,
          emoji: "🎯",
          sub: `${goalDiff > 0 ? "+" : ""}${goalDiff.toFixed(1)} kg restant`,
          subPositive: goalDiff <= 0,
        }]
      : [{
          label: "Minimum",
          value: stats.min.toFixed(1),
          unit: "kg",
          icon: TrendingDown,
          emoji: "📉",
        }]),
    {
      label: bmi ? "Moyenne" : "Maximum",
      value: bmi ? stats.avg.toFixed(1) : stats.max.toFixed(1),
      unit: "kg",
      icon: bmi ? Activity : TrendingUp,
      emoji: bmi ? "📊" : "📈",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c: any) => (
        <div
          key={c.label}
          className={`group rounded-3xl p-5 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 ${
            c.featured ? "glow-card" : "glass-card"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {c.label}
            </span>
            <span className="text-base transition-transform group-hover:scale-110">{c.emoji}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black tracking-tight ${c.featured ? "text-gradient" : "text-foreground"}`}>
              {c.value}
            </span>
            {c.unit && (
              <span className="text-sm font-bold text-muted-foreground">{c.unit}</span>
            )}
          </div>
          {c.sub && (
            <p className={`text-xs font-bold mt-2 ${
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
