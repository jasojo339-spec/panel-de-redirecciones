"use client";

// Alta, baja y activar/desactivar destinos del panel.
import { useActionState } from "react";
import type { Destino } from "@prisma/client";
import { alternarDestino, borrarDestino, crearDestino } from "@/app/actions";

const inputCls =
  "w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition";

export default function AdminDestinos({ destinos }: { destinos: Destino[] }) {
  const [estado, action, pending] = useActionState(crearDestino, null);

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* ---- Formulario de alta ---- */}
      <form
        action={action}
        className="h-fit rounded-xl bg-slate-800/70 border border-slate-700 p-5 flex flex-col gap-3"
      >
        <p className="text-sm font-semibold text-slate-300 mb-1">
          Agregar destino
        </p>

        <input name="nombre" placeholder="Nombre *" required className={inputCls} />
        <input name="url" placeholder="https://... *" required className={inputCls} />
        <input name="descripcion" placeholder="Descripción" className={inputCls} />
        <input name="categoria" placeholder="Categoría (ej. Interno)" className={inputCls} />
        <input name="icono" placeholder="Icono emoji (ej. 🔑)" className={inputCls} />

        <label className="flex items-center gap-2 text-sm text-slate-400">
          Color
          <input
            type="color"
            name="color"
            defaultValue="#38bdf8"
            className="h-8 w-14 rounded bg-transparent border border-slate-700 cursor-pointer"
          />
        </label>

        {estado?.error && (
          <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-lg bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-900 text-sm font-semibold py-2.5 disabled:opacity-60 transition hover:brightness-110"
        >
          {pending ? "Guardando..." : "Agregar"}
        </button>
      </form>

      {/* ---- Listado ---- */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Destino</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Visitas</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {destinos.map((d) => (
              <tr
                key={d.id}
                className="border-t border-slate-800 hover:bg-slate-800/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid place-items-center w-8 h-8 rounded-lg shrink-0"
                      style={{ backgroundColor: d.color }}
                    >
                      {d.icono}
                    </span>
                    <div>
                      <p className="text-slate-100 font-medium">{d.nombre}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[240px]">
                        {d.url}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{d.categoria}</td>
                <td className="px-4 py-3 text-slate-400">{d.visitas}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      d.activo
                        ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/30"
                        : "text-slate-400 bg-slate-700/30 border-slate-600"
                    }`}
                  >
                    {d.activo ? "Activo" : "Oculto"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <form action={alternarDestino}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-400 transition">
                        {d.activo ? "Ocultar" : "Activar"}
                      </button>
                    </form>
                    <form action={borrarDestino}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/20 transition">
                        Borrar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {destinos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Todavía no hay destinos cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
