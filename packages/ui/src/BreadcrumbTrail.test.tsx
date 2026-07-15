// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BreadcrumbTrail } from "./BreadcrumbTrail.js";

afterEach(cleanup);

describe("BreadcrumbTrail — ux/ACCESSIBILITY.md aria-current", () => {
  it("marca o último crumb com aria-current=page e os demais como botões navegáveis", async () => {
    const onNavigate = vi.fn();
    render(
      <BreadcrumbTrail
        crumbs={[
          { id: "portfolio", label: "Portfólio" },
          { id: "p2", label: "P2 Clean Sea" },
          { id: "week", label: "Semana 29" },
        ]}
        onNavigate={onNavigate}
      />,
    );

    const current = screen.getByText("Semana 29");
    expect(current.getAttribute("aria-current")).toBe("page");

    const parent = screen.getByRole("button", { name: "P2 Clean Sea" });
    await userEvent.click(parent);
    expect(onNavigate).toHaveBeenCalledWith("p2");
  });

  it("é operável só por teclado (Tab + Enter, sem mouse)", async () => {
    const onNavigate = vi.fn();
    render(
      <BreadcrumbTrail
        crumbs={[
          { id: "portfolio", label: "Portfólio" },
          { id: "p2", label: "P2" },
        ]}
        onNavigate={onNavigate}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onNavigate).toHaveBeenCalledWith("portfolio");
  });
});
