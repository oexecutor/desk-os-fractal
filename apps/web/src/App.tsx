import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { SyncIndicator } from "@desk-os/ui";
import { IntakePage } from "./routes/IntakePage.js";
import { DecompositionProgressPage } from "./routes/DecompositionProgressPage.js";
import { PlanReviewPage } from "./routes/PlanReviewPage.js";
import { PortfolioPage } from "./routes/PortfolioPage.js";
import { FocusPage } from "./routes/FocusPage.js";
import { EmitPreviewPage } from "./routes/EmitPreviewPage.js";
import { QrResolvePage } from "./routes/QrResolvePage.js";

/** ADR-0011: leitura offline sempre indicada explicitamente na UI. */
function useOnlineState(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const setTrue = () => setOnline(true);
    const setFalse = () => setOnline(false);
    window.addEventListener("online", setTrue);
    window.addEventListener("offline", setFalse);
    return () => {
      window.removeEventListener("online", setTrue);
      window.removeEventListener("offline", setFalse);
    };
  }, []);
  return online;
}

export function App() {
  const online = useOnlineState();
  return (
    <div className="desk-os-app">
      <header className="desk-os-app-header">
        <Link to="/" className="desk-os-app-brand">
          DESK-OS / TAL de Fractal
        </Link>
        <nav aria-label="Navegação principal">
          <Link to="/intake">Intake</Link>
          <Link to="/portfolio">Portfólio</Link>
          <Link to="/focus">Foco</Link>
          <Link to="/emit">Emitir</Link>
        </nav>
        <SyncIndicator state={online ? "synced" : "offline"} />
      </header>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<IntakePage />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/ingestions/:ingestionId" element={<DecompositionProgressPage />} />
          <Route path="/plans/:planVersionId" element={<PlanReviewPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:nodeId" element={<PortfolioPage />} />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="/emit" element={<EmitPreviewPage />} />
          <Route path="/q/:token" element={<QrResolvePage />} />
        </Routes>
      </main>
    </div>
  );
}
