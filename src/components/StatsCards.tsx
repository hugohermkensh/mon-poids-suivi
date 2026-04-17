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
      <div className="panel-accent p-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono mb-2">
          Aucune donnée
        </div>
        <div className="text-3xl font-extrabold font-mono text-muted-foreground/40">
          —.— <span className="text-base text-primary">KG</span>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-3 font-mono">
          Ajoutez votre première pesée ci-dessous.
        </p>
      </div>
    );
  }

  const bmi = height ? calculateBMI(stats.current, height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const goalDiff = goalWeight ? stats.current - goalWeight : null;
  const status = stats.diff <= 0 ? "Optimal" : "Hausse";

  return (
    <div className="panel-accent p-5">
      {/* corner decoration */}
      <div className="absolute -right-12 -top-12 size-32 bg-primary/5 rotate-45 pointer-events-none border border-primary/10" />

      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
          Poids Actuel
        </div>
        <div className={`text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 border ${
          stats.diff <= 0
            ? "text-primary bg-primary/10 border-primary/20"
            : "text-destructive bg-destructive/10 border-destructive/30"
        }`}>
          {status}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-6 relative z-10">
        <span className="text-7xl font-extrabold tracking-tighter text-foreground tabular-nums font-mono">
          {stats.current.toFixed(1)}
        </span>
        <span className="text-xl text-primary font-bold tracking-widest">KG</span>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4 relative z-10">
        <Cell
          label={`Delta`}
          value={`${stats.diff > 0 ? "+" : ""}${stats.diff.toFixed(1)} KG`}
          tone={stats.diff <= 0 ? "primary" : "destructive"}
        />
        <Cell
          label="Moyenne"
          value={`${stats.avg.toFixed(1)} KG`}
        />
        {goalWeight && goalDiff !== null ? (
          <Cell
            label="Cible"
            value={`${goalWeight.toFixed(1)} KG`}
            sub={`${goalDiff > 0 ? "+" : ""}${goalDiff.toFixed(1)} restant`}
          />
        ) : (
          <Cell
            label="Min"
            value={`${stats.min.toFixed(1)} KG`}
          />
        )}
        {bmi && bmiCategory ? (
          <Cell
            label="IMC"
            value={bmi.toFixed(1)}
            sub={bmiCategory.label}
            tone={bmiCategory.label === "Normal" ? "primary" : "warning"}
          />
        ) : (
          <Cell
            label="Max"
            value={`${stats.max.toFixed(1)} KG`}
          />
        )}
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "primary" | "destructive" | "warning";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "destructive"
        ? "text-destructive"
        : tone === "warning"
          ? "text-[hsl(var(--stat-warning))]"
          : "text-foreground";
  return (
    <div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1 font-mono">
        {label}
      </div>
      <div className={`text-lg font-bold tabular-nums font-mono ${toneClass}`}>{value}</div>
      {sub && (
        <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5 font-mono">
          {sub}
        </div>
      )}
    </div>
  );
}
