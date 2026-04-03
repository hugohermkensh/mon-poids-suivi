import { useState } from "react";
import { Plus, CalendarDays, Weight, StickyNote } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 pl-10 rounded-xl bg-muted/50 border-0 text-sm font-medium focus:bg-muted/70 transition-colors"
            max={today}
          />
        </div>
        <div className="relative flex-1">
          <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            type="number"
            step="0.1"
            min="20"
            max="300"
            placeholder="Poids en kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-12 pl-10 rounded-xl bg-muted/50 border-0 text-sm font-bold focus:bg-muted/70 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className={`flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs font-semibold transition-all ${
            showNote
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <StickyNote className="h-3.5 w-3.5" />
          Note
        </button>
        <div className="flex-1" />
        <Button
          type="submit"
          className="h-10 px-6 rounded-xl font-bold text-xs gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Ajouter
        </Button>
      </div>

      {showNote && (
        <Input
          placeholder="Ex: après sport, à jeun..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-11 rounded-xl bg-muted/50 border-0 text-sm animate-fade-in"
          autoFocus
        />
      )}
    </form>
  );
}
