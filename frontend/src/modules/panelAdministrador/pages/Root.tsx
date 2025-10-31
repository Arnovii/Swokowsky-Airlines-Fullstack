    import React, { useEffect, useMemo, useState } from "react";
    import api from "../../../api/axios"; // ✅ usa tu instancia axios
    // import { toast } from "react-toastify";

    type AdminItem = {
    id_usuario: number | string;
    email: string;
    username: string;
    nombre?: string;
    apellido?: string;
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

    // Mapea respuesta del backend a nuestro AdminItem
    function mapAdminResponse(anyData: any): AdminItem | null {
    if (!anyData) return null;
    const src = anyData.admin ?? anyData; // por si el backend envía { admin: {...} }
    return {
        id_usuario:
        src?.id_usuario ?? src?.id ?? src?.userId ?? Math.random().toString(36).slice(2, 8),
        email: src?.correo ?? src?.email ?? "",
        username: src?.username ?? "",
        nombre: src?.nombre ?? "",
        apellido: src?.apellido ?? "",
    };
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
        return admins.filter(
        (a) =>
            a.email.toLowerCase().includes(s) ||
            a.username.toLowerCase().includes(s) ||
            String(a.id_usuario).includes(s)
        );
    }, [admins, q]);

    // =====================
    // Carga inicial (placeholder hasta tener endpoint de listado)
    // =====================
    async function fetchAdmins() {
        try {
        setLoadingList(true);
        // Si luego agregas un endpoint de listado, úsalo así:
        // const { data } = await api.get("/root"); // <- cuando implementes el GET
        // const list = Array.isArray(data) ? data : data?.admins ?? [];
        // setAdmins(list.map(mapAdminResponse).filter(Boolean) as AdminItem[]);

        // MOCK de arranque si no hay endpoint aún:
        if (admins.length === 0) {
            setAdmins([
            { id_usuario: 4, email: "admin@swk.com", username: "admin", nombre: "Admin", apellido: "SWK" },
            ]);
        }
        } catch (e: any) {
        console.error(e);
        // toast?.error?.(e?.response?.data?.message || "No se pudo cargar admins");
        } finally {
        setLoadingList(false);
        }
    }

    // =====================
    // Crear admin usando tu endpoint real (ya funcionaba)
    // =====================
    async function createAdmin(payload: NewAdmin) {
        if (!payload.nombre.trim() || !payload.apellido.trim() || !payload.username.trim()) {
        // toast?.info?.("Completa nombre, apellido y username");
        return;
        }
        if (!isEmailValid(payload.correo)) {
        // toast?.info?.("Correo inválido");
        return;
        }

        try {
        setCreating(true);
        const { data } = await api.post("/root/admin", payload);
        const created = mapAdminResponse(data);
        if (created) {
            setAdmins((prev) => [created, ...prev]);
        }
        setForm(initialForm);
        // toast?.success?.("Administrador creado. La contraseña temporal fue generada.");
        } catch (e: any) {
        console.error(e);
        // toast?.error?.(e?.response?.data?.message || "No se pudo crear el admin");
        } finally {
        setCreating(false);
        }
    }

    // =====================
    // ✅ Eliminar admin (DELETE real a /root/admin con { correo })
    // =====================
    async function removeAdmin(target: AdminItem) {
        const correo = target.email;
        if (!correo) {
        console.warn("No se pudo eliminar: email vacío");
        return;
        }

        if (!confirm(`¿Eliminar cuenta ADMIN de ${target.username || correo}?`)) return;

        try {
        setRemovingId(target.id_usuario);

        await api.delete("/root/admin", {
            data: { correo }, // cuerpo esperado por el backend
        });

        // Actualiza la lista local
        setAdmins((prev) => prev.filter((a) => a.email !== correo));

        // toast?.success?.("Administrador eliminado");
        } catch (e: any) {
        console.error("Error al eliminar administrador:", e?.response?.data || e);
        // toast?.error?.(e?.response?.data?.message || "No se pudo eliminar el admin");
        } finally {
        setRemovingId(null);
        }
    }

    useEffect(() => {
        fetchAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =====================
    // RENDER
    // =====================
    return (
        <div className="mx-auto max-w-6xl p-6 space-y-6">
        <header className="flex items-start justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold">Gestión de Administradores</h1>
            </div>

            <button
            onClick={fetchAdmins}
            disabled={loadingList}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
            {loadingList ? "Actualizando…" : "Actualizar lista"}
            </button>
        </header>

        {/* Crear ADMIN (sin contraseña) */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Crear nuevo administrador</h2>
            <p className="mb-4 text-sm text-gray-500">Por favor ingrese los datos</p>

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
            <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Administradores</h2>
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por email, username o id…"
                className="w-full max-w-xs rounded-xl border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Usuario</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.length === 0 && (
                    <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                        Sin administradores para mostrar.
                    </td>
                    </tr>
                )}

                {filtered.map((a) => (
                    <tr key={a.id_usuario} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{a.username}</td>
                    <td className="px-4 py-3">{a.email}</td>
                    <td className="px-4 py-3">{a.id_usuario}</td>
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
