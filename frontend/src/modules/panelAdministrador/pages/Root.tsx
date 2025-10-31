    import React, { useEffect, useMemo, useState } from "react";
    import api from "../../../api/axios";

    type AdminItem = {
    id_usuario: number | string;
    correo: string;          // ← tal cual backend
    username: string;
    nombre: string;
    apellido: string;
    tipo_usuario: "root" | "admin" | "cliente" | string;
    must_change_password: boolean;
    creado_en?: string;
    };

    type NewAdmin = {
    nombre: string;
    apellido: string;
    correo: string;
    username: string;
    };

    const initialForm: NewAdmin = {
    nombre: "",
    apellido: "",
    correo: "",
    username: "",
    };

    function isEmailValid(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function mapAdminResponse(raw: any): AdminItem | null {
    if (!raw) return null;
    return {
        id_usuario: raw.id_usuario,
        correo: raw.correo,
        username: raw.username,
        nombre: raw.nombre,
        apellido: raw.apellido,
        tipo_usuario: raw.tipo_usuario,
        must_change_password:
        typeof raw.must_change_password === "boolean"
            ? raw.must_change_password
            : String(raw.must_change_password).toLowerCase() === "true" ||
            raw.must_change_password === 1 ||
            raw.must_change_password === "1",
        creado_en: raw.creado_en,
    };
    }

    function formatDateISO(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(); // puedes ajustar a tz/format preferido
    }

    const Root: React.FC = () => {
    // listado
    const [admins, setAdmins] = useState<AdminItem[]>([]);
    const [loadingList, setLoadingList] = useState(false);

    // crear admin (sin password)
    const [form, setForm] = useState<NewAdmin>(initialForm);
    const [creating, setCreating] = useState(false);

    // eliminar admin
    const [removingId, setRemovingId] = useState<number | string | null>(null);

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

    // =====================
    // LISTAR (GET /api/v1/root)
    // =====================
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

    // =====================
    // CREAR (POST /api/v1/root/admin) — backend genera password aleatoria
    // =====================
    async function createAdmin(payload: NewAdmin) {
        if (!payload.nombre.trim() || !payload.apellido.trim() || !payload.username.trim()) return;
        if (!isEmailValid(payload.correo)) return;
        try {
        setCreating(true);
        const { data } = await api.post("/root/admin", payload);
        const created = mapAdminResponse(data);
        if (created) setAdmins((prev) => [created, ...prev]);
        else await fetchAdmins();
        setForm(initialForm);
        } catch (e: any) {
        console.error("Error al crear admin:", e?.response?.data || e);
        } finally {
        setCreating(false);
        }
    }

    // =====================
    // ELIMINAR (DELETE /api/v1/root/admin) { correo }
    // =====================
    async function removeAdmin(target: AdminItem) {
        const correo = target.correo;
        if (!correo) return;
        if (!confirm(`¿Eliminar cuenta ADMIN de ${target.username || correo}?`)) return;
        try {
        setRemovingId(target.id_usuario);
        await api.delete("/root/admin", { data: { correo } });
        setAdmins((prev) => prev.filter((a) => a.correo !== correo));
        } catch (e: any) {
        console.error("Error al eliminar administrador:", e?.response?.data || e);
        } finally {
        setRemovingId(null);
        }
    }

    useEffect(() => {
        fetchAdmins();
    }, []);

    // =====================
    // UI
    // =====================
    return (
        <div className="mx-auto max-w-7xl p-6 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold">Gestión de Administradores</h1>
            <p className="text-sm text-gray-500">
                Crea y administra cuentas tipo <span className="font-medium">admin</span>. Las contraseñas se generan
                automáticamente y <span className="font-medium">must_change_password</span> fuerza el cambio en el primer login.
            </p>
            </div>

            <div className="flex gap-2">
            <button
                onClick={fetchAdmins}
                disabled={loadingList}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
                {loadingList ? "Actualizando…" : "Actualizar lista"}
            </button>
            </div>
        </header>

        {/* Crear ADMIN (sin contraseña) */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Crear nuevo administrador</h2>
            <p className="mb-4 text-sm text-gray-500">Ingresa los datos del nuevo administrador.</p>

            <form
            onSubmit={(e) => {
                e.preventDefault();
                createAdmin(form);
            }}
            className="grid gap-3 sm:grid-cols-2"
            >
            <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Juan"
                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Apellido *</label>
                <input
                value={form.apellido}
                onChange={(e) => setForm((p) => ({ ...p, apellido: e.target.value }))}
                placeholder="Pérez"
                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Correo *</label>
                <input
                value={form.correo}
                onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
                placeholder="juan.perez@ejemplo.com"
                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                type="email"
                />
            </div>

            <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="juanperez"
                className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <div className="sm:col-span-2">
                <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                {creating ? "Creando…" : "Crear administrador"}
                </button>
            </div>
            </form>
        </section>

        {/* Listado de ADMINS */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Administradores</h2>
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, correo, username, tipo o id…"
                className="w-full sm:w-80 rounded-xl border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

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
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.length === 0 && (
                    <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                        Sin administradores para mostrar.
                    </td>
                    </tr>
                )}

                {filtered.map((a) => (
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
                    <td className="px-4 py-3">
                        <div className="flex justify-end">
                        <button
                            onClick={() => removeAdmin(a)}
                            disabled={removingId === a.id_usuario}
                            className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                            {removingId === a.id_usuario ? "Eliminando…" : "Eliminar admin"}
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </section>
        </div>
    );
    };

    export default Root;
