import { useState, useCallback, useRef } from "react";
import { Scale } from "lucide-react";
import {
  getEntries,
  addEntry,
  deleteEntry,
  updateEntry,
  getStats,
  getSettings,
  saveSettings,
  UserSettings,
} from "@/lib/weight-storage";
import WeightForm from "@/components/WeightForm";
import WeightChart from "@/components/WeightChart";
import StatsCards from "@/components/StatsCards";
import WeightHistory from "@/components/WeightHistory";
import ThemeToggle from "@/components/ThemeToggle";
import SettingsDialog from "@/components/SettingsDialog";
import ExportButton from "@/components/ExportButton";
import GoalPrediction from "@/components/GoalPrediction";

const Index = () => {
  const [entries, setEntries] = useState(getEntries);
  const [settings, setSettings] = useState<UserSettings>(getSettings);
  const chartRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => setEntries(getEntries()), []);

  const handleAdd = (date: string, weight: number, note?: string) => {
    addEntry(date, weight, note);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    refresh();
  };

  const handleEdit = (id: string, updates: { date: string; weight: number; note?: string }) => {
    updateEntry(id, updates);
    refresh();
  };

  const handleSaveSettings = (s: UserSettings) => {
    saveSettings(s);
    setSettings(s);
  };

  const stats = getStats(entries);

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative gradient blob */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                Suivi de poids
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground">
                {entries.length === 0
                  ? "Commencez votre suivi"
                  : `${entries.length} entrée${entries.length !== 1 ? "s" : ""} enregistrée${entries.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <ExportButton entries={entries} chartRef={chartRef} goalWeight={settings.goalWeight} height={settings.height} />
            <SettingsDialog settings={settings} onSave={handleSaveSettings} />
            <ThemeToggle />
          </div>
        </div>

        {/* Form */}
        <WeightForm onAdd={handleAdd} />

        {/* Stats */}
        <StatsCards stats={stats} goalWeight={settings.goalWeight} height={settings.height} />

        {/* Goal Prediction */}
        {settings.goalWeight && entries.length >= 7 && (
          <GoalPrediction entries={entries} goalWeight={settings.goalWeight} />
        )}

        {/* Chart */}
        <div ref={chartRef} className="rounded-2xl border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Évolution
          </h2>
          <WeightChart entries={entries} goalWeight={settings.goalWeight} />
        </div>

        {/* History */}
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Historique
          </h2>
          <WeightHistory entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/50 pb-4">
          Suivi de poids · Vos données sont stockées localement
        </p>
      </div>
    </div>
  );
};

export default Index;
