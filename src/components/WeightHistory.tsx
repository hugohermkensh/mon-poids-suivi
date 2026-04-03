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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
          <span className="text-2xl">⚖️</span>
        </div>
        <p className="text-sm font-bold text-foreground">Pas encore de pesée</p>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">
          Ajoutez votre premier poids ci-dessus pour commencer le suivi
        </p>
      </div>
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
            className="group glass-card flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all hover:shadow-md"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {/* Weight badge */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/12 to-primary/5 shrink-0">
              <span className="text-sm font-black text-primary">
                {entry.weight.toFixed(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground tracking-tight">
                  {entry.weight.toFixed(1)}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">kg</span>
                </span>
                {diff !== 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      diff <= 0
                        ? "text-stat-up bg-stat-up/10"
                        : "text-stat-down bg-stat-down/10"
                    }`}
                  >
                    {diff > 0 ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                {format(parseISO(entry.date), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              {entry.note && (
                <p className="text-[10px] text-muted-foreground/50 mt-0.5 truncate italic">
                  {entry.note}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditEntryDialog entry={entry} onSave={onEdit} />
              <DeleteConfirmDialog onConfirm={() => onDelete(entry.id)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
