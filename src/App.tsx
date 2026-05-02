import Header from "./components/Header";
import MetronomeApp from "./components/MetronomeApp";
import SettingsButton from "./components/SettingsButton";
import { MetronomeProvider } from "./contexts/MetronomeContext";

export default function App() {
  return (
    <MetronomeProvider>
      <div className="min-h-screen bg-base-100 flex flex-col">
        <Header />
        <SettingsButton />
        <div className="flex-1 flex items-center justify-center">
          <MetronomeApp />
        </div>
      </div>
    </MetronomeProvider>
  );
}
