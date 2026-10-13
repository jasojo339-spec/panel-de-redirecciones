"use client";

// Gestión de credenciales de los servicios.
// Se muestran ocultas por defecto; hay un botón para revelarlas.
import { useState } from "react";
import { useActionState } from "react";
import type { Credencial } from "@prisma/client";
import { borrarCredencial, guardarCredencial } from "@/app/actions";

const inputCls =
  "w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition";

export default function AdminCredenciales({
  credenciales,
}: {
  credenciales: Credencial[];
}) {
  const [estado, action, pending] = useActionState(guardarCredencial, null);
  const [visibles, setVisibles] = useState<Set<number>>(new Set());

  const alternar = (id: number) => {
    setVisibles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* ---- Formulario ---- */}
      <form
        action={action}
        className="h-fit rounded-xl bg-slate-800/70 border border-slate-700 p-5 flex flex-col gap-3"
      >
        <p className="text-sm font-semibold text-slate-300 mb-1">
          Agregar / actualizar credencial
        </p>
        <p className="text-xs text-slate-500 -mt-2">
          Si el servicio y usuario ya existen, se actualiza la contraseña.
        </p>

        <input name="servicio" placeholder="Servicio (ej. Gmail) *" required className={inputCls} />
        <input name="usuario" placeholder="Usuario *" required className={inputCls} />
        <input name="password" placeholder="Contraseña *" required className={inputCls} />
        <input name="url" placeholder="URL de acceso" className={inputCls} />
        <input name="notas" placeholder="Notas" className={inputCls} />

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
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {/* ---- Listado ---- */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Servicio</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Contraseña</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {credenciales.map((c) => (
              <tr
                key={c.id}
                className="border-t border-slate-800 hover:bg-slate-800/40"
              >
                <td className="px-4 py-3">
                  <p className="text-slate-100 font-medium">{c.servicio}</p>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline"
                    >
                      {c.url}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{c.usuario}</td>
                <td className="px-4 py-3 font-mono text-slate-300">
                  {visibles.has(c.id) ? c.password : "••••••••"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => alternar(c.id)}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-400 transition"
                    >
                      {visibles.has(c.id) ? "Ocultar" : "Ver"}
                    </button>
                    <form action={borrarCredencial}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/20 transition">
                        Borrar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {credenciales.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No hay credenciales cargadas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
