import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** ux/ACCESSIBILITY.md: WCAG 2.2 AA alvo; navegação completa por teclado. */
test.describe("Acessibilidade", () => {
  test("Intake não tem violações críticas/sérias de axe", async ({ page }) => {
    await page.goto("/intake");
    const results = await new AxeBuilder({ page }).include("body").analyze();
    const seriousOrCritical = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
  });

  test("skip link e navegação principal são alcançáveis só por teclado (Tab)", async ({ page }) => {
    await page.goto("/intake");
    await page.keyboard.press("Tab");
    const skipLinkFocused = await page.evaluate(() => document.activeElement?.classList.contains("desk-os-skip-link"));
    expect(skipLinkFocused).toBe(true);

    await page.keyboard.press("Tab"); // brand link
    await page.keyboard.press("Tab"); // Intake nav link
    const focusedText = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedText).toBe("Intake");
  });

  test("formulário de Intake é operável inteiramente por teclado (sem mouse)", async ({ page }) => {
    await page.goto("/intake");
    await page.getByLabel("Colar texto").focus();
    await page.keyboard.type("Teste de operação só por teclado.");
    await page.keyboard.press("Tab"); // arquivos
    await page.keyboard.press("Tab"); // checkbox de consentimento
    await page.keyboard.press("Space");
    const checked = await page.getByRole("checkbox").isChecked();
    expect(checked).toBe(true);
  });

  test("320px de largura não produz rolagem horizontal (NFR-004)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/intake");
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
