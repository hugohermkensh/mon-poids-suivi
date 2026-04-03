import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Target, Calendar } from "lucide-react";
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
    <div className="glass-card rounded-2xl border-primary/15 bg-gradient-to-r from-primary/6 to-transparent p-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 shrink-0">
          <Target className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary mb-1">
            Prédiction objectif
          </p>
          <p className="text-sm font-black text-foreground">
            {format(parseISO(targetDate), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10">
          <Calendar className="h-3 w-3 text-primary" />
          <span className="text-xs font-bold text-primary">{daysLeft}j</span>
        </div>
      </div>
    </div>
  );
}
