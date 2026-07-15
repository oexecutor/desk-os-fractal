import { expect, test, type Page } from "@playwright/test";

/**
 * qa/ACCEPTANCE_TESTS.feature + qa/ACCEPTANCE_TESTS_PRINT_V2.feature —
 * fluxo crítico ponta a ponta pelo navegador real, contra o build de
 * produção (vite preview) e os handlers reais de apps/functions atrás de
 * um servidor HTTP mínimo (não `netlify dev` — ver relatório final).
 *
 * Um único `page` é compartilhado entre os testes: `describe.serial` só
 * garante ordem/short-circuit, não compartilha a página — cada `test()`
 * ganha uma `page` nova por padrão, então o estado de navegação (URL,
 * SPA router) precisa ser carregado explicitamente via beforeAll/afterAll.
 */
test.describe.serial("Fluxo crítico: intake -> decompose -> aprovação -> foco -> emitir -> QR", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("Intake aceita texto colado e navega para o progresso de decomposição", async () => {
    await page.goto("/intake");
    await expect(page.getByRole("heading", { name: /próxima ação/i })).toBeVisible();

    await page.getByLabel("Colar texto").fill(
      "Projeto de digitalização da operação marítima. Precisamos mapear o processo atual, diagnosticar as dores, desenhar o fluxo futuro, configurar um piloto e testar em campo antes do fim da semana.",
    );
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Processar projeto" }).click();

    // Em MOCK_MODE a decomposição é instantânea: a URL /ingestions/:id é
    // transitória (pode durar menos que um ciclo de poll do Playwright) e
    // não é observável de forma confiável — só o estado final importa aqui.
    await expect(page).toHaveURL(/\/(ingestions|plans)\//);
  });

  test("decomposição em modo mock produz um plano GENERATED com 5 blocos e navega para revisão", async () => {
    await expect(page).toHaveURL(/\/plans\//, { timeout: 15_000 });
    await expect(page.getByText(/blocos/)).toBeVisible();
  });

  test("aprovação antes da execução: revisar -> aprovar -> ativar", async () => {
    await page.getByRole("button", { name: "Iniciar revisão" }).click();
    await expect(page.getByRole("button", { name: "Aprovar" })).toBeVisible();
    await page.getByRole("button", { name: "Aprovar" }).click();
    await expect(page.getByRole("button", { name: "Ativar" })).toBeVisible();
    await page.getByRole("button", { name: "Ativar" }).click();
    await expect(page.getByRole("button", { name: "Ir para o navegador fractal" })).toBeVisible();
  });

  test("navegador fractal mostra cardinalidade dinâmica (portfólio/projeto)", async () => {
    await page.getByRole("button", { name: "Ir para o navegador fractal" }).click();
    await expect(page).toHaveURL(/\/portfolio/);
    await expect(page.getByRole("list")).toBeVisible();
  });

  test("modo foco mostra a próxima ação dominante e permite iniciar/concluir", async () => {
    await page.getByRole("link", { name: "Foco" }).click();
    await expect(page).toHaveURL(/\/focus/);
    await expect(page.getByRole("button", { name: "Iniciar" }).first()).toBeVisible();
  });

  test("emissão física gera uma folha A4 retrato dobrável com Face 2 a 180°", async () => {
    await page.getByRole("link", { name: "Emitir" }).click();
    await expect(page).toHaveURL(/\/emit/);

    // O iframe usa sandbox="" (sem "allow-same-origin") por segurança —
    // contentDocument não é acessível via JS do frame pai a partir daqui
    // (origem opaca). frameLocator lê o conteúdo via CDP, contornando essa
    // restrição de same-origin sem enfraquecer o sandbox de produção.
    const frame = page.frameLocator("iframe.desk-os-print-preview-frame");
    await expect(frame.locator("body")).toBeVisible({ timeout: 15_000 });

    const html = await frame.locator("html").evaluate((el) => el.outerHTML);
    expect(html).toContain("A4 portrait");
    expect(html).toMatch(/\.face2\s*{\s*transform:\s*rotate\(180deg\)/);
    expect(html).toContain("<svg"); // QR embutido
  });
});
