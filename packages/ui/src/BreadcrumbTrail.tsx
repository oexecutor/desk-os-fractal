export interface Crumb {
  id: string;
  label: string;
}

export interface BreadcrumbTrailProps {
  crumbs: Crumb[];
  onNavigate: (id: string) => void;
}

/** ux/ACCESSIBILITY.md: aria-current no item atual do breadcrumb. */
export function BreadcrumbTrail({ crumbs, onNavigate }: BreadcrumbTrailProps) {
  return (
    <nav aria-label="Trilha fractal" className="desk-os-breadcrumb">
      <ol style={{ display: "flex", flexWrap: "wrap", gap: "4px", listStyle: "none", margin: 0, padding: 0 }}>
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1;
          return (
            <li key={crumb.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {isCurrent ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <button type="button" onClick={() => onNavigate(crumb.id)}>
                  {crumb.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
