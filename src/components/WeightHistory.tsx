import { WeightEntry } from "@/lib/weight-storage";
import { Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  entries: WeightEntry[];
  onDelete: (id: string) => void;
}

export default function WeightHistory({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        Aucune entrée pour le moment
      </p>
    );
  }

  const sorted = [...entries].reverse();

  return (
    <div className="space-y-2">
      {sorted.map((entry, i) => {
        const prev = sorted[i + 1];
        const diff = prev ? entry.weight - prev.weight : 0;
        return (
          <div
            key={entry.id}
            className="animate-fade-in flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-shadow hover:shadow-sm"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {entry.weight.toFixed(1)} kg
              </p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {diff !== 0 && (
                <span
                  className={`text-xs font-medium ${diff <= 0 ? "text-stat-up" : "text-stat-down"}`}
                >
                  {diff > 0 ? "+" : ""}
                  {diff.toFixed(1)}
                </span>
              )}
              <button
                onClick={() => onDelete(entry.id)}
                className="text-muted-foreground/50 hover:text-destructive transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
