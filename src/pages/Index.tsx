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
    <div className="min-h-screen bg-background relative">
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[520px] h-[520px] rounded-full bg-primary/[0.06] blur-[110px]" />
        <div className="absolute -bottom-48 -left-48 w-[420px] h-[420px] rounded-full bg-[hsl(var(--primary-glow))]/[0.05] blur-[110px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-md px-5 py-10 space-y-8">
        {/* Header */}
        <header className="animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-xl shadow-primary/30">
                  <Scale className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent border-2 border-background animate-float">
                  <Sparkles className="h-2.5 w-2.5 text-accent-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Weight<span className="text-gradient">Track</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                  {entries.length === 0
                    ? "Commencez votre suivi"
                    : `${entries.length} pesée${entries.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ExportButton entries={entries} chartRef={chartRef} goalWeight={settings.goalWeight} height={settings.height} />
              <SettingsDialog settings={settings} onSave={handleSaveSettings} />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Form */}
        <div className="animate-slide-up" style={{ animationDelay: "80ms" }}>
          <WeightForm onAdd={handleAdd} />
        </div>

        {/* Stats */}
        <div className="animate-slide-up" style={{ animationDelay: "160ms" }}>
          <StatsCards stats={stats} goalWeight={settings.goalWeight} height={settings.height} />
        </div>

        {/* Goal Prediction */}
        {settings.goalWeight && entries.length >= 7 && (
          <div className="animate-slide-up" style={{ animationDelay: "240ms" }}>
            <GoalPrediction entries={entries} goalWeight={settings.goalWeight} />
          </div>
        )}

        {/* Chart */}
        <div className="animate-slide-up" style={{ animationDelay: "320ms" }}>
          <section ref={chartRef} className="glass-card rounded-3xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
              📊 Évolution
            </h2>
            <WeightChart entries={entries} goalWeight={settings.goalWeight} />
          </section>
        </div>

        {/* History */}
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-1">
              📋 Historique
            </h2>
            <WeightHistory entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center pb-10 pt-4 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <p className="text-xs text-muted-foreground/40 font-medium">
            Données stockées localement · WeightTrack
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
