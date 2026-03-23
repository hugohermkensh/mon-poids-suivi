import { WeightEntry } from "@/lib/weight-storage";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import EditEntryDialog from "./EditEntryDialog";

interface Props {
  entries: WeightEntry[];
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: { date: string; weight: number; note?: string }) => void;
}

export default function WeightHistory({ entries, onDelete, onEdit }: Props) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
          <span className="text-3xl">⚖️</span>
        </div>
        <p className="text-sm font-semibold text-foreground/80">
          Pas encore de pesée
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Ajoutez votre premier poids pour commencer le suivi
        </p>
      </div>
    );
  }

  const sorted = [...entries].reverse();

  return (
    <div className="space-y-1.5">
      {sorted.map((entry, i) => {
        const prev = sorted[i + 1];
        const diff = prev ? entry.weight - prev.weight : 0;
        return (
          <div
            key={entry.id}
            className="animate-fade-in group flex items-center gap-3 rounded-2xl border bg-card/80 backdrop-blur-sm px-4 py-3 transition-all duration-200 hover:shadow-md hover:border-primary/15"
            style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
          >
            {/* Weight badge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/30 shrink-0">
              <span className="text-xs font-extrabold text-primary">
                {entry.weight.toFixed(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-foreground tracking-tight">
                  {entry.weight.toFixed(1)}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">kg</span>
                </span>
                {diff !== 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-tight ${
                      diff <= 0
                        ? "text-stat-up bg-stat-up/12"
                        : "text-stat-down bg-stat-down/12"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5 capitalize">
                {format(parseISO(entry.date), "EEEE d MMM yyyy", { locale: fr })}
              </p>
              {entry.note && (
                <p className="text-[10px] text-muted-foreground/50 italic mt-0.5 truncate">
                  {entry.note}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <EditEntryDialog entry={entry} onSave={onEdit} />
              <DeleteConfirmDialog onConfirm={() => onDelete(entry.id)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
