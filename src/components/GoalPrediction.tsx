import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { predictGoalDate } from "@/lib/weight-storage";
import type { WeightEntry } from "@/lib/weight-storage";

interface Props {
  entries: WeightEntry[];
  goalWeight: number;
}

export default function GoalPrediction({ entries, goalWeight }: Props) {
  const targetDate = predictGoalDate(entries, goalWeight);
  if (!targetDate) return null;

  const daysLeft = Math.ceil(
    (new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="panel border-l-2 border-accent p-4">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-mono font-bold">
          ▸ Prédiction · Cible {goalWeight} KG
        </span>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
          ETA
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-base font-bold text-foreground font-mono uppercase">
          {format(parseISO(targetDate), "dd MMM yyyy", { locale: fr })}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-accent tabular-nums font-mono">
            {daysLeft}
          </span>
          <span className="text-xs text-accent font-bold uppercase tracking-widest">JOURS</span>
        </div>
      </div>
    </div>
  );
}
