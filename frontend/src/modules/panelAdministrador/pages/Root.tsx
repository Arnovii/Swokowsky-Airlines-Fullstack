    import React, { useEffect, useMemo, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import api from "../../../api/axios";

    type AdminItem = {
    id_usuario: number | string;
    correo: string;
    username: string;
    nombre: string;
    apellido: string;
    tipo_usuario: "root" | "admin" | "cliente" | string;
    must_change_password: boolean;
    creado_en?: string;
    };

    function safeStr(v: any): string {
    return typeof v === "string" ? v : v == null ? "" : String(v);
    }

    function mapAdminResponse(raw: any): AdminItem | null {
    if (!raw) return null;
    const must =
        typeof raw.must_change_password === "boolean"
        ? raw.must_change_password
        : String(raw.must_change_password).toLowerCase() === "true" ||
            raw.must_change_password === 1 ||
            raw.must_change_password === "1";

    return {
        id_usuario: raw.id_usuario,
        correo: safeStr(raw.correo),
        username: safeStr(raw.username),
        nombre: safeStr(raw.nombre),
        apellido: safeStr(raw.apellido),
        tipo_usuario: safeStr(raw.tipo_usuario) || "admin",
        must_change_password: must,
        creado_en: safeStr(raw.creado_en),
    };
    }

    function formatDateISO(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    }

    function getInitials(nombre: string, apellido: string) {
    const n = safeStr(nombre).trim();
    const a = safeStr(apellido).trim();
    const i1 = n ? n[0].toUpperCase() : "";
    const i2 = a ? a[0].toUpperCase() : "";
    const fallback = (i1 || i2) ? `${i1}${i2}` : "AD";
    return fallback;
    }

    const Root: React.FC = () => {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState<AdminItem[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [removingId, setRemovingId] = useState<number | string | null>(null);
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return admins;
        return admins.filter((a) => {
        return (
            safeStr(a.correo).toLowerCase().includes(s) ||
            safeStr(a.username).toLowerCase().includes(s) ||
            safeStr(a.nombre).toLowerCase().includes(s) ||
            safeStr(a.apellido).toLowerCase().includes(s) ||
            safeStr(a.tipo_usuario).toLowerCase().includes(s) ||
            String(a.id_usuario).toLowerCase().includes(s)
        );
        });
    }, [admins, q]);

    async function fetchAdmins() {
        try {
        setLoadingList(true);
        // Si api ya tiene baseURL="/api/v1", usa "/root"; si no, "/api/v1/root"
        const { data } = await api.get("/root");
        const list: any[] = Array.isArray(data) ? data : data?.admins ?? data?.data ?? [];
        const normalized = list.map(mapAdminResponse).filter(Boolean) as AdminItem[];
        normalized.sort((a, b) => {
            const da = new Date(a.creado_en ?? 0).getTime();
            const db = new Date(b.creado_en ?? 0).getTime();
            return isNaN(db - da) ? 0 : db - da;
        });
        setAdmins(normalized);
        } catch (e: any) {
        console.error("Error al listar administradores:", e?.response?.data || e);
        setAdmins([]);
        } finally {
        setLoadingList(false);
        }
    }

    async function removeAdmin(target: AdminItem) {
        const correo = safeStr(target.correo);
        if (!correo) {
        alert("No se puede eliminar: el usuario no tiene correo definido.");
        return;
        }
        const ok = window.confirm(`¿Eliminar al administrador "${target.username || target.nombre}" (${correo})?`);
        if (!ok) return;

        try {
        setRemovingId(target.id_usuario);
        // Si api NO tiene baseURL="/api/v1", cambia a: await api.delete("/api/v1/root/admin", { data: { correo } })
        await api.delete("/root/admin", { data: { correo } });
        await fetchAdmins(); // refrescar tabla desde el backend
        } catch (e: any) {
        console.error("No se pudo eliminar el admin:", e?.response?.data || e);
        alert(e?.response?.data?.message || "No se pudo eliminar el administrador.");
        } finally {
        setRemovingId(null);
        }
    }

    useEffect(() => {
        fetchAdmins();
    }, []);

    const getTipoColor = (tipo: string) => {
        switch (tipo.toLowerCase()) {
        case "root":
            return "bg-purple-500/10 text-purple-400 border-purple-500/30";
        case "admin":
            return "bg-blue-500/10 text-blue-400 border-blue-500/30";
        default:
            return "bg-slate-500/10 text-slate-400 border-slate-500/30";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        {/* Efectos de fondo */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    </div>
                    <div>
                    <h1 className="text-3xl font-bold text-white">Administradores</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Gestiona las cuentas de tipo <span className="text-blue-400 font-semibold">admin</span> del sistema
                    </p>
                    </div>
                </div>
                </div>

                <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => navigate("/panelAdministrador/root/create-admin")}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:from-blue-700 hover:to-cyan-600 transition duration-200 shadow-lg shadow-blue-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo administrador
                </button>
                <button
                    onClick={fetchAdmins}
                    disabled={loadingList}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700/50 transition duration-200 disabled:opacity-50"
                >
                    <svg className={`w-5 h-5 ${loadingList ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loadingList ? "Actualizando..." : "Actualizar"}
                </button>
                </div>
            </div>
            </div>

            {/* Búsqueda y Total */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por nombre, correo, username, tipo..."
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition duration-200"
                />
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-4 shadow-lg shadow-blue-500/25">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-blue-100 text-sm font-medium">Total</p>
                    <p className="text-white text-3xl font-bold mt-1">{filtered.length}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                </div>
            </div>
            </div>

            {/* Tabla */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                    <tr className="bg-slate-700/50 border-b border-slate-600/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Creado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                    {filtered.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 00-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            </div>
                            <div>
                            <p className="text-slate-400 font-medium">No se encontraron administradores</p>
                            <p className="text-slate-500 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                            </div>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    filtered.map((a) => (
                        <tr key={a.id_usuario} className="hover:bg-slate-700/30 transition duration-150">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                                {getInitials(a.nombre, a.apellido)}
                            </div>
                            <div>
                                <p className="text-white font-semibold">
                                {(a.nombre || "-")} {(a.apellido || "")}
                                </p>
                                <p className="text-slate-400 text-sm">@{a.username || "-"}</p>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-300">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">{a.correo || "-"}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getTipoColor(a.tipo_usuario)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {safeStr(a.tipo_usuario).toUpperCase() || "ADMIN"}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            {a.must_change_password ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Cambio requerido
                            </span>
                            ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Activo
                            </span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDateISO(a.creado_en)}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                            type="button"
                            onClick={() => removeAdmin(a)}
                            disabled={removingId === a.id_usuario}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm 
                                ${removingId === a.id_usuario
                                ? "border-red-300 text-red-400 bg-red-50/20 cursor-wait"
                                : "border-red-300 text-red-500 hover:bg-red-50/10"
                                }`}
                            title="Eliminar administrador"
                            >
                            <svg className={`w-4 h-4 ${removingId === a.id_usuario ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V6a2 2 0 012-2h2a2 2 0 012 2v1" />
                            </svg>
                            {removingId === a.id_usuario ? "Eliminando..." : "Eliminar"}
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </div>
    );
    };

    export default Root;
