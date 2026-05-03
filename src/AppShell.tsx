import { Navigate, Route, Routes } from "react-router";
import Header from "./components/Header";
import MetronomeApp from "./components/MetronomeApp";
import Toolbar from "./components/Toolbar";
import { MetronomeProvider } from "./contexts/MetronomeContext";
import { Contact } from "./features/contact/route";
import { Home } from "./features/home/route";
import { OperatorInfo } from "./features/operator-info/route";
import { PrivacyPolicy } from "./features/privacy-policy/route";

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
            <Route path="/operator" element={<OperatorInfo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </MetronomeProvider>
  );
}
