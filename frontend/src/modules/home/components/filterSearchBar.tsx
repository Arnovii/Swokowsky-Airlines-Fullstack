import { useState, useEffect, useRef } from "react";

const PlaneDepartureIcon = () => (
  <svg
    className="w-6 h-6 text-blue-500"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 18.5A2.5 2.5 0 0 1 7.5 20a2.5 2.5 0 0 1-2.5 2.5M12 18.5A2.5 2.5 0 0 0 16.5 20a2.5 2.5 0 0 0 2.5 2.5M8 12h8m-8 3h8m-8-6h8M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
    />
  </svg>
);

const ChevronDownIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 ${className}`}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m19 9-7 7-7-7"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-6 h-6 text-blue-500"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    className="w-6 h-6 text-blue-500"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeWidth="2"
      d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    className="w-5 h-5 text-blue-600"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 12h14"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-5 h-5 text-blue-600"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 12h14m-7 7V5"
    />
  </svg>
);

export default function BuscadorVuelosModerno() {
  // 🟦 --- lógicas iguales ---
  const [modo, setModo] = useState("ida_vuelta");
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [ida, setIda] = useState("");
  const [vuelta, setVuelta] = useState("");
  const [pasajeros, setPasajeros] = useState({ adultos: 1, menores: 0 });
  const [mostrarPasajeros, setMostrarPasajeros] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
  const origenRef = useRef(null);
  const destinoRef = useRef(null);

  const ciudades = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
    "Bucaramanga", "Pereira", "Manizales", "Santa Marta", "Cúcuta",
    "Madrid", "Londres", "New York", "Buenos Aires", "Miami"
  ];

  const normalize = (s) =>
    s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";

  const hoy = new Date().toISOString().split("T")[0];
  const unAñoDespues = new Date(
    new Date().getTime() + 365 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];
  const totalPasajeros = pasajeros.adultos + pasajeros.menores;

  useEffect(() => {
    if (modo === "solo_ida") setVuelta("");
  }, [modo]);

  const cambiarPasajeros = (tipo, operacion) => {
    setPasajeros((prev) => {
      const nuevoValor =
        operacion === "sumar" ? prev[tipo] + 1 : prev[tipo] - 1;
      const nuevosPasajeros = {
        ...prev,
        [tipo]: Math.max(0, nuevoValor),
      };
      const nuevoTotal = nuevosPasajeros.adultos + nuevosPasajeros.menores;
      if (nuevoTotal > 5) return prev;
      if (nuevosPasajeros.adultos === 0) return { ...prev, adultos: 1 };
      return nuevosPasajeros;
    });
  };

  const filtrarOrigen = (valor) => {
    setOrigen(valor);
    const q = normalize(valor);
    setSugerenciasOrigen(
      q.length > 0 ? ciudades.filter((c) => normalize(c).includes(q)) : []
    );
  };

  const filtrarDestino = (valor) => {
    setDestino(valor);
    const q = normalize(valor);
    setSugerenciasDestino(
      q.length > 0 ? ciudades.filter((c) => normalize(c).includes(q)) : []
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (origenRef.current && !origenRef.current.contains(e.target))
        setSugerenciasOrigen([]);
      if (destinoRef.current && !destinoRef.current.contains(e.target))
        setSugerenciasDestino([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validarVuelo = () => {
    setMensaje("");
    if (!origen || !destino) return setMensaje("❌ Ingresa origen y destino.");
    if (!ida) return setMensaje("❌ Selecciona fecha de ida.");
    if (modo === "ida_vuelta" && !vuelta)
      return setMensaje("❌ Selecciona fecha de vuelta.");
    if (modo === "ida_vuelta" && ida && vuelta && new Date(vuelta) < new Date(ida))
      return setMensaje("❌ La vuelta no puede ser antes de la ida.");
    return setMensaje("✅ Búsqueda válida.");
  };

  return (
    <div className="sticky top-[80px] z-40 w-full max-w-6xl mx-auto px-6 font-sans">
      {/* Panel con efecto vidrio */}
      <div className="relative rounded-3xl shadow-2xl border border-white/50">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl"></div>

        {/* Contenido */}
        <div className="relative z-10 p-8">
          {/* Tabs */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setModo("ida_vuelta")}
              className={`px-5 py-2.5 text-base font-semibold rounded-full transition-colors ${
                modo === "ida_vuelta"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              Ida y vuelta
            </button>
            <button
              onClick={() => setModo("solo_ida")}
              className={`px-5 py-2.5 text-base font-semibold rounded-full transition-colors ${
                modo === "solo_ida"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              Solo ida
            </button>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end text-lg">
            {/* Origen/Destino */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Origen */}
              <div className="flex flex-col relative" ref={origenRef}>
                <label className="text-sm text-gray-600 mb-2">Origen</label>
                <div className="flex items-center gap-3 border border-gray-300 bg-white rounded-xl p-4 relative shadow-sm">
                  <PlaneDepartureIcon />
                  <input
                    type="text"
                    placeholder="Bogotá"
                    value={origen}
                    onChange={(e) => filtrarOrigen(e.target.value)}
                    className="w-full bg-transparent outline-none text-base font-medium text-gray-900"
                  />
                  <ChevronDownIcon />
                </div>
                {sugerenciasOrigen.length > 0 && (
                  <ul className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-auto">
                    {sugerenciasOrigen.map((ciudad, idx) => (
                      <li
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setOrigen(ciudad);
                          setSugerenciasOrigen([]);
                        }}
                        className="p-3 text-base text-gray-800 hover:bg-blue-50 cursor-pointer"
                      >
                        {ciudad}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Destino */}
              <div className="flex flex-col relative" ref={destinoRef}>
                <label className="text-sm text-gray-600 mb-2">Destino</label>
                <div className="flex items-center gap-3 border border-gray-300 bg-white rounded-xl p-4 relative shadow-sm">
                  <PlaneDepartureIcon />
                  <input
                    type="text"
                    placeholder="Madrid"
                    value={destino}
                    onChange={(e) => filtrarDestino(e.target.value)}
                    className="w-full bg-transparent outline-none text-base font-medium text-gray-900"
                  />
                  <ChevronDownIcon />
                </div>
                {sugerenciasDestino.length > 0 && (
                  <ul className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-auto">
                    {sugerenciasDestino.map((ciudad, idx) => (
                      <li
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setDestino(ciudad);
                          setSugerenciasDestino([]);
                        }}
                        className="p-3 text-base text-gray-800 hover:bg-blue-50 cursor-pointer"
                      >
                        {ciudad}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div
              className={`lg:col-span-2 grid ${
                modo === "ida_vuelta" ? "grid-cols-2" : "grid-cols-1"
              } gap-6`}
            >
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Ida</label>
                <div className="flex items-center gap-3 border border-gray-300 bg-white rounded-xl p-4 shadow-sm">
                  <CalendarIcon />
                  <input
                    type="date"
                    value={ida}
                    onChange={(e) => setIda(e.target.value)}
                    min={hoy}
                    max={unAñoDespues}
                    className="w-full bg-transparent outline-none text-base font-medium text-gray-900"
                  />
                </div>
              </div>
              {modo === "ida_vuelta" && (
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-2">Vuelta</label>
                  <div className="flex items-center gap-3 border border-gray-300 bg-white rounded-xl p-4 shadow-sm">
                    <CalendarIcon />
                    <input
                      type="date"
                      value={vuelta}
                      onChange={(e) => setVuelta(e.target.value)}
                      min={ida || hoy}
                      max={unAñoDespues}
                      className="w-full bg-transparent outline-none text-base font-medium text-gray-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pasajeros + Botón */}
            <div className="lg:col-span-1 grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-sm text-gray-600 mb-2">Pasajeros</label>
                <div
                  onClick={() => setMostrarPasajeros(!mostrarPasajeros)}
                  className="flex items-center justify-between border border-gray-300 bg-white rounded-xl p-4 cursor-pointer shadow-sm"
                >
                  <UserIcon />
                  <span className="text-base font-medium text-gray-900">
                    {totalPasajeros}
                  </span>
                  <ChevronDownIcon
                    className={`transition-transform ${
                      mostrarPasajeros ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {mostrarPasajeros && (
                  <div className="absolute top-full right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-6 min-w-[320px]">
                    <div className="space-y-5">
                      <div className="text-lg font-semibold text-gray-900">
                        ¿Quiénes viajan?
                      </div>
                      {/* Adultos */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-medium text-gray-900">
                            Adultos
                          </div>
                          <div className="text-sm text-gray-500">
                            Mayores de 15
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("adultos", "restar");
                            }}
                            disabled={pasajeros.adultos <= 1}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-blue-500"
                          >
                            <MinusIcon />
                          </button>
                          <span className="w-6 text-center font-semibold">
                            {pasajeros.adultos}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("adultos", "sumar");
                            }}
                            disabled={totalPasajeros >= 5}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-blue-500"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>

                      {/* Menores */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-medium text-gray-900">
                            Menores
                          </div>
                          <div className="text-sm text-gray-500">
                            De 2 a 14 años
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("menores", "restar");
                            }}
                            disabled={pasajeros.menores <= 0}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-blue-500"
                          >
                            <MinusIcon />
                          </button>
                          <span className="w-6 text-center font-semibold">
                            {pasajeros.menores}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("menores", "sumar");
                            }}
                            disabled={totalPasajeros >= 5}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-blue-500"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>

                      {totalPasajeros >= 5 && (
                        <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded-lg text-center">
                          Máximo 5 personas
                        </div>
                      )}

                      <button
                        onClick={() => setMostrarPasajeros(false)}
                        className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón */}
              <button
                onClick={validarVuelo}
                className="px-6 py-4 flex items-center justify-center bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors text-lg"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div className="mt-8 p-5 text-center font-semibold text-base text-gray-800 bg-blue-50 rounded-xl border border-blue-200">
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
