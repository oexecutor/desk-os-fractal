export type SyncState = "synced" | "pending" | "offline" | "conflict";

const COPY: Record<SyncState, string> = {
  synced: "Sincronizado",
  pending: "Sincronização pendente",
  offline: "Offline — mostrando último snapshot",
  conflict: "Conflito de versão — recarregue",
};

/** ADR-0011: leitura offline sempre indicada explicitamente na UI. */
export function SyncIndicator({ state }: { state: SyncState }) {
  return (
    <span role="status" className={`desk-os-sync-indicator desk-os-sync-indicator--${state}`}>
      {COPY[state]}
    </span>
  );
}
