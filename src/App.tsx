import Header from "./components/Header";
import MetronomeApp from "./components/MetronomeApp";
import Toolbar from "./components/Toolbar";
import { MetronomeProvider } from "./contexts/MetronomeContext";

export default function App() {
  return (
    <MetronomeProvider>
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Header />
        <Toolbar />
        <MetronomeApp />
      </div>
    </MetronomeProvider>
  );
}
