import Header from "./components/Header";
import MetronomeApp from "./components/MetronomeApp";
import AccelerationToggle from "./components/AccelerationToggle";
import { MetronomeProvider } from "./contexts/MetronomeContext";

export default function App() {
  return (
    <MetronomeProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <AccelerationToggle />
        <div className="flex-1 flex items-center justify-center">
          <MetronomeApp />
        </div>
      </div>
    </MetronomeProvider>
  );
}
