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
    
    // Inline computed styles for export
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
    // Open window SYNCHRONOUSLY to avoid popup blocker
    const win = window.open("", "_blank");
    if (!win) {
      toast({ title: "Popup bloqué", description: "Autorisez les popups pour exporter en PDF.", variant: "destructive" });
      return;
    }

    // Show loading state
    win.document.write(`<html><head><title>Chargement...</title><style>
      body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fffe}
      .loader{text-align:center;color:#0d9488}
      .spinner{width:40px;height:40px;border:3px solid #e0f2f1;border-top-color:#0d9488;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px}
      @keyframes spin{to{transform:rotate(360deg)}}
    </style></head><body><div class="loader"><div class="spinner"></div><p>Préparation du rapport...</p></div></body></html>`);

    // Capture chart asynchronously then write content
    captureChart(chartRef).then((chartDataUrl) => {
      const stats = getStats(entries);
      const bmi = stats && height ? calculateBMI(stats.current, height) : null;
      const bmiCat = bmi ? getBMICategory(bmi) : null;

      const content = buildPDFContent(entries, stats, bmi, bmiCat, goalWeight, chartDataUrl);
      win.document.open();
      win.document.write(content);
      win.document.close();
      setTimeout(() => win.print(), 600);
    });

    toast({ title: "Impression PDF lancée !" });
  };

  if (entries.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" aria-label="Exporter">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem onClick={handleCSV} className="gap-2">
          <Table2 className="h-4 w-4 text-muted-foreground" />
          Exporter en CSV
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

function buildPDFContent(
  entries: WeightEntry[],
  stats: ReturnType<typeof getStats>,
  bmi: number | null,
  bmiCat: { label: string; color: string } | null,
  goalWeight: number | undefined,
  chartDataUrl: string
) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Suivi de poids — Rapport</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Plus Jakarta Sans',-apple-system,sans-serif;padding:48px;color:#1a2b2f;background:#fff;max-width:800px;margin:0 auto}
  
  .header{display:flex;align-items:center;gap:20px;margin-bottom:36px;padding-bottom:28px;border-bottom:3px solid #0d9488}
  .logo{width:52px;height:52px;background:linear-gradient(135deg,#0d9488,#14b8a6);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .logo svg{width:26px;height:26px;stroke:white;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .header h1{font-size:24px;font-weight:800;color:#0f2b2f;letter-spacing:-0.5px}
  .header p{font-size:13px;color:#6b8a8e;font-weight:500;margin-top:3px}

  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px}
  .stat{background:linear-gradient(135deg,#f0fdfa,#e6fffa);border:1px solid #b2f5ea;border-radius:14px;padding:16px 18px}
  .stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#6b8a8e;margin-bottom:6px}
  .stat-val{font-size:22px;font-weight:800;color:#0f2b2f;line-height:1}
  .stat-unit{font-size:12px;font-weight:500;color:#6b8a8e;margin-left:2px}
  .stat-sub{font-size:11px;font-weight:700;margin-top:6px;display:inline-block;padding:2px 8px;border-radius:20px}
  .sub-up{color:#059669;background:#d1fae5}
  .sub-down{color:#dc2626;background:#fee2e2}
  .sub-neutral{color:#6b8a8e;background:#f0fdfa}

  .section{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0d9488;margin-bottom:18px;display:flex;align-items:center;gap:10px}
  .section::after{content:'';flex:1;height:2px;background:linear-gradient(to right,#b2f5ea,transparent)}

  .chart-box{margin-bottom:32px;background:#fafffe;border:1px solid #e0f2f1;border-radius:18px;padding:24px;box-shadow:0 2px 8px rgba(13,148,136,0.06)}
  .chart-box img{width:100%;border-radius:10px;display:block}

  table{width:100%;border-collapse:separate;border-spacing:0;border-radius:14px;overflow:hidden;border:1px solid #e0f2f1;box-shadow:0 2px 8px rgba(13,148,136,0.04)}
  thead th{background:linear-gradient(135deg,#0d9488,#0f766e);color:white;padding:14px 18px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;text-align:left}
  tbody tr:nth-child(even){background:#f0fdfa}
  tbody tr:hover{background:#e6fffa}
  tbody td{padding:12px 18px;font-size:13px;border-bottom:1px solid #e0f2f1}
  td:first-child{font-weight:500;color:#6b8a8e;white-space:nowrap}
  td:nth-child(2){font-weight:800;color:#0f2b2f;font-size:14px}
  td:nth-child(3){font-weight:700;font-size:12px}
  .up{color:#059669}.down{color:#dc2626}.neutral{color:#94a3b8}

  .footer{margin-top:36px;padding-top:20px;border-top:2px solid #e0f2f1;display:flex;justify-content:space-between;align-items:center}
  .footer p{font-size:10px;color:#9cb3b6;font-weight:500}
  .footer .brand{color:#0d9488;font-weight:700}

  @media print{body{padding:24px}table{page-break-inside:auto}tr{page-break-inside:avoid}}
</style></head><body>

<div class="header">
  <div class="logo">
    <svg viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
  </div>
  <div>
    <h1>Suivi de poids</h1>
    <p>Rapport du ${format(new Date(), "d MMMM yyyy", { locale: fr })} · ${entries.length} entrée${entries.length !== 1 ? "s" : ""} enregistrée${entries.length !== 1 ? "s" : ""}</p>
  </div>
</div>

${stats ? `
<div class="stats">
  <div class="stat">
    <div class="stat-label">Poids actuel</div>
    <div class="stat-val">${stats.current.toFixed(1)}<span class="stat-unit">kg</span></div>
    <div class="stat-sub ${stats.diff <= 0 ? 'sub-up' : 'sub-down'}">${stats.diff > 0 ? '↑' : '↓'} ${Math.abs(stats.diff).toFixed(1)} kg</div>
  </div>
  <div class="stat">
    <div class="stat-label">Moyenne</div>
    <div class="stat-val">${stats.avg.toFixed(1)}<span class="stat-unit">kg</span></div>
    <div class="stat-sub sub-neutral">sur ${entries.length} pesées</div>
  </div>
  <div class="stat">
    <div class="stat-label">Amplitude</div>
    <div class="stat-val">${stats.min.toFixed(1)}<span class="stat-unit">→ ${stats.max.toFixed(1)}</span></div>
    <div class="stat-sub sub-neutral">Δ ${(stats.max - stats.min).toFixed(1)} kg</div>
  </div>
  <div class="stat">
    <div class="stat-label">${bmi ? 'IMC' : (goalWeight ? 'Objectif' : 'Écart')}</div>
    <div class="stat-val">${bmi ? bmi.toFixed(1) : (goalWeight ? goalWeight.toFixed(1) : (stats.max - stats.min).toFixed(1))}<span class="stat-unit">${bmi ? '' : 'kg'}</span></div>
    <div class="stat-sub ${bmiCat ? (bmiCat.label === 'Normal' ? 'sub-up' : 'sub-down') : 'sub-neutral'}">${bmiCat ? bmiCat.label : (goalWeight ? `${(stats.current - goalWeight) > 0 ? '+' : ''}${(stats.current - goalWeight).toFixed(1)} kg` : 'total')}</div>
  </div>
</div>` : ''}

${chartDataUrl ? `
<div class="section">Évolution</div>
<div class="chart-box"><img src="${chartDataUrl}" alt="Graphique" /></div>` : ''}

<div class="section">Historique détaillé</div>
<table>
  <thead><tr><th>Date</th><th>Poids</th><th>Variation</th></tr></thead>
  <tbody>
    ${[...entries].reverse().map((e, i, arr) => {
      const prev = arr[i + 1];
      const diff = prev ? e.weight - prev.weight : 0;
      const cls = i === arr.length - 1 ? 'neutral' : (diff <= 0 ? 'up' : 'down');
      const sym = i === arr.length - 1 ? '—' : (diff > 0 ? '↑' : diff < 0 ? '↓' : '→');
      const str = i === arr.length - 1 ? '—' : `${sym} ${Math.abs(diff).toFixed(1)} kg`;
      return `<tr><td>${format(parseISO(e.date), "d MMM yyyy", { locale: fr })}</td><td>${e.weight.toFixed(1)} kg</td><td class="${cls}">${str}</td></tr>`;
    }).join("")}
  </tbody>
</table>

<div class="footer">
  <p><span class="brand">Suivi de poids</span> · Rapport généré automatiquement</p>
  <p>${format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}</p>
</div>

</body></html>`;
}
