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
      <div className="flex flex-col items-center justify-center py-14 text-center px-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono mb-3">
          ╴ NO DATA ╴
        </div>
        <p className="text-xs text-muted-foreground/60 font-mono max-w-[240px] leading-relaxed">
          Aucune entrée dans le registre.<br />Effectuez une première saisie.
        </p>
      </div>
    );
  }

  const sorted = [...entries].reverse();

  return (
    <div className="flex flex-col">
      {sorted.map((entry, i) => {
        const prev = sorted[i + 1];
        const diff = prev ? entry.weight - prev.weight : 0;
        const isLatest = i === 0;
        return (
          <div
            key={entry.id}
            className="group flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono tracking-wider ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>
                  {format(parseISO(entry.date), "dd MMM yyyy", { locale: fr }).toUpperCase()}
                </span>
                {isLatest && (
                  <span className="text-[8px] font-mono uppercase tracking-widest text-primary-foreground bg-primary px-1 leading-tight">
                    LAST
                  </span>
                )}
              </div>
              {entry.note && (
                <span className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-[180px]">
                  // {entry.note}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {prev ? (
                <span
                  className={`text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 leading-tight ${
                    diff <= 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-muted-foreground/50 border border-border px-1.5 py-0.5 leading-tight">
                  —
                </span>
              )}
              <span className={`text-base font-bold tabular-nums font-mono w-[60px] text-right ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>
                {entry.weight.toFixed(1)}
              </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <EditEntryDialog entry={entry} onSave={onEdit} />
                <DeleteConfirmDialog onConfirm={() => onDelete(entry.id)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
