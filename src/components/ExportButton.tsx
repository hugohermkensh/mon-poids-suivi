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
      // Carbon background to match the cyber-athletic theme
      ctx.fillStyle = "#0a0a0a";
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
    link.download = `masse-raw-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV terminé" });
  };

  const handlePDF = () => {
    const win = window.open("", "_blank");
    if (!win) {
      toast({ title: "Popup bloqué", description: "Autorisez les popups pour exporter.", variant: "destructive" });
      return;
    }

    win.document.write(`<html><head><title>MASSE.RAW · Génération...</title><style>
      body{font-family:'JetBrains Mono',monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#030303;color:#ccff00}
      .l{text-align:center}
      .s{width:24px;height:24px;border:2px solid #222;border-top-color:#ccff00;animation:r 0.6s linear infinite;margin:0 auto 16px}
      @keyframes r{to{transform:rotate(360deg)}}
      p{font-size:10px;text-transform:uppercase;letter-spacing:0.3em;margin:0}
    </style></head><body><div class="l"><div class="s"></div><p>▸ Génération du rapport...</p></div></body></html>`);

    captureChart(chartRef).then((chartImg) => {
      const stats = getStats(entries);
      const bmi = stats && height ? calculateBMI(stats.current, height) : null;
      const bmiCat = bmi ? getBMICategory(bmi) : null;

      win.document.open();
      win.document.write(buildPDFHtml(entries, stats, bmi, bmiCat, goalWeight, chartImg));
      win.document.close();
      setTimeout(() => win.print(), 500);
    });

    toast({ title: "Compilation du rapport..." });
  };

  if (entries.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-none h-8 w-8 hover:bg-secondary hover:text-primary" aria-label="Exporter">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] rounded-none border-primary/30 bg-card font-mono">
        <DropdownMenuItem onClick={handleCSV} className="gap-2.5 rounded-none text-xs uppercase tracking-widest focus:bg-secondary focus:text-primary">
          <Table2 className="h-3.5 w-3.5" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={handlePDF} className="gap-2.5 rounded-none text-xs uppercase tracking-widest focus:bg-secondary focus:text-primary">
          <FileText className="h-3.5 w-3.5" />
          Export PDF
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
  const dateStr = format(new Date(), "dd MMM yyyy", { locale: fr }).toUpperCase();
  const timeStr = format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr });

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>MASSE.RAW · Rapport ${dateStr}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Chakra Petch',-apple-system,sans-serif;color:#fff;background:#030303;max-width:720px;margin:0 auto;padding:48px 40px;min-height:100vh}
  .mono{font-family:'JetBrains Mono',monospace}

  .header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;padding-bottom:18px;border-bottom:2px solid #ccff00}
  .brand-tag{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.3em;color:#00f3ff;font-weight:700;margin-bottom:6px}
  .brand-name{font-size:28px;font-weight:700;text-transform:uppercase;letter-spacing:-0.5px;line-height:1}
  .brand-name .dot{color:#ccff00}
  .meta{text-align:right;font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;color:#888}
  .meta strong{color:#ccff00;font-weight:700;display:block;font-size:11px;margin-top:4px}

  .section-label{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.3em;color:#888;margin:28px 0 12px;display:flex;align-items:center;gap:10px}
  .section-label::before{content:'▸';color:#ccff00}
  .section-label::after{content:'';flex:1;height:1px;background:#222}

  .hero{background:#0a0a0a;border-left:3px solid #ccff00;padding:24px;position:relative;overflow:hidden;box-shadow:inset 0 0 30px rgba(0,0,0,0.5)}
  .hero-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
  .hero-label{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#888}
  .hero-status{font-family:'JetBrains Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;padding:2px 8px;border:1px solid;display:inline-block}
  .status-up{color:#ccff00;background:rgba(204,255,0,0.1);border-color:rgba(204,255,0,0.3)}
  .status-down{color:#ff2a2a;background:rgba(255,42,42,0.1);border-color:rgba(255,42,42,0.3)}
  .hero-value{font-family:'JetBrains Mono',monospace;font-size:64px;font-weight:800;letter-spacing:-2px;line-height:1;margin:8px 0 20px;display:flex;align-items:baseline;gap:10px}
  .hero-value .unit{font-size:18px;color:#ccff00;font-weight:700;letter-spacing:3px}

  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid #222;padding-top:18px}
  .cell{padding:0 16px;border-right:1px solid #222}
  .cell:first-child{padding-left:0}
  .cell:last-child{padding-right:0;border-right:none}
  .cell-label{font-family:'JetBrains Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:0.2em;color:#888;margin-bottom:6px}
  .cell-value{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;letter-spacing:-0.5px;color:#fff}
  .cell-value.lime{color:#ccff00}
  .cell-value.red{color:#ff2a2a}
  .cell-sub{font-family:'JetBrains Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:0.2em;color:#666;margin-top:4px}

  .chart-box{background:#0a0a0a;border:1px solid #222;padding:16px;margin-bottom:16px}
  .chart-box img{width:100%;display:block}

  table{width:100%;border-collapse:collapse;font-family:'JetBrains Mono',monospace;font-size:11px;background:#0a0a0a;border:1px solid #222}
  thead{background:#141414;border-bottom:2px solid #ccff00}
  th{color:#ccff00;padding:10px 16px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;text-align:left}
  th.right{text-align:right}
  td{padding:9px 16px;border-bottom:1px solid #1a1a1a;color:#ddd}
  td.right{text-align:right;font-weight:700;color:#fff}
  td.delta-up{color:#ccff00;font-weight:700}
  td.delta-down{color:#ff2a2a;font-weight:700}
  td.delta-zero{color:#666}
  tr:last-child td{border-bottom:none}

  .footer{margin-top:36px;padding-top:18px;border-top:1px solid #222;display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:0.3em;color:#555}
  .footer .brand{color:#ccff00;font-weight:700}

  @media print{
    body{padding:24px 28px;max-width:none;background:#030303;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    table{page-break-inside:auto}
    tr{page-break-inside:avoid}
    .chart-box{break-inside:avoid}
    .hero{break-inside:avoid}
  }
</style></head><body>

<div class="header">
  <div>
    <div class="brand-tag">▸ Télémétrie Corporelle</div>
    <h1 class="brand-name">MASSE<span class="dot">.</span>RAW</h1>
  </div>
  <div class="meta">
    Rapport ${dateStr}<br>
    <strong>${entries.length.toString().padStart(3, "0")} ENTRÉES</strong>
  </div>
</div>

${stats ? `
<div class="hero">
  <div class="hero-row">
    <div class="hero-label">Poids Actuel</div>
    <span class="hero-status ${stats.diff <= 0 ? 'status-up' : 'status-down'}">${stats.diff <= 0 ? 'OPTIMAL' : 'HAUSSE'}</span>
  </div>
  <div class="hero-value">${stats.current.toFixed(1)} <span class="unit">KG</span></div>
  <div class="grid">
    <div class="cell">
      <div class="cell-label">Delta</div>
      <div class="cell-value ${stats.diff <= 0 ? 'lime' : 'red'}">${stats.diff > 0 ? '+' : ''}${stats.diff.toFixed(1)}</div>
      <div class="cell-sub">KG</div>
    </div>
    <div class="cell">
      <div class="cell-label">Moyenne</div>
      <div class="cell-value">${stats.avg.toFixed(1)}</div>
      <div class="cell-sub">KG</div>
    </div>
    <div class="cell">
      <div class="cell-label">Amplitude</div>
      <div class="cell-value">${(stats.max - stats.min).toFixed(1)}</div>
      <div class="cell-sub">${stats.min.toFixed(1)} → ${stats.max.toFixed(1)}</div>
    </div>
    <div class="cell">
      <div class="cell-label">${bmi ? 'IMC' : (goalWeight ? 'Cible' : 'Max')}</div>
      <div class="cell-value ${bmiCat?.label === 'Normal' ? 'lime' : ''}">${bmi ? bmi.toFixed(1) : (goalWeight ? goalWeight.toFixed(1) : stats.max.toFixed(1))}</div>
      <div class="cell-sub">${bmiCat ? bmiCat.label : (goalWeight ? `${(stats.current - goalWeight) > 0 ? '+' : ''}${(stats.current - goalWeight).toFixed(1)} restant` : 'KG')}</div>
    </div>
  </div>
</div>` : ''}

${chartImg ? `
<div class="section-label">Volume de Masse</div>
<div class="chart-box"><img src="${chartImg}" alt="Graphique" /></div>` : ''}

<div class="section-label">Registre Brut</div>
<table>
  <thead><tr><th>Date</th><th class="right">Poids</th><th class="right">Delta</th></tr></thead>
  <tbody>
    ${[...entries].reverse().map((e, i, arr) => {
      const prev = arr[i + 1];
      const diff = prev ? e.weight - prev.weight : 0;
      const cls = !prev ? 'delta-zero' : (diff <= 0 ? 'delta-up' : 'delta-down');
      const str = !prev ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;
      return `<tr><td>${format(parseISO(e.date), "dd MMM yyyy", { locale: fr }).toUpperCase()}</td><td class="right">${e.weight.toFixed(1)} KG</td><td class="right ${cls}">${str}</td></tr>`;
    }).join("")}
  </tbody>
</table>

<div class="footer">
  <span><span class="brand">MASSE.RAW</span> · Rapport généré automatiquement</span>
  <span>${timeStr}</span>
</div>

</body></html>`;
}
