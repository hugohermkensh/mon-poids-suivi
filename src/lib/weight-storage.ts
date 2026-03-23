export interface WeightEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  weight: number; // in kg
  note?: string;
  createdAt: string;
}

export interface UserSettings {
  goalWeight?: number;
  height?: number; // in cm
}

const STORAGE_KEY = "weight-tracker-entries";
const SETTINGS_KEY = "weight-tracker-settings";

export function getEntries(): WeightEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addEntry(date: string, weight: number, note?: string): WeightEntry {
  const entries = getEntries();
  const entry: WeightEntry = {
    id: crypto.randomUUID(),
    date,
    weight,
    note,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entry;
}

export function updateEntry(id: string, updates: Partial<Pick<WeightEntry, "date" | "weight" | "note">>): void {
  const entries = getEntries().map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  entries.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getSettings(): UserSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Insuffisant", color: "text-stat-down" };
  if (bmi < 25) return { label: "Normal", color: "text-stat-up" };
  if (bmi < 30) return { label: "Surpoids", color: "text-yellow-500" };
  return { label: "Obésité", color: "text-stat-down" };
}

export function getStats(entries: WeightEntry[]) {
  if (entries.length === 0) return null;
  const weights = entries.map((e) => e.weight);
  const current = entries[entries.length - 1].weight;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  const diff = entries.length >= 2 ? current - entries[entries.length - 2].weight : 0;
  return { current, min, max, avg, diff };
}

export function getMovingAverage(entries: WeightEntry[], window = 7): { date: string; avg: number }[] {
  if (entries.length < 2) return [];
  const result: { date: string; avg: number }[] = [];
  for (let i = 0; i < entries.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = entries.slice(start, i + 1);
    const avg = slice.reduce((s, e) => s + e.weight, 0) / slice.length;
    result.push({ date: entries[i].date, avg: Math.round(avg * 10) / 10 });
  }
  return result;
}

export function predictGoalDate(entries: WeightEntry[], goalWeight: number): string | null {
  if (entries.length < 7) return null;
  const recent = entries.slice(-14);
  if (recent.length < 2) return null;
  
  const firstWeight = recent[0].weight;
  const lastWeight = recent[recent.length - 1].weight;
  const daysDiff = (new Date(recent[recent.length - 1].date).getTime() - new Date(recent[0].date).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff === 0) return null;
  
  const dailyChange = (lastWeight - firstWeight) / daysDiff;
  
  if (dailyChange === 0) return null;
  
  const remainingKg = goalWeight - lastWeight;
  const daysNeeded = remainingKg / dailyChange;
  
  if (daysNeeded < 0) return null; // Going wrong direction
  if (daysNeeded > 365 * 3) return null; // Too far
  
  const targetDate = new Date(recent[recent.length - 1].date);
  targetDate.setDate(targetDate.getDate() + Math.ceil(daysNeeded));
  return targetDate.toISOString().split("T")[0];
}

export function exportToCSV(entries: WeightEntry[]): string {
  const header = "Date,Poids (kg)";
  const rows = entries.map((e) => `${e.date},${e.weight}`);
  return [header, ...rows].join("\n");
}
