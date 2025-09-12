import { useState, useEffect, useRef } from "react";
import { PlaneTakeoff, PlaneLanding } from "lucide-react";
import CalendarioRango from "@/modules/home/components/CalendarioRango";


const PlaneDepartureIcon = () => (
  <svg
    className="w-6 h-6 text-[#0e254d]"
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
    className="w-6 h-6 text-[#0e254d]"
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
    className="w-6 h-6 text-[#0e254d]"
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
    className="w-5 h-5 text-[#0e254d]"
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
    className="w-5 h-5 text-[#0e254d]"
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

  { ciudad: "Bogotá", pais: "Colombia", codigo: "BOG" },
  { ciudad: "Medellín", pais: "Colombia", codigo: "MDE" },
  { ciudad: "Cali", pais: "Colombia", codigo: "CLO" },
  { ciudad: "Barranquilla", pais: "Colombia", codigo: "BAQ" },
  { ciudad: "Cartagena", pais: "Colombia", codigo: "CTG" },
  { ciudad: "Bucaramanga", pais: "Colombia", codigo: "BGA" },
  { ciudad: "Pereira", pais: "Colombia", codigo: "PEI" },
  { ciudad: "Manizales", pais: "Colombia", codigo: "MZL" },
  { ciudad: "Santa Marta", pais: "Colombia", codigo: "SMR" },
  { ciudad: "Cúcuta", pais: "Colombia", codigo: "CUC" },
  { ciudad: "Ibagué", pais: "Colombia", codigo: "IBE" },
  { ciudad: "Villavicencio", pais: "Colombia", codigo: "VVC" },
  { ciudad: "Armenia", pais: "Colombia", codigo: "AXM" },
  { ciudad: "Montería", pais: "Colombia", codigo: "MTR" },
  { ciudad: "Neiva", pais: "Colombia", codigo: "NVA" },
  { ciudad: "Pasto", pais: "Colombia", codigo: "PSO" },
  { ciudad: "Sincelejo", pais: "Colombia", codigo: "CZU" },
  { ciudad: "Riohacha", pais: "Colombia", codigo: "RCH" },
  { ciudad: "Valledupar", pais: "Colombia", codigo: "VUP" },
  { ciudad: "Popayán", pais: "Colombia", codigo: "PPN" },
  { ciudad: "Tunja", pais: "Colombia", codigo: "TUN" },
  { ciudad: "Florencia", pais: "Colombia", codigo: "FLA" },
  { ciudad: "Yopal", pais: "Colombia", codigo: "EYP" },
  { ciudad: "Mocoa", pais: "Colombia", codigo: "VGZ" },
  { ciudad: "San Andrés", pais: "Colombia", codigo: "ADZ" },
  { ciudad: "Mitú", pais: "Colombia", codigo: "MVP" },
  { ciudad: "Puerto Carreño", pais: "Colombia", codigo: "PCR" },
  { ciudad: "Inírida", pais: "Colombia", codigo: "LCR" },
  { ciudad: "Quibdó", pais: "Colombia", codigo: "UIB" },
  { ciudad: "Leticia", pais: "Colombia", codigo: "LET" },

  { ciudad: "Madrid", pais: "Spain", codigo: "MAD" },
  { ciudad: "Londres", pais: "United Kingdom", codigo: "LHR" },
  { ciudad: "New York", pais: "United States", codigo: "JFK" },
  { ciudad: "Buenos Aires", pais: "Argentina", codigo: "EZE" },
  { ciudad: "Miami", pais: "United States", codigo: "MIA" }
];


  const ciudadesColombia = ciudades.filter(c => c.pais === "Colombia").map(c => c.ciudad);
  const origenesInternacionales = ["Pereira", "Bogotá", "Medellín", "Cali", "Cartagena"];
  const destinosInternacionales = ["Madrid", "Londres", "New York", "Buenos Aires", "Miami"];

  const hoy = new Date().toISOString().split("T")[0];
  const unAñoDespues = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const totalPasajeros = pasajeros.adultos + pasajeros.menores;

  // ================== HELPERS ==================
  const normalize = (s: string) =>
    s?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";

  const limpiarCiudad = (valor: string) => valor.split("(")[0].trim();

  const cambiarPasajeros = (tipo: "adultos" | "menores", operacion: "sumar" | "restar") => {
    setPasajeros(prev => {
      let nuevoValor = operacion === "sumar" ? prev[tipo] + 1 : prev[tipo] - 1;
      nuevoValor = Math.max(0, nuevoValor);

      const nuevosPasajeros = { ...prev, [tipo]: nuevoValor };
      const total = nuevosPasajeros.adultos + nuevosPasajeros.menores;

      if (total > 5) return prev;
      if (nuevosPasajeros.adultos === 0) return { ...prev, adultos: 1 };

      return nuevosPasajeros;
    });
  };

  // ================== FILTROS ==================
  const filtrarOrigen = (valor: string) => {
    setOrigen(valor);
    const q = normalize(valor);
    setSugerenciasOrigen(
      q ? ciudades.filter(c => normalize(c.ciudad).includes(q)) : []
    );
  };

  const filtrarDestino = (valor) => {
    setDestino(valor);
    const q = normalize(valor);
    let listaPermitida = [];

    if (origen) {
      const origenCiudad = limpiarCiudad(origen);
      
      // Verificamos si el origen es una ciudad colombiana válida
      const origenEsValido = ciudades.some(
        (c) => c.ciudad === origenCiudad && c.pais === "Colombia"
      );

      // Si el origen es una ciudad colombiana válida...
      if (origenEsValido) {
        
        // Por defecto, permitimos TODOS los destinos nacionales.
        listaPermitida = ciudades.filter((c) => c.pais === "Colombia");

        //  ADEMÁS, si ese origen es un hub internacional...
        if (origenesInternacionales.includes(origenCiudad)) {
          
          // agregamos los destinos internacionales a la lista.
          const destinosInternacionalesPermitidos = ciudades.filter((c) =>
            destinosInternacionales.includes(c.ciudad)
          );
          // Usamos push(...array) para añadir los elementos del otro array
          listaPermitida.push(...destinosInternacionalesPermitidos);
        }
      }
      // Si el origen no es colombiano, `listaPermitida` se queda vacía []. Correcto.

    } else {
      // Si no se ha escrito un origen, mostrar todo.
      listaPermitida = ciudades;
    }

    setSugerenciasDestino(
      q.length > 0
        ? listaPermitida.filter((c) => normalize(c.ciudad).includes(q))
        : []
    );
  };
  // ================== EFFECTS ==================
  useEffect(() => {
    if (modo === "solo_ida") setVuelta("");
  }, [modo]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (origenRef.current && !origenRef.current.contains(e.target)) setSugerenciasOrigen([]);
      if (destinoRef.current && !destinoRef.current.contains(e.target)) setSugerenciasDestino([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================== VALIDACIÓN ==================
  const validarVuelo = () => {
    setMensaje("");

    if (!origen || !destino) return setMensaje("❌ Ingresa origen y destino.");

    const origenCiudad = limpiarCiudad(origen);
    const destinoCiudad = limpiarCiudad(destino);

    const origenEsInt = origenesInternacionales.includes(origenCiudad);
    const destinoEsInt = destinosInternacionales.includes(destinoCiudad);

    if (origenEsInt && destinoEsInt) {
      // validacion vuelos
    } else if (destinoEsInt && !origenEsInt) {
        return setMensaje("❌ Solo puedes salir internacional desde: Bogotá, Medellín, Cali, Cartagena o Pereira.");
    } else if (!ciudadesColombia.includes(origenCiudad) || !ciudadesColombia.includes(destinoCiudad)) {
        return setMensaje("❌ Los vuelos nacionales solo son entre ciudades de Colombia.");
    }

    // Validación de fechas
    if (!ida) return setMensaje("❌ Selecciona fecha de ida.");
    if (modo === "ida_vuelta" && !vuelta) return setMensaje("❌ Selecciona fecha de vuelta.");
    if (modo === "ida_vuelta" && ida && vuelta && vuelta < ida) {
      return setMensaje("❌ La vuelta no puede ser antes de la ida.");
    }

    return setMensaje("✅ Búsqueda válida.");
  };



  return (
    <div className="sticky top-[80px] z-40 w-full max-w-6xl mx-auto px-6 font-sans">
      <div className="relative rounded-3xl shadow-2xl border border-white/50">
        <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-3xl"></div>

        <div className="relative z-10 p-8">
          {/* Tabs */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setModo("ida_vuelta")}
              className={`px-5 py-2.5 text-base font-sans rounded-full transition-colors ${
                modo === "ida_vuelta"
                  ? "bg-[#0e254d] text-white shadow-lg"
                  : "text-gray-600 hover:bg-[#0e254d]"
              }`}
            >
              Ida y vuelta
            </button>
            <button
              onClick={() => setModo("solo_ida")}
              className={`px-5 py-2.5 text-base font-sans rounded-full transition-colors ${
                modo === "solo_ida"
                  ? "bg-[#0e254d] text-white shadow-lg"
                  : "text-gray-600 hover:bg-[#0e254d]"
              }`}
            >
              Solo ida
            </button>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end text-lg">
            {/* Origen */}
            <div className="flex flex-col relative" ref={origenRef}>
              <label className="text-sm text-gray-600 mb-2">Origen</label>
              <div className="flex items-center gap-3 border border-gray-300 bg-white rounded-xl p-4 shadow-sm">
                <PlaneTakeoff className="w-6 h-6 text-[#0e254d]" />
                <input
                  type="text"
                  placeholder="Bogotá"
                  value={origen}
                  onChange={(e) => filtrarOrigen(e.target.value)}
                  className="w-full bg-transparent outline-none text-base font-sans text-gray-900"
                />
              </div>
              {sugerenciasOrigen.length > 0 && (
                <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {sugerenciasOrigen.map((c, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setOrigen(`${c.ciudad} (${c.codigo})`);
                        setSugerenciasOrigen([]);
                      }}
                      className="flex justify-between p-5 cursor-pointer hover:bg-gray-100"
                    >
                      <div>
                        <span className="font-sans text-gray-900">{c.ciudad}</span>{" "}
                        <span className="text-gray-500">({c.pais})</span>
                      </div>
                      <span className="font-sans text-gray-700">{c.codigo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Destino */}
            <div className="flex flex-col relative" ref={destinoRef}>
              <label className="text-sm text-gray-600 mb-2">Destino</label>
              <div className="flex items-center gap-3 border border-gray-300 bg-white rounded-xl p-4 shadow-sm">
                <PlaneLanding className="w-6 h-6 text-[#0e254d]" />
                <input
                  type="text"
                  placeholder="Madrid"
                  value={destino}
                  onChange={(e) => filtrarDestino(e.target.value)}
                  className="w-full bg-transparent outline-none text-base font-sans text-gray-900"
                />
              </div>
              {sugerenciasDestino.length > 0 && (
                <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {sugerenciasDestino.map((c, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setDestino(`${c.ciudad} (${c.codigo})`);
                        setSugerenciasDestino([]);
                      }}
                      className="flex justify-between p-5 cursor-pointer hover:bg-gray-100"
                    >
                      <div>
                        <span className="font-sans text-gray-900">{c.ciudad}</span>{" "}
                        <span className="text-gray-500">({c.pais})</span>
                      </div>
                      <span className="font-sans text-gray-700">{c.codigo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>


            {/* Fechas */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-2">Fechas</label>
              {/* El contenedor padre ya tiene los estilos correctos */}
              <div className="flex items-center gap-3 bg-white">
                {/* No necesitas el ícono aquí, ya que está dentro del nuevo componente */}
                <div className="w-full">
                  <CalendarioRango
                    modo={modo}
                    onChange={({ startDate, endDate }) => {
                      if (startDate) {
                        setIda(startDate.toISOString().split("T")[0]);
                      }
                      if (endDate && modo === "ida_vuelta") {
                        setVuelta(endDate.toISOString().split("T")[0]);
                      } else {
                        setVuelta("");
                      }
                    }}
                  />
                </div>
              </div>
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
                  <span className="text-base font-sans text-gray-900">
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
                      <div className="text-lg font-sans text-gray-900">
                        ¿Quiénes viajan?
                      </div>
                      {/* Adultos */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-sans text-gray-900">
                            Adultos
                          </div>
                          <div className="text-sm text-gray-500">
                            Mayores de 18 años
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("adultos", "restar");
                            }}
                            disabled={pasajeros.adultos <= 1}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                          >
                            <MinusIcon />
                          </button>
                          <span className="w-6 text-center font-sans text-[#0e254d]">
                            {pasajeros.adultos}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("adultos", "sumar");
                            }}
                            disabled={totalPasajeros >= 5}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>

                      {/* Menores */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-sans text-gray-900">
                            Menores
                          </div>
                          <div className="text-sm text-gray-500">
                            De o a 17 años
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("menores", "restar");
                            }}
                            disabled={pasajeros.menores <= 0}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                          >
                            <MinusIcon />
                          </button>
                          <span className="w-6 text-center font-sans text-[#0e254d]">
                            {pasajeros.menores}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cambiarPasajeros("menores", "sumar");
                            }}
                            disabled={totalPasajeros >= 5}
                            className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>

                      {totalPasajeros >= 5 && (
                        <div className="text-sm text-[#0e254d] bg-[#0e254d] p-2 rounded-lg text-center">
                          Máximo 5 personas
                        </div>
                      )}

                      <button
                        onClick={() => setMostrarPasajeros(false)}
                        className="w-full mt-3 py-2.5 bg-[#0e254d] text-white rounded-xl text-base font-sans hover:bg-[#0e254d] transition-colors shadow-md"
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
                className="px-3 py-6  flex items-center justify-center bg-[#0e254d] text-brand-white font-sans rounded-xl shadow-lg hover:bg-brand-darkcyan transition-colors text-lg"
              >
                Buscar
              </button>
            </div>
          </div>
          {/* Mensaje */}
          {mensaje && (
            <div className="mt-8 p-5 text-center font-sans text-base text-gray-800 bg-[#0e254d] rounded-xl border border-[#0e254d]">
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}