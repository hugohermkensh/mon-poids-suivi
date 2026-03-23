import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Target, Sparkles } from "lucide-react";
import { predictGoalDate } from "@/lib/weight-storage";
import type { WeightEntry } from "@/lib/weight-storage";

interface Props {
  entries: WeightEntry[];
  goalWeight: number;
}

export default function GoalPrediction({ entries, goalWeight }: Props) {
  const targetDate = predictGoalDate(entries, goalWeight);

  if (!targetDate) return null;

  return (
    <div className="animate-fade-in flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20 px-4 py-3.5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
        <Target className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Prédiction
          </p>
        </div>
        <p className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {format(parseISO(targetDate), "d MMMM yyyy", { locale: fr })}
        </p>
      </div>
    </div>
  );
}
