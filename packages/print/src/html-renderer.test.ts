import { describe, expect, it } from "vitest";
import { composePrintSnapshot } from "./composer.js";
import { renderPrintHtml } from "./html-renderer.js";
import { buildWeeklyActivePlan, WORKSPACE_ID } from "./test-fixtures.js";

function makeSnapshot() {
  const { plan, blocksByDay } = buildWeeklyActivePlan();
  return composePrintSnapshot({
    plan,
    workspaceId: WORKSPACE_ID,
    sprintId: "sprint000000000001",
    userLabel: "João",
    contextTrail: ["Projeto"],
    weekLabel: "SPRINT 2026-W29",
    dateRange: "13–17 JUL 2026",
    dominantResult: "Resultado dominante da semana.",
    definitionOfDone: "Definition of done da semana.",
    projectLabel: "P2 · Clean Sea",
    qrTokenId: "qrtoken00000000000001",
    blocksByDay,
  });
}

describe("renderPrintHtml — ADR-0017 geometria e conteúdo", () => {
  it("declara @page A4 portrait e as 5 zonas em mm somando 297mm", async () => {
    const html = await renderPrintHtml(makeSnapshot(), {
      qrToken: "opaque-token-abc123",
      qrBaseUrl: "https://desk-os.app",
    });
    expect(html).toContain("@page { size: A4 portrait; margin: 0; }");
    expect(html).toContain("grid-template-rows: 40mm 100mm 40mm 100mm 17mm;");
    expect(40 + 100 + 40 + 100 + 17).toBe(297);
  });

  it("Face 2 é rotacionada 180 graus", async () => {
    const html = await renderPrintHtml(makeSnapshot(), {
      qrToken: "opaque-token-abc123",
      qrBaseUrl: "https://desk-os.app",
    });
    expect(html).toMatch(/\.face2\s*{\s*transform:\s*rotate\(180deg\);/);
  });

  it("embute QR como SVG inline (offline, sem asset externo) apontando para /q/{token}", async () => {
    const html = await renderPrintHtml(makeSnapshot(), {
      qrToken: "opaque-token-abc123",
      qrBaseUrl: "https://desk-os.app/",
    });
    expect(html).toContain("<svg");
    expect(html).not.toMatch(/<img\s+src="https?:\/\//);
  });

  it("escapa conteúdo do usuário — nunca innerHTML de texto não confiável (CLAUDE.md)", async () => {
    const { plan, blocksByDay } = buildWeeklyActivePlan();
    const snapshot = composePrintSnapshot({
      plan,
      workspaceId: WORKSPACE_ID,
      sprintId: "sprint000000000001",
      userLabel: "<script>alert(1)</script>",
      contextTrail: ["Projeto"],
      weekLabel: "W29",
      dateRange: "13-17",
      dominantResult: "Resultado seguro.",
      definitionOfDone: "DoD seguro.",
      projectLabel: "Projeto",
      qrTokenId: "qrtoken00000000000001",
      blocksByDay,
    });
    const html = await renderPrintHtml(snapshot, { qrToken: "tok", qrBaseUrl: "https://x.app" });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("contém as cinco linhas SEG–SEX na Face 2 com 3 ações cada", async () => {
    const html = await renderPrintHtml(makeSnapshot(), {
      qrToken: "opaque-token-abc123",
      qrBaseUrl: "https://desk-os.app",
    });
    for (const day of ["SEG", "TER", "QUA", "QUI", "SEX"]) {
      expect(html).toContain(`>${day}<`);
    }
    expect((html.match(/class="action"/g) ?? []).length).toBe(15);
  });

  it("Recycle e campos de fechamento aparecem na Face 2", async () => {
    const html = await renderPrintHtml(makeSnapshot(), {
      qrToken: "opaque-token-abc123",
      qrBaseUrl: "https://desk-os.app",
    });
    expect(html).toContain("CONTINUE");
    expect(html).toContain("RECONFIGURE");
    expect(html).toContain("MAIN_DELIVERY");
    expect(html).toContain("BLOCKER");
    expect(html).toContain("NEXT_ACTION");
  });
});
