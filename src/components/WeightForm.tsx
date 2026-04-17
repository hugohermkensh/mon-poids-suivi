import { useState } from "react";
import { Plus, CalendarDays, Weight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Props {
  onAdd: (date: string, weight: number, note?: string) => void;
}

export default function WeightForm({ onAdd }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!date || isNaN(w) || w <= 0) {
      toast({ title: "Veuillez saisir un poids valide", variant: "destructive" });
      return;
    }
    onAdd(date, w, note || undefined);
    setWeight("");
    setNote("");
    setDate(today);
    setShowNote(false);
    toast({ title: `${w.toFixed(1)} kg enregistré ✓` });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 rounded-2xl bg-secondary/60 border-0 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary/40 transition-all"
            max={today}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Weight className="h-3 w-3" />
            Poids (kg)
          </label>
          <Input
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder="72.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-12 rounded-2xl bg-secondary/60 border-0 text-sm font-black focus-visible:ring-2 focus-visible:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {showNote && (
        <Input
          placeholder="Ex: après sport, à jeun..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-11 rounded-2xl bg-secondary/60 border-0 text-sm animate-fade-in focus-visible:ring-2 focus-visible:ring-primary/40"
          autoFocus
        />
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className={`flex items-center gap-1.5 px-4 h-11 rounded-2xl text-xs font-bold transition-all ${
            showNote
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Note
        </button>
        <Button
          type="submit"
          className="flex-1 h-11 rounded-2xl font-bold text-sm gap-2 gradient-primary text-primary-foreground border-0 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
