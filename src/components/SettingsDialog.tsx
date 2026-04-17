import { useState } from "react";
import { Settings, Target, Ruler } from "lucide-react";
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
    toast({ title: "Paramètres sauvegardés ✓" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-2xl h-10 w-10 hover:bg-accent" aria-label="Paramètres">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">⚙️ Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-3.5 w-3.5 text-primary" />
              </div>
              Poids objectif (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="Ex: 70"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="h-12 rounded-2xl bg-secondary/60 border-0 focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
                <Ruler className="h-3.5 w-3.5 text-primary" />
              </div>
              Taille (cm)
            </Label>
            <Input
              type="number"
              step="1"
              min="100"
              max="250"
              placeholder="Ex: 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-12 rounded-2xl bg-secondary/60 border-0 focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-2xl font-bold gradient-primary text-primary-foreground border-0 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
