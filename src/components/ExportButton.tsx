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
        const opacity = computed.getPropertyValue("opacity");
        if (fill && fill !== "none") (el as SVGElement).style.fill = fill;
        if (stroke && stroke !== "none") (el as SVGElement).style.stroke = stroke;
        if (opacity) (el as SVGElement).style.opacity = opacity;
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
    // Open window synchronously to avoid popup blocker
    const win = window.open("", "_blank");
    if (!win) {
      toast({ title: "Popup bloqué", description: "Autorisez les popups pour exporter.", variant: "destructive" });
      return;
    }

    win.document.write(`<html><head><title>Chargement...</title><style>
      body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa}
      .l{text-align:center;color:#0d9488}
      .s{width:28px;height:28px;border:3px solid #e5e7eb;border-top-color:#0d9488;border-radius:50%;animation:r 0.6s linear infinite;margin:0 auto 12px}
      @keyframes r{to{transform:rotate(360deg)}}
    </style></head><body><div class="l"><div class="s"></div><p style="font-size:13px;font-weight:500">Génération du rapport...</p></div></body></html>`);

    captureChart(chartRef).then((chartImg) => {
      const stats = getStats(entries);
      const bmi = stats && height ? calculateBMI(stats.current, height) : null;
      const bmiCat = bmi ? getBMICategory(bmi) : null;

      win.document.open();
      win.document.write(buildPDFHtml(entries, stats, bmi, bmiCat, goalWeight, chartImg));
      win.document.close();
      setTimeout(() => win.print(), 400);
    });

    toast({ title: "Rapport en préparation..." });
  };

  if (entries.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" aria-label="Exporter">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl">
        <DropdownMenuItem onClick={handleCSV} className="gap-2.5 rounded-lg">
          <Table2 className="h-4 w-4 text-muted-foreground" />
          Exporter CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePDF} className="gap-2.5 rounded-lg">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Imprimer / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function buildPDFHtml(
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',-apple-system,sans-serif;color:#0f172a;background:#fff;max-width:700px;margin:0 auto;padding:44px 48px}

  .header{display:flex;align-items:center;gap:18px;margin-bottom:36px;padding-bottom:28px;border-bottom:3px solid #0d9488}
  .logo-box{width:48px;height:48px;background:linear-gradient(135deg,#0d9488,#14b8a6);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(13,148,136,0.25)}
  .logo-box svg{width:24px;height:24px;stroke:white;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .header h1{font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.3px}
  .header p{font-size:12px;color:#64748b;margin-top:3px;font-weight:500}

  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px}
  .stat-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px 18px}
  .stat-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:6px}
  .stat-value{font-size:24px;font-weight:900;color:#0f172a;letter-spacing:-0.5px}
  .stat-unit{font-size:11px;font-weight:600;color:#94a3b8}
  .stat-sub{font-size:10px;font-weight:700;margin-top:5px}
  .green{color:#0d9488} .red{color:#ef4444} .gray{color:#94a3b8}

  .section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#0d9488;margin:32px 0 16px;display:flex;align-items:center;gap:12px}
  .section-title::after{content:'';flex:1;height:1px;background:#e2e8f0}

  .chart-box{margin-bottom:32px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;overflow:hidden}
  .chart-box img{width:100%;display:block;border-radius:10px}

  table{width:100%;border-collapse:separate;border-spacing:0;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;font-size:12px}
  thead{background:linear-gradient(135deg,#0d9488,#14b8a6)}
  th{color:white;padding:12px 18px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;text-align:left}
  td{padding:11px 18px;border-bottom:1px solid #f1f5f9}
  tr:nth-child(even){background:#f8fafc}
  tr:last-child td{border-bottom:none}
  .w-col{font-weight:800;color:#0f172a}

  .footer{margin-top:36px;padding-top:18px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
  .footer p{font-size:9px;color:#94a3b8;font-weight:500}
  .footer .brand{color:#0d9488;font-weight:800}

  @media print{body{padding:20px 24px;max-width:none}table{page-break-inside:auto}tr{page-break-inside:avoid}.chart-box{break-inside:avoid}}
</style></head><body>

<div class="header">
  <div class="logo-box">
    <svg viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
  </div>
  <div>
    <h1>Suivi de poids</h1>
    <p>Rapport du ${dateStr} — ${entries.length} pesée${entries.length !== 1 ? "s" : ""}</p>
  </div>
</div>

${stats ? `
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-label">Actuel</div>
    <div class="stat-value">${stats.current.toFixed(1)} <span class="stat-unit">kg</span></div>
    <div class="stat-sub ${stats.diff <= 0 ? 'green' : 'red'}">${stats.diff > 0 ? '+' : ''}${stats.diff.toFixed(1)} kg</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Moyenne</div>
    <div class="stat-value">${stats.avg.toFixed(1)} <span class="stat-unit">kg</span></div>
    <div class="stat-sub gray">${entries.length} pesées</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Amplitude</div>
    <div class="stat-value">${(stats.max - stats.min).toFixed(1)} <span class="stat-unit">kg</span></div>
    <div class="stat-sub gray">${stats.min.toFixed(1)} → ${stats.max.toFixed(1)}</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">${bmi ? 'IMC' : (goalWeight ? 'Objectif' : 'Max')}</div>
    <div class="stat-value">${bmi ? bmi.toFixed(1) : (goalWeight ? goalWeight.toFixed(1) : stats.max.toFixed(1))} <span class="stat-unit">${bmi ? '' : 'kg'}</span></div>
    <div class="stat-sub ${bmiCat ? (bmiCat.label === 'Normal' ? 'green' : 'red') : 'gray'}">${bmiCat ? bmiCat.label : (goalWeight ? `${(stats.current - goalWeight) > 0 ? '+' : ''}${(stats.current - goalWeight).toFixed(1)} kg restant` : '')}</div>
  </div>
</div>` : ''}

${chartImg ? `
<div class="section-title">Évolution</div>
<div class="chart-box"><img src="${chartImg}" alt="Graphique d'évolution du poids" /></div>` : ''}

<div class="section-title">Historique complet</div>
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

<div class="footer">
  <p><span class="brand">Suivi de poids</span> — Rapport généré automatiquement</p>
  <p>${timeStr}</p>
</div>

</body></html>`;
}
