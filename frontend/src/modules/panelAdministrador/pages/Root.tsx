    import React, { useEffect, useMemo, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import api from "../../../api/axios";

    type AdminItem = {
    id_usuario: number | string;
    correo: string;           // backend field
    username: string;
    nombre: string;
    apellido: string;
    tipo_usuario: "root" | "admin" | "cliente" | string;
    must_change_password: boolean;
    creado_en?: string;
    };

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
        correo: raw.correo,
        username: raw.username,
        nombre: raw.nombre,
        apellido: raw.apellido,
        tipo_usuario: raw.tipo_usuario,
        must_change_password: must,
        creado_en: raw.creado_en,
    };
    }

    function formatDateISO(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
    }

    const Root: React.FC = () => {
    const navigate = useNavigate();

    // listado
    const [admins, setAdmins] = useState<AdminItem[]>([]);
    const [loadingList, setLoadingList] = useState(false);

    // búsqueda
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return admins;
        return admins.filter((a) => {
        return (
            a.correo.toLowerCase().includes(s) ||
            a.username.toLowerCase().includes(s) ||
            a.nombre.toLowerCase().includes(s) ||
            a.apellido.toLowerCase().includes(s) ||
            a.tipo_usuario.toLowerCase().includes(s) ||
            String(a.id_usuario).includes(s)
        );
        });
    }, [admins, q]);

    // LISTAR (GET /api/v1/root)
    async function fetchAdmins() {
        try {
        setLoadingList(true);
        const { data } = await api.get("/root");
        const list: any[] = Array.isArray(data) ? data : data?.admins ?? data?.data ?? [];
        const normalized = list.map(mapAdminResponse).filter(Boolean) as AdminItem[];
        setAdmins(normalized);
        } catch (e: any) {
        console.error("Error al listar administradores:", e?.response?.data || e);
        } finally {
        setLoadingList(false);
        }
    }

    useEffect(() => {
        fetchAdmins();
    }, []);

    return (
        <div className="mx-auto max-w-7xl p-6 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold">Administradores</h1>
            <p className="text-sm text-gray-500">
                Consulta y gestiona las cuentas de tipo <span className="font-medium">admin</span>.
            </p>
            </div>

            <div className="flex gap-2">
            <button
                onClick={() => navigate("/panelAdministrador/root/create-admin")}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                Registrar nuevo administrador
            </button>
            <button
                onClick={fetchAdmins}
                disabled={loadingList}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
                {loadingList ? "Actualizando…" : "Actualizar lista"}
            </button>
            </div>
        </header>

        {/* Filtro */}
        <div className="flex items-center justify-between gap-3">
            <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, correo, username, tipo o id…"
            className="w-full sm:w-80 rounded-xl border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Apellido</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Correo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Debe cambiar</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Creado en</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    Sin administradores para mostrar.
                    </td>
                </tr>
                ) : (
                filtered.map((a) => (
                    <tr key={a.id_usuario} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{a.nombre}</td>
                    <td className="px-4 py-3">{a.apellido}</td>
                    <td className="px-4 py-3">{a.username}</td>
                    <td className="px-4 py-3">{a.correo}</td>
                    <td className="px-4 py-3">{a.tipo_usuario}</td>
                    <td className="px-4 py-3">
                        <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            a.must_change_password
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                        >
                        {a.must_change_password ? "Sí" : "No"}
                        </span>
                    </td>
                    <td className="px-4 py-3">{formatDateISO(a.creado_en)}</td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
    };

    export default Root;
