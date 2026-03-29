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
        <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" aria-label="Paramètres">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-primary" />
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
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Ruler className="h-3.5 w-3.5 text-primary" />
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
              className="h-11 rounded-xl"
            />
          </div>
          <Button onClick={handleSave} className="w-full h-11 rounded-xl font-bold">
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
