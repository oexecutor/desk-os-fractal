import { describe, expect, it } from "vitest";
import { detectLanguageHeuristic } from "./language.js";

describe("detectLanguageHeuristic", () => {
  it("identifica português com confiança suficiente", () => {
    const text =
      "O projeto precisa ser entregue até o fim da semana e a equipe já está trabalhando nisso com muito cuidado para não errar nada.";
    expect(detectLanguageHeuristic(text)).toBe("pt");
  });

  it("identifica inglês com confiança suficiente", () => {
    const text =
      "The project needs to be delivered by the end of the week and the team is already working on it with great care.";
    expect(detectLanguageHeuristic(text)).toBe("en");
  });

  it("retorna null (LACUNA) para texto curto demais", () => {
    expect(detectLanguageHeuristic("texto curto")).toBeNull();
  });
});
