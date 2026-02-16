import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Target } from "lucide-react";
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
    <div className="animate-fade-in flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Target className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Objectif estimé le</p>
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {format(parseISO(targetDate), "d MMMM yyyy", { locale: fr })}
        </p>
      </div>
    </div>
  );
}
