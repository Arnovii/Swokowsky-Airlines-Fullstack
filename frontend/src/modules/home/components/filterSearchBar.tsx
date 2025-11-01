import { PlaneTakeoff, PlaneLanding } from "lucide-react";
import CalendarioRango from "@/modules/home/components/CalendarioRango";
import { useFlightSearch } from "@/modules/home/hooks/useFlightSearch";
import { TimeFilter } from "@/modules/home/components/TimeFilter";
// ================== ICONOS SVG ==================
const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
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

const DollarIcon = () => (
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
      d="M12 6v13m0-13c-2.8-.8-4.7-1-6-1v13c1.3 0 3.2.2 6 1m0-13c2.8-.8 4.7-1 6-1v13c-1.3 0-3.2.2-6 1"
    />
  </svg>
);

const ClockIcon = () => (
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
      d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);



// ================== COMPONENTE PRINCIPAL ==================
export default function FilterSearchBar() {
  const {
  modo,
  origen,
  destino,
  ida,
  vuelta,
  pasajeros,
  mensaje,
  loading,
  ciudadesLoaded,
  camposInvalidos,
  sugerenciasOrigen,
  sugerenciasDestino,
  mostrarCalendario,
  mostrarPasajeros,
  origenBloqueado,
  destinoBloqueado,
  totalPasajeros,
  precioMin,
  precioMax,
  horaIdaInicio,           
  horaIdaFin,             
  horaVueltaInicio,        
  horaVueltaFin,          
  mostrarHorarios,
  origenRef,
  destinoRef,
  setModo,
  setMostrarCalendario,
  setMostrarPasajeros,
  setMostrarHorarios,
  filtrarOrigen,
  filtrarDestino,
  seleccionarOrigen,
  seleccionarDestino,
  resetearOrigen,
  resetearDestino,
  cambiarPasajeros,
  actualizarFechas,
  validarYBuscarVuelo,
  limpiarErrorCampo,
  formatearPrecio,
  handlePrecioChange,
  setHoraIdaInicio,        
  setHoraIdaFin,           
  setHoraVueltaInicio,   
  setHoraVueltaFin,       
  setPrecioMin,
  setPrecioMax,
} = useFlightSearch();

  return (
    <div className="sticky top-[80px] z-40 w-full max-w-6xl mx-auto px-6 font-sans">
      <div className="relative rounded-3xl shadow-2xl border border-white/50">
        <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-3xl"></div>

        <div className="relative z-10 p-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
            {/* Filtro de Precio */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                Rango de precio
              </label>
              <div className="flex gap-2">
                <div className="flex-1 border border-gray-300 bg-white rounded-xl p-2 sm:p-3 h-14 shadow-sm flex flex-col justify-center">
                  <div className="text-xs text-gray-500">Mínimo</div>
                  <input
                    type="text"
                    placeholder="0"
                    value={formatearPrecio(precioMin)}
                    onChange={(e) => handlePrecioChange(setPrecioMin, e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-sans text-gray-900"
                  />
                </div>
                <div className="flex items-center text-gray-400">-</div>
                <div className="flex-1 border border-gray-300 bg-white rounded-xl p-2 sm:p-3 h-14 shadow-sm flex flex-col justify-center">
                  <div className="text-xs text-gray-500">Máximo</div>
                  <input
                    type="text"
                    placeholder="Sin límite"
                    value={formatearPrecio(precioMax)}
                    onChange={(e) => handlePrecioChange(setPrecioMax, e.target.value)}
                    className="w-full bg-transparent outline-none text-sm font-sans text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Horario */}
            <TimeFilter
              mostrarHorarios={mostrarHorarios}
              setMostrarHorarios={setMostrarHorarios}
              horaIdaInicio={horaIdaInicio}
              horaIdaFin={horaIdaFin}
              setHoraIdaInicio={setHoraIdaInicio}
              setHoraIdaFin={setHoraIdaFin}
            />

          </div>
          {/* Formulario Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.5fr_1fr_0.8fr] gap-4 items-end text-lg">
            {/* Origen */}
            <div className="flex flex-col relative" ref={origenRef}>
              <label className="text-sm text-gray-600 mb-2">Origen</label>
              <div className={`flex items-center gap-3 border ${camposInvalidos.origen ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-3 shadow-sm h-14`}>
                <PlaneTakeoff className="w-5 h-5 text-[#0e254d]" />
                <input
                  type="text"
                  placeholder="Buscar ciudad de origen"
                  value={origen}
                  onChange={(e) => {
                    if (!origenBloqueado) {
                      filtrarOrigen(e.target.value);
                    }
                  }}
                  readOnly={origenBloqueado}
                  onClick={() => {
                    if (origenBloqueado) {
                      resetearOrigen();
                    }
                  }}
                  className={`w-full bg-transparent outline-none text-base font-sans text-gray-900 ${origenBloqueado ? "cursor-pointer" : ""}`}
                />
              </div>
              {sugerenciasOrigen.length > 0 && !origenBloqueado && (
                <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {sugerenciasOrigen.map((c, i) => (
                    <li
                      key={i}
                      onClick={() => seleccionarOrigen(c)}
                      className="flex justify-between p-3 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      <div>
                        <span className="font-sans text-gray-900">{c.nombre}</span>
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
              <div className={`flex items-center gap-3 border ${camposInvalidos.destino ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-3 shadow-sm h-14`}>
                <PlaneLanding className="w-5 h-5 text-[#0e254d]" />
                <input
                  type="text"
                  placeholder="Buscar ciudad de destino"
                  value={destino}
                  onChange={(e) => {
                    if (!destinoBloqueado) {
                      filtrarDestino(e.target.value);
                    }
                  }}
                  readOnly={destinoBloqueado}
                  onClick={() => {
                    if (destinoBloqueado) {
                      resetearDestino();
                    }
                  }}
                  className={`w-full bg-transparent outline-none text-base font-sans text-gray-900 ${
                    destinoBloqueado ? "cursor-pointer" : ""
                  }`}
                />
              </div>
              {sugerenciasDestino.length > 0 && !destinoBloqueado && (
                <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {sugerenciasDestino.map((c, i) => (
                    <li
                      key={i}
                      onClick={() => seleccionarDestino(c)}
                      className="flex justify-between p-3 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      <div>
                        <span className="font-sans text-gray-900">{c.nombre}</span>
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
              <div className="flex gap-2 overflow-hidden">
                {/* Fecha Ida */}
                <div 
                  className={`flex-1 border ${camposInvalidos.ida ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-2 sm:p-3 cursor-pointer shadow-sm h-14 flex items-center gap-2 min-w-0`}
                  onClick={() => {
                    setMostrarCalendario(true);
                    if (camposInvalidos.ida) limpiarErrorCampo('ida');
                    if (camposInvalidos.vuelta) limpiarErrorCampo('vuelta');
                  }}
                >
                  <CalendarIcon />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Ida</div>
                    <div className="text-xs sm:text-sm font-sans text-gray-900 truncate">
                      {ida ? new Date(`${ida}T00:00:00`).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      }) : "Seleccionar"}
                    </div>
                  </div>
                </div>

                {/* Fecha Vuelta */}
                {modo === "ida_vuelta" && (
                  <div 
                    className={`flex-1 border ${camposInvalidos.vuelta ? 'border-red-500' : 'border-gray-300'} bg-white rounded-xl p-2 sm:p-3 cursor-pointer shadow-sm h-14 flex items-center gap-2 min-w-0`}
                    onClick={() => {
                      setMostrarCalendario(true);
                      if (camposInvalidos.ida) limpiarErrorCampo('ida');
                      if (camposInvalidos.vuelta) limpiarErrorCampo('vuelta');
                    }}
                  >
                    <CalendarIcon />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Vuelta</div>
                      <div className="text-xs sm:text-sm font-sans text-gray-900 truncate">
                        {vuelta ? new Date(`${vuelta}T00:00:00`).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        }) : "Seleccionar"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Componente CalendarioRango */}
              <CalendarioRango
                modo={modo}
                isOpen={mostrarCalendario}
                onOpenChange={setMostrarCalendario}
                fechaInicial={ida}
                fechaFinal={vuelta}
                onChange={actualizarFechas}
              />
            </div>

            {/* Pasajeros */}
            <div className="relative">
              <label className="text-sm text-gray-600 mb-2">Pasajeros</label>
              <div
                onClick={() => setMostrarPasajeros(!mostrarPasajeros)}
                className="flex items-center justify-between border border-gray-300 bg-white rounded-xl p-3 cursor-pointer shadow-sm h-14"
              >
                <UserIcon />
                <span className="text-base font-sans text-gray-900">
                  {totalPasajeros}
                </span>
                <ChevronDownIcon
                  className={`transition-transform ${mostrarPasajeros ? "rotate-180" : ""}`}
                />
              </div>
              {mostrarPasajeros && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-[200px]">
                  <div className="space-y-4">
                    <div className="text-base font-sans text-gray-900">
                      ¿Quiénes viajan?
                    </div>
                    {/* Adultos */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-sans text-gray-900">Adultos</div>
                        <div className="text-xs text-gray-500">Mayores de 18 años</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cambiarPasajeros("adultos", "restar");
                          }}
                          disabled={pasajeros.adultos <= 1}
                          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-5 text-center font-sans text-[#0e254d] text-sm">
                          {pasajeros.adultos}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cambiarPasajeros("adultos", "sumar");
                          }}
                          disabled={totalPasajeros >= 5}
                          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    </div>

                    {/* Menores */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-sans text-gray-900">Menores</div>
                        <div className="text-xs text-gray-500">De 0 a 17 años</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cambiarPasajeros("menores", "restar");
                          }}
                          disabled={pasajeros.menores <= 0}
                          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-5 text-center font-sans text-[#0e254d] text-sm">
                          {pasajeros.menores}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cambiarPasajeros("menores", "sumar");
                          }}
                          disabled={totalPasajeros >= 5}
                          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:border-[#0e254d]"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    </div>

                    {totalPasajeros >= 5 && (
                      <div className="text-xs text-[#0e254d] bg-blue-50 p-2 rounded-lg text-center">
                        Máximo 5 personas
                      </div>
                    )}

                    <button
                      onClick={() => setMostrarPasajeros(false)}
                      className="w-full mt-2 py-2 bg-[#0e254d] text-white rounded-lg text-sm font-sans hover:bg-[#0a1a3a] transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Buscar */}
            <div className="flex items-end h-full">
              <button
                onClick={validarYBuscarVuelo}
                disabled={loading || !ciudadesLoaded}
                className="w-full h-14 flex items-center justify-center bg-[#0e254d] text-white font-sans rounded-xl shadow-lg hover:bg-[#0a1a3a] transition-colors text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div className={`mt-8 p-5 text-center font-sans text-base text-white rounded-xl border ${
              mensaje.includes("Error") 
                ? "bg-red-500 border-red-600" 
                : mensaje.includes("✅") 
                  ? "bg-green-500 border-green-600"
                  : "bg-[#0e254d] border-[#0e254d]"
            }`}>
              {mensaje}
            </div>
          )}

          {/* Loading indicator cuando se cargan las ciudades */}
          {!ciudadesLoaded && (
            <div className="mt-4 p-3 text-center text-gray-600 text-sm">
              Cargando ciudades disponibles...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}