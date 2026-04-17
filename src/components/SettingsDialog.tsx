import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserSettings } from "@/lib/weight-storage";
import { toast } from "@/hooks/use-toast";

interface Props {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export default function SettingsDialog({ settings, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [goalWeight, setGoalWeight] = useState(settings.goalWeight?.toString() || "");
  const [height, setHeight] = useState(settings.height?.toString() || "");

  const handleSave = () => {
    const gw = parseFloat(goalWeight);
    const h = parseFloat(height);
    onSave({
      goalWeight: !isNaN(gw) && gw > 0 ? gw : undefined,
      height: !isNaN(h) && h > 0 ? h : undefined,
    });
    setOpen(false);
    toast({ title: "Configuration sauvegardée" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-none h-8 w-8 hover:bg-secondary hover:text-primary" aria-label="Configuration">
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-none border-primary/30 bg-card">
        <DialogHeader>
          <DialogTitle className="text-base font-bold uppercase tracking-widest font-mono text-primary">
            ▸ Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
              Poids Cible (KG)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="00.0"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="h-11 rounded-none bg-secondary border-border font-mono tabular-nums focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
              Taille (CM)
            </Label>
            <Input
              type="number"
              step="1"
              min="100"
              max="250"
              placeholder="000"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-11 rounded-none bg-secondary border-border font-mono tabular-nums focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full h-11 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs hover:bg-foreground transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
