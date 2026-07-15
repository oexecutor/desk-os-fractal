// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NodeCollection } from "./NodeCollection.js";
import type { NodeCardData } from "./NodeCard.js";

afterEach(cleanup);

function nodes(count: number): NodeCardData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `n${i}`,
    title: `Nó ${i}`,
    status: "TODO",
  }));
}

describe("NodeCollection — ADR-0008 cardinalidade dinâmica", () => {
  it("1 item -> hero card", () => {
    render(<NodeCollection nodes={nodes(1)} onOpen={vi.fn()} />);
    expect(document.querySelector(".desk-os-node-collection--hero")).not.toBeNull();
  });

  it("2 a 9 itens -> grid, todos visíveis de uma vez", () => {
    render(<NodeCollection nodes={nodes(5)} onOpen={vi.fn()} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(document.querySelector(".desk-os-node-collection--paginated")).toBeNull();
  });

  it("mais de 9 itens -> paginação, nunca cards ilegíveis todos de uma vez", () => {
    render(<NodeCollection nodes={nodes(23)} onOpen={vi.fn()} pageSize={9} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    expect(screen.getByText("1 de 3")).toBeTruthy();
  });

  it("nunca hardcoda 3, 5 ou 9 — 12 itens também pagina corretamente", () => {
    render(<NodeCollection nodes={nodes(12)} onOpen={vi.fn()} pageSize={9} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
  });
});
