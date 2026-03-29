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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-3xl mb-3">⚖️</p>
        <p className="text-sm font-semibold text-foreground/80">Pas encore de pesée</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ajoutez votre premier poids pour commencer
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
            className="group flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors hover:bg-accent/30"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 shrink-0">
              <span className="text-xs font-bold text-primary">
                {entry.weight.toFixed(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {entry.weight.toFixed(1)}
                  <span className="text-[10px] font-medium text-muted-foreground ml-0.5">kg</span>
                </span>
                {diff !== 0 && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      diff <= 0 ? "text-stat-up bg-stat-up/10" : "text-stat-down bg-stat-down/10"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                {format(parseISO(entry.date), "EEEE d MMM yyyy", { locale: fr })}
              </p>
              {entry.note && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate italic">
                  {entry.note}
                </p>
              )}
            </div>

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
