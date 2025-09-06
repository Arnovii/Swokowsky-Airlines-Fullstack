import { FaPlaneDeparture } from "react-icons/fa";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#123361] text-white">
      {/* Logo y título */}
      <header className="flex items-center space-x-3 text-3xl font-bold">
        <FaPlaneDeparture className="text-[#39A5D8]" />
        <h1>Swokosky Airlines</h1>
      </header>

      {/* Subtítulo */}
      <p className="mt-4 text-lg text-[#39A5D8]">
        Volando alto, siempre contigo ✈️
      </p>

      {/* Botón de acción */}
      <button className="mt-6 px-6 py-3 rounded-lg bg-[#39A5D8] text-[#123361] font-semibold shadow-lg hover:bg-[#1180B8] transition">
        Explorar vuelos
      </button>
    </div>
  );
}

export default App;
