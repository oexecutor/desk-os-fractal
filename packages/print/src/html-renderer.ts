import QRCode from "qrcode";
import type { PrintSnapshot } from "./print-snapshot.js";

export interface RenderPrintHtmlOptions {
  /** Token opaco original (não o hash) — só existe em memória no momento da emissão. */
  qrToken: string;
  qrBaseUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function renderQrSvg(url: string): Promise<string> {
  // specs/PHYSICAL_DASHBOARD_FOLDED_WEEKLY.md §6: quiet zone >= 4 módulos,
  // correção de erro M ou superior; SVG inline para impressão offline nítida.
  return QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 4 });
}

/**
 * ADR-0017/CR-001: renderer determinístico da folha A4 retrato dobrável.
 * Zonas em mm exatamente conforme a geometria normativa; Face 2 rotacionada
 * 180°; HTML autossuficiente e offline (QR embutido como SVG inline, sem
 * assets externos).
 */
export async function renderPrintHtml(
  snapshot: PrintSnapshot,
  options: RenderPrintHtmlOptions,
): Promise<string> {
  const qrUrl = `${options.qrBaseUrl.replace(/\/$/, "")}/q/${options.qrToken}`;
  const qrSvg = await renderQrSvg(qrUrl);
  const { face1, face2, layout } = snapshot;

  const face1BlocksHtml = face1.blocks
    .map(
      (b) => `
      <div class="mini-block">
        <div class="mini-block-day">${escapeHtml(b.day_label)}</div>
        <div class="mini-block-title">${escapeHtml(b.title)}</div>
        <div class="mini-block-link">LINK · ${escapeHtml(b.synthesis_title)}</div>
      </div>`,
    )
    .join("");

  const risksHtml = face1.known_risks.length
    ? `<ul class="risks">${face1.known_risks.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>`
    : `<p class="risks-empty">Nenhum risco registrado no planejamento.</p>`;

  const face2DaysHtml = face2.days
    .map(
      (day) => `
      <div class="day-row">
        <div class="day-label">${escapeHtml(day.day_label)}</div>
        <div class="day-block">
          <div class="day-block-title">${escapeHtml(day.block_title)}</div>
          ${day.method_tag ? `<div class="method-tag">${escapeHtml(day.method_tag)}</div>` : ""}
          <div class="actions">
            ${day.actions
              .map(
                (a, i) => `
              <div class="action">
                <span class="box" aria-hidden="true"></span>
                <span class="action-num">A${i + 1}</span>
                <span class="action-title">${escapeHtml(a.title)}</span>
              </div>`,
              )
              .join("")}
          </div>
          <div class="link-row">
            <span class="box" aria-hidden="true"></span>
            <span class="link-label">LINK</span>
            <span class="link-title">${escapeHtml(day.synthesis.title)}</span>
          </div>
        </div>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>DESK-OS · Plano semanal ${escapeHtml(face1.week_label)}</title>
<style>
  :root {
    --bg:#f7f6f3; --paper:#fffefb; --surface:#ffffff; --ink:#14140f; --ink-soft:#5c5b52;
    --line:#e3e1d8; --line-strong:#c9c6b9; --accent:#1f4b3f; --accent-soft:#dce8e2;
    --amber:#b3792c; --amber-soft:#f3e6d2; --clay:#a8492f; --clay-soft:#f2dcd3;
  }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background:#d8d6cf; font-family:-apple-system,"Inter",Arial,sans-serif; color:var(--ink); }
  .toolbar { display:flex; justify-content:flex-end; gap:8px; padding:10px 16px; background:#14140f; }
  .toolbar button { background:white; border:0; padding:8px 14px; font-weight:600; border-radius:3px; cursor:pointer; }
  @media print { .toolbar { display:none; } }

  @page { size: A4 portrait; margin: 0; }
  .sheet {
    width: 210mm; height: 297mm; margin: 12px auto; background: var(--paper);
    display: grid; grid-template-rows: ${layout.zones_mm.top_mechanical}mm ${layout.zones_mm.face1}mm ${layout.zones_mm.middle_mechanical}mm ${layout.zones_mm.face2}mm ${layout.zones_mm.bottom_mechanical}mm;
    box-shadow: 0 10px 40px rgba(0,0,0,.2);
  }
  @media print { .sheet { margin:0; box-shadow:none; } }

  .zone-mechanical { background: repeating-linear-gradient(45deg, var(--line) 0 2px, transparent 2px 8px); }
  .zone-mechanical .fold-label { font: 7pt monospace; color: var(--ink-soft); padding: 2mm; }

  .face { padding: ${layout.safe_margin_mm}mm; overflow: hidden; position: relative; }
  .face2 { transform: rotate(${layout.face2_rotation_deg}deg); }

  .face-header { display:flex; justify-content:space-between; align-items:flex-start; font:7pt monospace; color:var(--ink-soft); margin-bottom:2mm; }
  .identity { font-weight:700; font-size:9pt; color:var(--ink); }

  .dominant-result { font-size:13pt; font-weight:700; line-height:1.15; margin:1mm 0; }
  .dod { font-size:7.5pt; color:var(--ink-soft); margin-bottom:2mm; }
  .contract-line { font:7pt monospace; color:var(--accent); margin-bottom:2mm; }

  .mini-blocks { display:grid; grid-template-columns:repeat(5,1fr); gap:2mm; margin-bottom:2mm; }
  .mini-block { border:1px solid var(--line-strong); padding:1.5mm; font-size:6.3pt; background:var(--surface); }
  .mini-block-day { font:700 6.5pt monospace; color:var(--accent); }
  .mini-block-title { font-weight:600; margin:.5mm 0; line-height:1.2; }
  .mini-block-link { color:var(--amber); font-size:5.8pt; }

  .risks { margin:0; padding-left:4mm; font-size:6.8pt; color:var(--clay); }
  .risks-empty { font-size:6.8pt; color:var(--ink-soft); margin:0; }

  .qr-corner { position:absolute; bottom:${layout.safe_margin_mm}mm; right:${layout.safe_margin_mm}mm; text-align:center; }
  .qr-corner svg { width:25mm; height:25mm; display:block; }
  .qr-corner .qr-caption { font:5.5pt monospace; color:var(--ink-soft); margin-top:1mm; }

  .checksum-line { position:absolute; bottom:${layout.safe_margin_mm}mm; left:${layout.safe_margin_mm}mm; font:5.5pt monospace; color:var(--ink-soft); }

  .day-row { display:grid; grid-template-columns:8mm 1fr; gap:2mm; padding:1.3mm 0; border-bottom:.3mm dashed var(--line-strong); }
  .day-label { font:700 7pt monospace; color:var(--accent); }
  .day-block-title { font-weight:700; font-size:7.6pt; }
  .method-tag { font:5.5pt monospace; color:var(--ink-soft); text-transform:uppercase; }
  .actions { display:flex; gap:3mm; margin-top:.8mm; }
  .action { display:flex; align-items:center; gap:1mm; font-size:6.2pt; }
  .action-num { color:var(--ink-soft); font:6pt monospace; }
  .link-row { display:flex; align-items:center; gap:1mm; margin-top:.8mm; font-size:6.4pt; color:var(--amber); }
  .box { width:2.6mm; height:2.6mm; border:.3mm solid var(--line-strong); display:inline-block; background:white; }

  .face2-footer { display:flex; justify-content:space-between; margin-top:2mm; font-size:6.4pt; }
  .recycle-options, .closeout-fields { display:flex; gap:2mm; flex-wrap:wrap; }
  .recycle-options span, .closeout-fields span { display:flex; align-items:center; gap:1mm; }
</style>
</head>
<body>
<div class="toolbar"><button onclick="window.print()">Imprimir / PDF</button></div>
<main class="sheet">
  <div class="zone-mechanical"><div class="fold-label">DESK-OS · dobra 1</div></div>

  <section class="face face1">
    <div class="face-header">
      <div>
        <div class="identity">DESK-OS / TAL</div>
        <div>${escapeHtml(face1.user_label)} · ${face1.context_trail.map(escapeHtml).join(" › ")}</div>
      </div>
      <div style="text-align:right">
        FACE 1 · VISÃO/CONTRATO<br>${escapeHtml(face1.week_label)} · ${escapeHtml(face1.date_range)}
      </div>
    </div>
    <div class="dominant-result">${escapeHtml(face1.dominant_result)}</div>
    <div class="dod"><strong>Definition of done:</strong> ${escapeHtml(face1.definition_of_done)}</div>
    <div class="contract-line">CONTRATO: ${face1.weekly_contract.blocks} blocos · ${face1.weekly_contract.actions} ações · ${face1.weekly_contract.syntheses} LINKS</div>
    <div class="mini-blocks">${face1BlocksHtml}</div>
    ${risksHtml}
    <div class="qr-corner">${qrSvg}<div class="qr-caption">OPEN_CURRENT_ACTION</div></div>
    <div class="checksum-line">v${escapeHtml(snapshot.schema_version)} · ${escapeHtml(snapshot.created_at)} · ${escapeHtml(snapshot.checksum)}</div>
  </section>

  <div class="zone-mechanical"><div class="fold-label">DESK-OS · dobra 2</div></div>

  <section class="face face2">
    <div class="face-header">
      <div><div class="identity">${escapeHtml(face2.project_label)}</div>FACE 2 · EXECUÇÃO SEMANAL</div>
      <div style="text-align:right">${escapeHtml(face2.week_label)}</div>
    </div>
    ${face2DaysHtml}
    <div class="face2-footer">
      <div class="recycle-options">RECYCLE:${face2.recycle_options.map((o) => ` <span><span class="box"></span>${o}</span>`).join("")}</div>
      <div class="closeout-fields">FECHAMENTO:${face2.closeout_fields.map((f) => ` <span><span class="box"></span>${f}</span>`).join("")}</div>
    </div>
    <div class="qr-corner">${qrSvg}<div class="qr-caption">OPEN_CURRENT_ACTION</div></div>
  </section>

  <div class="zone-mechanical"><div class="fold-label">DESK-OS · aba mecânica</div></div>
</main>
</body>
</html>`;
}
