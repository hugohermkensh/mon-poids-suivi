import { useState, useCallback, useRef } from "react";
import { Scale, Sparkles } from "lucide-react";
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
      {/* Decorative gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-primary/6 blur-[100px]" />
        <div className="absolute top-1/3 -right-32 h-48 w-48 rounded-full bg-primary/4 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-5 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
                <Scale className="h-5.5 w-5.5 text-primary-foreground" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-stat-up border-2 border-background" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground leading-tight">
                Suivi de poids
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground leading-tight mt-0.5">
                {entries.length === 0
                  ? "Commencez votre suivi aujourd'hui"
                  : `${entries.length} pesée${entries.length !== 1 ? "s" : ""} · ${
                      entries.length >= 2
                        ? `${stats?.diff && stats.diff <= 0 ? "↓" : "↑"} tendance`
                        : "en cours"
                    }`}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <ExportButton entries={entries} chartRef={chartRef} goalWeight={settings.goalWeight} height={settings.height} />
            <SettingsDialog settings={settings} onSave={handleSaveSettings} />
            <ThemeToggle />
          </div>
        </header>

        {/* Form */}
        <WeightForm onAdd={handleAdd} />

        {/* Stats */}
        <StatsCards stats={stats} goalWeight={settings.goalWeight} height={settings.height} />

        {/* Goal Prediction */}
        {settings.goalWeight && entries.length >= 7 && (
          <GoalPrediction entries={entries} goalWeight={settings.goalWeight} />
        )}

        {/* Chart */}
        <section ref={chartRef} className="rounded-2xl border bg-card/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Évolution
            </h2>
          </div>
          <WeightChart entries={entries} goalWeight={settings.goalWeight} />
        </section>

        {/* History */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
            Historique
          </h2>
          <WeightHistory entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
        </section>

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
