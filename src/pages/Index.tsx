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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />

      <div className="relative mx-auto max-w-lg px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Scale className="h-5.5 w-5.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">
                Suivi de poids
              </h1>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                {entries.length === 0
                  ? "Commencez votre suivi"
                  : `${entries.length} pesée${entries.length !== 1 ? "s" : ""} enregistrée${entries.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ExportButton entries={entries} chartRef={chartRef} goalWeight={settings.goalWeight} height={settings.height} />
            <SettingsDialog settings={settings} onSave={handleSaveSettings} />
            <ThemeToggle />
          </div>
        </header>

        {/* Form */}
        <div className="animate-slide-up" style={{ animationDelay: "60ms" }}>
          <WeightForm onAdd={handleAdd} />
        </div>

        {/* Stats */}
        <div className="animate-slide-up" style={{ animationDelay: "120ms" }}>
          <StatsCards stats={stats} goalWeight={settings.goalWeight} height={settings.height} />
        </div>

        {/* Goal Prediction */}
        {settings.goalWeight && entries.length >= 7 && (
          <div className="animate-slide-up" style={{ animationDelay: "180ms" }}>
            <GoalPrediction entries={entries} goalWeight={settings.goalWeight} />
          </div>
        )}

        {/* Chart */}
        <div className="animate-slide-up" style={{ animationDelay: "240ms" }}>
          <section ref={chartRef} className="glass-card rounded-2xl p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Évolution
            </h2>
            <WeightChart entries={entries} goalWeight={settings.goalWeight} />
          </section>
        </div>

        {/* History */}
        <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 px-1">
              Historique
            </h2>
            <WeightHistory entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center pb-8 pt-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <p className="text-[10px] font-medium text-muted-foreground/30 tracking-wide">
            Données stockées localement sur votre appareil
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
