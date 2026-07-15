/** specs/FRONTEND_FRACTAL.md: mudanças de contexto são anunciadas em região aria-live. */
export function LiveRegion({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="desk-os-sr-only">
      {message}
    </div>
  );
}
