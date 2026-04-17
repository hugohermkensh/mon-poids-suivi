import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Target, Clock } from "lucide-react";
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
    <div className="glow-card rounded-3xl p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30 shrink-0">
          <Target className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
            🔮 Prédiction objectif
          </p>
          <p className="text-base font-black text-foreground capitalize truncate">
            {format(parseISO(targetDate), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary/10 shrink-0">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-black text-primary">{daysLeft}j</span>
        </div>
      </div>
    </div>
  );
}
