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
    const win = window.open("", "_blank");
    if (!win) {
      toast({ title: "Popup bloqué", description: "Autorisez les popups pour exporter.", variant: "destructive" });
      return;
    }

    win.document.write(`<html><head><title>Chargement...</title><style>
      body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f7ff}
      .l{text-align:center;color:#6d5cff}
      .s{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#6d5cff;border-radius:50%;animation:r 0.6s linear infinite;margin:0 auto 12px}
      @keyframes r{to{transform:rotate(360deg)}}
    </style></head><body><div class="l"><div class="s"></div><p style="font-size:13px;font-weight:600">Génération du rapport...</p></div></body></html>`);

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
        <Button variant="ghost" size="icon" className="shrink-0 rounded-2xl h-10 w-10 hover:bg-accent" aria-label="Exporter">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] rounded-2xl">
        <DropdownMenuItem onClick={handleCSV} className="gap-2.5 rounded-xl">
          <Table2 className="h-4 w-4 text-muted-foreground" />
          Exporter CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePDF} className="gap-2.5 rounded-xl">
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
<html lang="fr"><head><meta charset="utf-8"><title>WeightTrack — Rapport</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',-apple-system,sans-serif;color:#1a1a2e;background:#fff;max-width:700px;margin:0 auto;padding:48px}

  .header{display:flex;align-items:center;gap:20px;margin-bottom:40px;padding-bottom:28px;border-bottom:3px solid #7c5cff}
  .logo-box{width:52px;height:52px;background:linear-gradient(135deg,#7c5cff,#a78bfa);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 8px 24px rgba(124,92,255,0.35)}
  .logo-box svg{width:24px;height:24px;stroke:white;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .header h1{font-size:24px;font-weight:900;color:#1a1a2e;letter-spacing:-0.5px}
  .header p{font-size:12px;color:#6b7280;margin-top:4px;font-weight:500}

  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:36px}
  .stat-card{background:#f8f7ff;border:1px solid #e8e6ff;border-radius:16px;padding:18px}
  .stat-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:8px}
  .stat-value{font-size:26px;font-weight:900;color:#1a1a2e;letter-spacing:-0.5px}
  .stat-unit{font-size:11px;font-weight:600;color:#9ca3af}
  .stat-sub{font-size:10px;font-weight:700;margin-top:6px}
  .green{color:#22c55e} .red{color:#ef4444} .gray{color:#9ca3af}

  .section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#7c5cff;margin:36px 0 18px;display:flex;align-items:center;gap:14px}
  .section-title::after{content:'';flex:1;height:1px;background:#e8e6ff}

  .chart-box{margin-bottom:36px;background:#f8f7ff;border:1px solid #e8e6ff;border-radius:20px;padding:24px;overflow:hidden}
  .chart-box img{width:100%;display:block;border-radius:12px}

  table{width:100%;border-collapse:separate;border-spacing:0;border-radius:16px;overflow:hidden;border:1px solid #e8e6ff;font-size:12px}
  thead{background:linear-gradient(135deg,#7c5cff,#a78bfa)}
  th{color:white;padding:14px 20px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;text-align:left}
  td{padding:12px 20px;border-bottom:1px solid #f3f4f6}
  tr:nth-child(even){background:#faf9ff}
  tr:last-child td{border-bottom:none}
  .w-col{font-weight:800;color:#1a1a2e}

  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e8e6ff;display:flex;justify-content:space-between;align-items:center}
  .footer p{font-size:9px;color:#9ca3af;font-weight:500}
  .footer .brand{color:#7c5cff;font-weight:900}

  @media print{body{padding:20px 24px;max-width:none;-webkit-print-color-adjust:exact;print-color-adjust:exact}table{page-break-inside:auto}tr{page-break-inside:avoid}.chart-box{break-inside:avoid}}
</style></head><body>

<div class="header">
  <div class="logo-box">
    <svg viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
  </div>
  <div>
    <h1>WeightTrack</h1>
    <p>Rapport du ${dateStr} · ${entries.length} pesée${entries.length !== 1 ? "s" : ""}</p>
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
<div class="chart-box"><img src="${chartImg}" alt="Graphique" /></div>` : ''}

<div class="section-title">Historique</div>
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
  <p><span class="brand">WeightTrack</span> · Rapport généré automatiquement</p>
  <p>${timeStr}</p>
</div>

</body></html>`;
}
