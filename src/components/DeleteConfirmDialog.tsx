import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface Props {
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ onConfirm }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold">Supprimer cette entrée ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="rounded-xl bg-destructive hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
