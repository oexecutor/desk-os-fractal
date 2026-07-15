// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApprovalBanner } from "./ApprovalBanner.js";

afterEach(cleanup);

describe("ApprovalBanner — ADR-0007 gate humano", () => {
  it("GENERATED oferece somente 'Iniciar revisão'", () => {
    render(<ApprovalBanner lifecycleState="GENERATED" onStartReview={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Iniciar revisão" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Aprovar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ativar" })).toBeNull();
  });

  it("ACTIVE não oferece nenhuma ação de transição", () => {
    render(<ApprovalBanner lifecycleState="ACTIVE" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("aciona onApprove ao clicar em Aprovar durante IN_REVIEW", async () => {
    const onApprove = vi.fn();
    render(<ApprovalBanner lifecycleState="IN_REVIEW" onApprove={onApprove} />);
    await userEvent.click(screen.getByRole("button", { name: "Aprovar" }));
    expect(onApprove).toHaveBeenCalled();
  });
});
