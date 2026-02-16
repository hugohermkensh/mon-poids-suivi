import { useState, useCallback } from "react";
import { Scale } from "lucide-react";
import {
  getEntries,
  addEntry,
  deleteEntry,
  getStats,
} from "@/lib/weight-storage";
import WeightForm from "@/components/WeightForm";
import WeightChart from "@/components/WeightChart";
import StatsCards from "@/components/StatsCards";
import WeightHistory from "@/components/WeightHistory";

const Index = () => {
  const [entries, setEntries] = useState(getEntries);

  const refresh = useCallback(() => setEntries(getEntries()), []);

  const handleAdd = (date: string, weight: number) => {
    addEntry(date, weight);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    refresh();
  };

  const stats = getStats(entries);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Suivi de poids</h1>
            <p className="text-xs text-muted-foreground">
              {entries.length} entrée{entries.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Form */}
        <WeightForm onAdd={handleAdd} />

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Chart */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Évolution</h2>
          <WeightChart entries={entries} />
        </div>

        {/* History */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Historique</h2>
          <WeightHistory entries={entries} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Index;
