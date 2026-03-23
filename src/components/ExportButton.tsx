import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WeightEntry, exportToCSV, getStats, calculateBMI, getBMICategory } from "@/lib/weight-storage";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  entries: WeightEntry[];
  chartRef?: React.RefObject<HTMLDivElement>;
  goalWeight?: number;
  height?: number;
}

export default function ExportButton({ entries, chartRef, goalWeight, height }: Props) {
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

  const handlePDF = async () => {
    let chartDataUrl = "";
    if (chartRef?.current) {
      const svg = chartRef.current.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const svgRect = svg.getBoundingClientRect();
        canvas.width = svgRect.width * 2;
        canvas.height = svgRect.height * 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(2, 2);
          const img = new Image();
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              chartDataUrl = canvas.toDataURL("image/png");
              URL.revokeObjectURL(url);
              resolve();
            };
            img.src = url;
          });
        }
      }
    }

    const stats = getStats(entries);
    const bmi = stats && height ? calculateBMI(stats.current, height) : null;
    const bmiCat = bmi ? getBMICategory(bmi) : null;

    const printContent = `
      <html><head><title>Suivi de poids</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; padding: 40px; color: #1a2b2f; background: #fff; }
        
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #0d9488; }
        .header-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #0d9488, #14b8a6); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .header-icon svg { width: 24px; height: 24px; color: white; }
        .header h1 { font-size: 22px; font-weight: 800; color: #0f2b2f; letter-spacing: -0.5px; }
        .header p { font-size: 12px; color: #6b8a8e; font-weight: 500; margin-top: 2px; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
        .stat-card { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 14px 16px; }
        .stat-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b8a8e; margin-bottom: 4px; }
        .stat-value { font-size: 20px; font-weight: 800; color: #0f2b2f; }
        .stat-sub { font-size: 11px; font-weight: 600; margin-top: 2px; }
        .stat-sub.up { color: #059669; }
        .stat-sub.down { color: #dc2626; }

        .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #0d9488; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #e0f2f1; }

        .chart-container { margin-bottom: 28px; background: #fafffe; border: 1px solid #e0f2f1; border-radius: 16px; padding: 20px; }
        .chart-container img { width: 100%; border-radius: 8px; }

        table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; border: 1px solid #e0f2f1; }
        thead th { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 12px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
        tbody tr { transition: background 0.2s; }
        tbody tr:nth-child(even) { background: #f0fdfa; }
        tbody td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #e0f2f1; }
        tbody td:first-child { font-weight: 500; color: #6b8a8e; }
        tbody td:nth-child(2) { font-weight: 700; color: #0f2b2f; }
        tbody td:nth-child(3) { font-weight: 600; font-size: 12px; }
        .diff-pos { color: #dc2626; }
        .diff-neg { color: #059669; }

        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e0f2f1; display: flex; justify-content: space-between; align-items: center; }
        .footer p { font-size: 10px; color: #9cb3b6; font-weight: 500; }

        @media print {
          body { padding: 20px; }
          .stat-card { break-inside: avoid; }
        }
      </style></head><body>

      <div class="header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
        </div>
        <div>
          <h1>Suivi de poids</h1>
          <p>Rapport du ${format(new Date(), "d MMMM yyyy", { locale: fr })} · ${entries.length} entrée${entries.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      ${stats ? `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Actuel</div>
          <div class="stat-value">${stats.current.toFixed(1)}</div>
          <div class="stat-sub ${stats.diff <= 0 ? 'up' : 'down'}">${stats.diff > 0 ? '+' : ''}${stats.diff.toFixed(1)} kg</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Moyenne</div>
          <div class="stat-value">${stats.avg.toFixed(1)}</div>
          <div class="stat-sub" style="color:#6b8a8e">kg</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Min / Max</div>
          <div class="stat-value">${stats.min.toFixed(1)}</div>
          <div class="stat-sub" style="color:#6b8a8e">→ ${stats.max.toFixed(1)} kg</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">${bmi ? 'IMC' : 'Objectif'}</div>
          <div class="stat-value">${bmi ? bmi.toFixed(1) : (goalWeight ? goalWeight.toFixed(1) : '—')}</div>
          <div class="stat-sub" style="color:${bmiCat ? (bmiCat.label === 'Normal' ? '#059669' : '#dc2626') : '#6b8a8e'}">${bmiCat ? bmiCat.label : (goalWeight ? 'kg' : '')}</div>
        </div>
      </div>
      ` : ''}

      ${chartDataUrl ? `
      <div class="section-title">Évolution</div>
      <div class="chart-container">
        <img src="${chartDataUrl}" alt="Graphique d'évolution du poids" />
      </div>
      ` : ''}

      <div class="section-title">Historique détaillé</div>
      <table>
        <thead><tr><th>Date</th><th>Poids (kg)</th><th>Variation</th></tr></thead>
        <tbody>
          ${entries.map((e, i) => {
            const prev = entries[i - 1];
            const diff = prev ? e.weight - prev.weight : 0;
            const diffStr = i === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`;
            const diffClass = i === 0 ? '' : (diff <= 0 ? 'diff-neg' : 'diff-pos');
            return `<tr>
              <td>${format(parseISO(e.date), "d MMM yyyy", { locale: fr })}</td>
              <td>${e.weight.toFixed(1)} kg</td>
              <td class="${diffClass}">${diffStr}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>Généré automatiquement · Suivi de poids</p>
        <p>${format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
      </div>

      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      setTimeout(() => win.print(), 500);
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
