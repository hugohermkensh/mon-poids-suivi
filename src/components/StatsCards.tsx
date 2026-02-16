import { TrendingDown, TrendingUp, Scale, Target, Activity } from "lucide-react";

interface Stats {
  current: number;
  min: number;
  max: number;
  avg: number;
  diff: number;
}

interface Props {
  stats: Stats | null;
}

export default function StatsCards({ stats }: Props) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-4 opacity-50"
          >
            <div className="h-3 w-16 rounded bg-muted mb-2" />
            <div className="h-6 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Actuel",
      value: `${stats.current.toFixed(1)} kg`,
      icon: Scale,
      accent: stats.diff <= 0,
      sub: stats.diff !== 0 ? `${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)} kg` : null,
      subIcon: stats.diff <= 0 ? TrendingDown : TrendingUp,
    },
    {
      label: "Moyenne",
      value: `${stats.avg.toFixed(1)} kg`,
      icon: Activity,
    },
    {
      label: "Min",
      value: `${stats.min.toFixed(1)} kg`,
      icon: TrendingDown,
    },
    {
      label: "Max",
      value: `${stats.max.toFixed(1)} kg`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
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
            <div className={`flex items-center gap-1 mt-0.5 text-xs font-medium ${c.accent ? "text-stat-up" : "text-stat-down"}`}>
              <c.subIcon className="h-3 w-3" />
              {c.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
