import { useState, useCallback, useRef, useEffect } from "react";
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
  const [time, setTime] = useState(() => new Date());
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
  const timeStr = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle grid backdrop */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-[0.35]" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative mx-auto max-w-md">
        {/* Top status bar */}
        <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-5 pt-6 pb-4 flex justify-between items-end">
            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-accent font-bold mb-1 font-mono">
                Télémétrie Corporelle
              </div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground leading-none">
                Masse<span className="text-primary">.</span>RAW
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
                  {entries.length} log{entries.length !== 1 ? "s" : ""}
                </div>
                <div className="text-[10px] font-mono text-foreground tabular-nums">
                  {timeStr}
                </div>
              </div>
              <div className="size-2 bg-primary animate-pulse-neon" aria-label="sync" />
            </div>
          </div>
          <div className="px-5 pb-2 flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
              SYS · OPÉRATIONNEL
            </span>
            <div className="flex items-center gap-1">
              <ExportButton entries={entries} chartRef={chartRef} goalWeight={settings.goalWeight} height={settings.height} />
              <SettingsDialog settings={settings} onSave={handleSaveSettings} />
              <ThemeToggle />
            </div>
          </div>
        </div>

        <main className="px-4 py-5 space-y-5 pb-16">
          {/* Stats hero */}
          <div className="animate-slide-up">
            <StatsCards stats={stats} goalWeight={settings.goalWeight} height={settings.height} />
          </div>

          {/* Form */}
          <div className="animate-slide-up" style={{ animationDelay: "60ms" }}>
            <WeightForm onAdd={handleAdd} />
          </div>

          {/* Goal Prediction */}
          {settings.goalWeight && entries.length >= 7 && (
            <div className="animate-slide-up" style={{ animationDelay: "120ms" }}>
              <GoalPrediction entries={entries} goalWeight={settings.goalWeight} />
            </div>
          )}

          {/* Chart */}
          <div className="animate-slide-up" style={{ animationDelay: "180ms" }}>
            <section ref={chartRef} className="panel p-4">
              <div className="flex justify-between items-baseline mb-4 pb-2 border-b border-border">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                  ▸ Volume de Masse
                </h2>
                <span className="text-[9px] text-primary font-mono uppercase tracking-widest">
                  LIVE
                </span>
              </div>
              <WeightChart entries={entries} goalWeight={settings.goalWeight} />
            </section>
          </div>

          {/* History */}
          <div className="animate-slide-up" style={{ animationDelay: "240ms" }}>
            <section className="panel">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
                  ▸ Registre Brut
                </h2>
                <span className="text-[9px] font-mono text-muted-foreground tabular-nums">
                  {entries.length.toString().padStart(3, "0")}
                </span>
              </div>
              <WeightHistory entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
            </section>
          </div>

          {/* Footer */}
          <footer className="text-center pt-6 animate-fade-in" style={{ animationDelay: "320ms" }}>
            <p className="text-[9px] text-muted-foreground/60 font-mono uppercase tracking-[0.2em]">
              Données locales · MASSE.RAW v2.0
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
