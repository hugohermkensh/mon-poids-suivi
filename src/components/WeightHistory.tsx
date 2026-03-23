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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
          <span className="text-2xl">⚖️</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Aucune entrée pour le moment
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Ajoutez votre premier poids ci-dessus
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
            className="animate-fade-in group flex items-center justify-between rounded-2xl border bg-card px-4 py-3.5 transition-all duration-200 hover:shadow-md hover:border-primary/20"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-base font-extrabold text-foreground tracking-tight">
                  {entry.weight.toFixed(1)}
                  <span className="text-xs font-medium text-muted-foreground ml-0.5">kg</span>
                </p>
                {diff !== 0 && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      diff <= 0
                        ? "text-stat-up bg-stat-up/10"
                        : "text-stat-down bg-stat-down/10"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                {format(parseISO(entry.date), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              {entry.note && (
                <p className="text-[11px] text-muted-foreground/60 italic mt-0.5 truncate max-w-[200px]">
                  {entry.note}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditEntryDialog entry={entry} onSave={onEdit} />
              <DeleteConfirmDialog onConfirm={() => onDelete(entry.id)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
