import { useRef } from "react";
import { BreadcrumbTrail, type Crumb } from "./BreadcrumbTrail.js";
import { NodeCollection } from "./NodeCollection.js";
import { LiveRegion } from "./LiveRegion.js";
import type { NodeCardData } from "./NodeCard.js";

export interface FractalRootProps {
  crumbs: Crumb[];
  children: NodeCardData[];
  onNavigate: (id: string) => void;
  onOpenChild: (id: string) => void;
  announcement: string;
}

/**
 * specs/FRONTEND_FRACTAL.md: "A interface apresenta uma escala de cada vez
 * e mantém contexto por breadcrumb." O foco move para o heading do novo
 * nível a cada navegação (ux/ACCESSIBILITY.md).
 */
export function FractalRoot({ crumbs, children, onNavigate, onOpenChild, announcement }: FractalRootProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const current = crumbs[crumbs.length - 1];

  return (
    <div className="desk-os-fractal-root">
      <BreadcrumbTrail crumbs={crumbs} onNavigate={onNavigate} />
      <h1 ref={headingRef} tabIndex={-1}>
        {current?.label ?? "Portfólio"}
      </h1>
      <NodeCollection nodes={children} onOpen={onOpenChild} />
      <LiveRegion message={announcement} />
    </div>
  );
}
