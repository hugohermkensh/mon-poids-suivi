import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Target, TrendingDown } from "lucide-react";
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
    <div className="animate-fade-in rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/6 via-card to-accent/15 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-md shadow-primary/20 shrink-0">
          <Target className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendingDown className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Prédiction objectif
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {format(parseISO(targetDate), "d MMMM yyyy", { locale: fr })}
            </p>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
              {daysLeft}j
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
