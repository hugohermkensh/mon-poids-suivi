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
      <div className="mx-auto max-w-lg px-4 py-6 space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Scale className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground">
                Suivi de poids
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                {entries.length === 0
                  ? "Commencez votre suivi"
                  : `${entries.length} pesée${entries.length !== 1 ? "s" : ""} enregistrée${entries.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <ExportButton entries={entries} chartRef={chartRef} goalWeight={settings.goalWeight} height={settings.height} />
            <SettingsDialog settings={settings} onSave={handleSaveSettings} />
            <ThemeToggle />
          </div>
        </header>

        {/* Form */}
        <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
          <WeightForm onAdd={handleAdd} />
        </div>

        {/* Stats */}
        <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
          <StatsCards stats={stats} goalWeight={settings.goalWeight} height={settings.height} />
        </div>

        {/* Goal Prediction */}
        {settings.goalWeight && entries.length >= 7 && (
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <GoalPrediction entries={entries} goalWeight={settings.goalWeight} />
          </div>
        )}

        {/* Chart */}
        <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
          <section ref={chartRef} className="rounded-2xl border bg-card p-4">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Évolution
            </h2>
            <WeightChart entries={entries} goalWeight={settings.goalWeight} />
          </section>
        </div>

        {/* History */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
              Historique
            </h2>
            <WeightHistory entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center pb-6 pt-2">
          <p className="text-[10px] font-medium text-muted-foreground/40">
            Données stockées localement sur votre appareil
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
