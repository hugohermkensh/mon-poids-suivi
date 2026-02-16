export interface WeightEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  weight: number; // in kg
  createdAt: string;
}

const STORAGE_KEY = "weight-tracker-entries";

export function getEntries(): WeightEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addEntry(date: string, weight: number): WeightEntry {
  const entries = getEntries();
  const entry: WeightEntry = {
    id: crypto.randomUUID(),
    date,
    weight,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entry;
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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
