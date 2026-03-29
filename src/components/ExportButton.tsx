import { Download, FileText, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

function captureChart(chartRef?: React.RefObject<HTMLDivElement>): Promise<string> {
  return new Promise((resolve) => {
    if (!chartRef?.current) return resolve("");
    const svg = chartRef.current.querySelector("svg");
    if (!svg) return resolve("");

    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const elements = clone.querySelectorAll("*");
    const originalElements = svg.querySelectorAll("*");
    elements.forEach((el, i) => {
      const orig = originalElements[i];
      if (orig) {
        const computed = window.getComputedStyle(orig);
        const fill = computed.getPropertyValue("fill");
        const stroke = computed.getPropertyValue("stroke");
        if (fill && fill !== "none") (el as SVGElement).style.fill = fill;
        if (stroke && stroke !== "none") (el as SVGElement).style.stroke = stroke;
      }
    });

    const svgData = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement("canvas");
    const rect = svg.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve("");

    ctx.scale(2, 2);
    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      resolve(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve("");
    img.src = url;
  });
}

export default function ExportButton({ entries, chartRef, goalWeight, height }: Props) {
  const handleCSV = () => {
    const csv = exportToCSV(entries);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `suivi-poids-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV réussi !" });
  };

  const handlePDF = () => {
    const win = window.open("", "_blank");
    if (!win) {
      toast({ title: "Popup bloqué", description: "Autorisez les popups pour exporter.", variant: "destructive" });
      return;
    }

    win.document.write(`<html><head><title>Chargement...</title><style>
      body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa}
      .l{text-align:center;color:#059669}
      .s{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#059669;border-radius:50%;animation:r 0.7s linear infinite;margin:0 auto 12px}
      @keyframes r{to{transform:rotate(360deg)}}
    </style></head><body><div class="l"><div class="s"></div><p style="font-size:13px">Préparation...</p></div></body></html>`);

    captureChart(chartRef).then((chartImg) => {
      const stats = getStats(entries);
      const bmi = stats && height ? calculateBMI(stats.current, height) : null;
      const bmiCat = bmi ? getBMICategory(bmi) : null;

      win.document.open();
      win.document.write(buildPDF(entries, stats, bmi, bmiCat, goalWeight, chartImg));
      win.document.close();
      setTimeout(() => win.print(), 500);
    });

    toast({ title: "PDF en cours de génération..." });
  };

  if (entries.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" aria-label="Exporter">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[170px]">
        <DropdownMenuItem onClick={handleCSV} className="gap-2">
          <Table2 className="h-4 w-4 text-muted-foreground" />
          Exporter CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePDF} className="gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Imprimer / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function buildPDF(
  entries: WeightEntry[],
  stats: ReturnType<typeof getStats>,
  bmi: number | null,
  bmiCat: { label: string; color: string } | null,
  goalWeight: number | undefined,
  chartImg: string
) {
  const dateStr = format(new Date(), "d MMMM yyyy", { locale: fr });
  const timeStr = format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr });

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Suivi de poids — Rapport</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',-apple-system,sans-serif;color:#111827;background:#fff;max-width:720px;margin:0 auto;padding:40px 48px}
  
  .hdr{display:flex;align-items:center;gap:16px;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #059669}
  .logo{width:44px;height:44px;background:#059669;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .logo svg{width:22px;height:22px;stroke:white;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .hdr h1{font-size:20px;font-weight:800;color:#111827}
  .hdr p{font-size:12px;color:#6b7280;margin-top:2px}
  
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
  .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px}
  .card-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#6b7280;margin-bottom:4px}
  .card-val{font-size:20px;font-weight:800;color:#111827}
  .card-unit{font-size:11px;font-weight:500;color:#9ca3af}
  .card-sub{font-size:10px;font-weight:600;margin-top:4px}
  .green{color:#059669} .red{color:#dc2626} .gray{color:#6b7280}
  
  .section{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#059669;margin:28px 0 14px;display:flex;align-items:center;gap:10px}
  .section::after{content:'';flex:1;height:1px;background:#e5e7eb}
  
  .chart{margin-bottom:28px;background:#fafafa;border:1px solid #e5e7eb;border-radius:14px;padding:20px}
  .chart img{width:100%;display:block;border-radius:8px}
  
  table{width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;font-size:12px}
  thead{background:#059669}
  th{color:white;padding:10px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;text-align:left}
  td{padding:10px 16px;border-bottom:1px solid #f3f4f6}
  tr:nth-child(even){background:#f9fafb}
  .w-col{font-weight:700;color:#111827}
  
  .foot{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between}
  .foot p{font-size:9px;color:#9ca3af}
  .foot .brand{color:#059669;font-weight:700}
  
  @media print{body{padding:20px 24px;max-width:none}table{page-break-inside:auto}tr{page-break-inside:avoid}}
</style></head><body>

<div class="hdr">
  <div class="logo">
    <svg viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
  </div>
  <div>
    <h1>Suivi de poids</h1>
    <p>Rapport du ${dateStr} — ${entries.length} pesée${entries.length !== 1 ? "s" : ""}</p>
  </div>
</div>

${stats ? `
<div class="grid">
  <div class="card">
    <div class="card-label">Poids actuel</div>
    <div class="card-val">${stats.current.toFixed(1)} <span class="card-unit">kg</span></div>
    <div class="card-sub ${stats.diff <= 0 ? 'green' : 'red'}">${stats.diff > 0 ? '+' : ''}${stats.diff.toFixed(1)} kg</div>
  </div>
  <div class="card">
    <div class="card-label">Moyenne</div>
    <div class="card-val">${stats.avg.toFixed(1)} <span class="card-unit">kg</span></div>
    <div class="card-sub gray">${entries.length} pesées</div>
  </div>
  <div class="card">
    <div class="card-label">Amplitude</div>
    <div class="card-val">${(stats.max - stats.min).toFixed(1)} <span class="card-unit">kg</span></div>
    <div class="card-sub gray">${stats.min.toFixed(1)} → ${stats.max.toFixed(1)}</div>
  </div>
  <div class="card">
    <div class="card-label">${bmi ? 'IMC' : (goalWeight ? 'Objectif' : 'Max')}</div>
    <div class="card-val">${bmi ? bmi.toFixed(1) : (goalWeight ? goalWeight.toFixed(1) : stats.max.toFixed(1))} <span class="card-unit">${bmi ? '' : 'kg'}</span></div>
    <div class="card-sub ${bmiCat ? (bmiCat.label === 'Normal' ? 'green' : 'red') : 'gray'}">${bmiCat ? bmiCat.label : (goalWeight ? `${(stats.current - goalWeight) > 0 ? '+' : ''}${(stats.current - goalWeight).toFixed(1)} kg restant` : '')}</div>
  </div>
</div>` : ''}

${chartImg ? `
<div class="section">Évolution</div>
<div class="chart"><img src="${chartImg}" alt="Graphique d'évolution" /></div>` : ''}

<div class="section">Historique</div>
<table>
  <thead><tr><th>Date</th><th>Poids</th><th>Variation</th></tr></thead>
  <tbody>
    ${[...entries].reverse().map((e, i, arr) => {
      const prev = arr[i + 1];
      const diff = prev ? e.weight - prev.weight : 0;
      const cls = !prev ? 'gray' : (diff <= 0 ? 'green' : 'red');
      const sym = !prev ? '—' : (diff > 0 ? '↑' : diff < 0 ? '↓' : '→');
      const str = !prev ? '—' : `${sym} ${Math.abs(diff).toFixed(1)} kg`;
      return `<tr><td>${format(parseISO(e.date), "d MMM yyyy", { locale: fr })}</td><td class="w-col">${e.weight.toFixed(1)} kg</td><td class="${cls}">${str}</td></tr>`;
    }).join("")}
  </tbody>
</table>

<div class="foot">
  <p><span class="brand">Suivi de poids</span> — Rapport généré automatiquement</p>
  <p>${timeStr}</p>
</div>

</body></html>`;
}
