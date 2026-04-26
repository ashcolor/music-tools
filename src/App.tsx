import MetronomeApp from "./components/MetronomeApp";
import { MetronomeProvider } from "./contexts/MetronomeContext";

export default function App() {
  return (
    <MetronomeProvider>
      <div className="min-h-screen bg-base-200 py-8 flex items-center justify-center">
        <MetronomeApp />
      </div>
    </MetronomeProvider>
  );
}
