import { Navigate, Route, Routes } from "react-router";
import Header from "./components/Header";
import MetronomeApp from "./components/MetronomeApp";
import Toolbar from "./components/Toolbar";
import { MetronomeProvider } from "./contexts/MetronomeContext";
import { Home } from "./features/home/route";

function MetronomeRoute() {
  return (
    <div className="flex flex-1 flex-col">
      <Toolbar />
      <MetronomeApp />
    </div>
  );
}

export function AppShell() {
  return (
    <MetronomeProvider>
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/metronome" element={<MetronomeRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </MetronomeProvider>
  );
}
