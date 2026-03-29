import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Target } from "lucide-react";
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
    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shrink-0">
          <Target className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">
            Prédiction objectif
          </p>
          <p className="text-sm font-bold text-foreground">
            {format(parseISO(targetDate), "d MMMM yyyy", { locale: fr })}
            <span className="text-xs font-medium text-muted-foreground ml-2">
              dans {daysLeft} jours
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
