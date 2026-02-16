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
              {entry.note && (
                <p className="text-xs text-muted-foreground/70 italic mt-0.5">
                  {entry.note}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {diff !== 0 && (
                <span
                  className={`text-xs font-medium ${diff <= 0 ? "text-stat-up" : "text-stat-down"}`}
                >
                  {diff > 0 ? "+" : ""}
                  {diff.toFixed(1)}
                </span>
              )}
              <EditEntryDialog entry={entry} onSave={onEdit} />
              <DeleteConfirmDialog onConfirm={() => onDelete(entry.id)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
