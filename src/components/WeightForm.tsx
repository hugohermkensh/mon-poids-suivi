import { useState } from "react";
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
      toast({ title: "Saisie invalide", variant: "destructive" });
      return;
    }
    onAdd(date, w, note || undefined);
    setWeight("");
    setNote("");
    setDate(today);
    setShowNote(false);
    toast({ title: `${w.toFixed(1)} KG enregistré` });
  };

  return (
    <form onSubmit={handleSubmit} className="panel">
      <div className="px-4 py-2 border-b border-border flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono">
          ▸ Saisie
        </span>
        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 transition-colors ${
            showNote ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          [+ NOTE]
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold tracking-widest font-mono pointer-events-none">
              KG
            </div>
            <Input
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="00.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 rounded-none bg-secondary border-border text-lg font-bold pl-10 font-mono tabular-nums focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs px-5 hover:bg-foreground transition-colors shrink-0"
          >
            Save
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            className="h-9 rounded-none bg-secondary border-border text-xs font-mono flex-1 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
          />
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
            TIMESTAMP
          </span>
        </div>

        {showNote && (
          <Input
            placeholder="// note optionnelle..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-9 rounded-none bg-secondary border-border text-xs font-mono animate-fade-in focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
            autoFocus
          />
        )}
      </div>
    </form>
  );
}
