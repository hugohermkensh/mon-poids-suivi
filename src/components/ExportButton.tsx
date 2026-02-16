import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WeightEntry, exportToCSV } from "@/lib/weight-storage";
import { toast } from "@/hooks/use-toast";

interface Props {
  entries: WeightEntry[];
}

export default function ExportButton({ entries }: Props) {
  const handleCSV = () => {
    const csv = exportToCSV(entries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `suivi-poids-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV réussi !" });
  };

  const handlePDF = () => {
    const printContent = `
      <html><head><title>Suivi de poids</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; }
      </style></head><body>
      <h1>Suivi de poids — Export du ${new Date().toLocaleDateString("fr-FR")}</h1>
      <table>
        <thead><tr><th>Date</th><th>Poids (kg)</th><th>Note</th></tr></thead>
        <tbody>
          ${entries
            .map(
              (e) =>
                `<tr><td>${e.date}</td><td>${e.weight.toFixed(1)}</td><td>${e.note || ""}</td></tr>`
            )
            .join("")}
        </tbody>
      </table></body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
    toast({ title: "Impression PDF lancée !" });
  };

  if (entries.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Exporter">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSV}>Exporter en CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDF}>Imprimer / PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
