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
      <div className="glass-card rounded-3xl flex flex-col items-center justify-center py-14 text-center">
        <span className="text-4xl mb-4 animate-float">🏋️</span>
        <p className="text-sm font-bold text-foreground">Pas encore de pesée</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-[220px] leading-relaxed">
          Ajoutez votre premier poids ci-dessus pour commencer le suivi
        </p>
      </div>
    );
  }

  const sorted = [...entries].reverse();

  return (
    <div className="space-y-2.5">
      {sorted.map((entry, i) => {
        const prev = sorted[i + 1];
        const diff = prev ? entry.weight - prev.weight : 0;
        const isLatest = i === 0;
        return (
          <div
            key={entry.id}
            className={`group glass-card flex items-center gap-4 rounded-2xl px-5 py-4 transition-all hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 ${
              isLatest ? "ring-1 ring-primary/20" : ""
            }`}
          >
            {/* Weight circle */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-105 ${
              isLatest ? "gradient-primary shadow-md shadow-primary/30" : "bg-primary/10"
            }`}>
              <span className={`text-sm font-black ${isLatest ? "text-primary-foreground" : "text-primary"}`}>
                {entry.weight.toFixed(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-black text-foreground tracking-tight">
                  {entry.weight.toFixed(1)}
                  <span className="text-xs font-bold text-muted-foreground ml-1">kg</span>
                </span>
                {diff !== 0 && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      diff <= 0
                        ? "text-stat-up bg-stat-up/10"
                        : "text-stat-down bg-stat-down/10"
                    }`}
                  >
                    {diff > 0 ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}
                  </span>
                )}
                {isLatest && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                    Dernière
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {format(parseISO(entry.date), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              {entry.note && (
                <p className="text-[11px] text-muted-foreground/60 mt-1 truncate italic">
                  💬 {entry.note}
                </p>
              )}
            </div>

            {/* Actions */}
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
