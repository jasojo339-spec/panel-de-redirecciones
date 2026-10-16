"use client";

// Gestión de credenciales de los servicios.
// El formulario de alta vive en un modal que se abre con el botón
// "＋ Añadir credencial" de la cabecera del admin.
// Las contraseñas se muestran ocultas; hay un botón para revelarlas.
import { useEffect, useState } from "react";
import { useActionState } from "react";
import type { Credencial } from "@prisma/client";
import {
  btnPrimario,
  btnSecundario,
  inputCls,
  Modal,
} from "@/components/Modal";
import { borrarCredencial, guardarCredencial } from "@/app/actions";

const btnFantasma =
  "rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-400 transition";

const btnPeligro =
  "rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/20 transition";

export default function AdminCredenciales({
  credenciales,
}: {
  credenciales: Credencial[];
}) {
  const [visibles, setVisibles] = useState<Set<number>>(new Set());

  const alternar = (id: number) => {
    setVisibles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Sin credenciales no se muestra nada debajo del encabezado:
  // se agregan con el botón "＋ Añadir credencial" de la cabecera.
  if (credenciales.length === 0) return null;

  return (
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
                    className={btnFantasma}
                  >
                    {visibles.has(c.id) ? "Ocultar" : "Ver"}
                  </button>
                  <form action={borrarCredencial}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={btnPeligro}>Borrar</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------- Botón "＋ Añadir credencial" (va en la cabecera del admin) ------- */

export function BotonAnadirCredencial() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        data-testid="abrir-alta-credencial"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:border-sky-400 transition"
      >
        <span aria-hidden="true">＋</span> Añadir credencial
      </button>

      {abierto && (
        <Modal titulo="Añadir credencial" onCerrar={() => setAbierto(false)}>
          <FormCredencial onExito={() => setAbierto(false)} />
        </Modal>
      )}
    </>
  );
}

function FormCredencial({ onExito }: { onExito: () => void }) {
  const [estado, action, pendiente] = useActionState(guardarCredencial, null);

  // Si el servidor confirmó, cerramos el modal
  useEffect(() => {
    if (estado?.ok) onExito();
  }, [estado, onExito]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-xs text-slate-500 -mt-1">
        Si el servicio y el usuario ya existen, se actualiza la contraseña.
      </p>

      <input
        name="servicio"
        placeholder="Servicio (ej. Gmail) *"
        required
        autoFocus
        className={inputCls}
      />
      <input
        name="usuario"
        placeholder="Usuario *"
        required
        className={inputCls}
      />
      <input
        name="password"
        placeholder="Contraseña *"
        required
        className={inputCls}
      />
      <input name="url" placeholder="URL de acceso" className={inputCls} />
      <input name="notas" placeholder="Notas" className={inputCls} />

      {estado?.error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
          {estado.error}
        </p>
      )}

      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onExito}
          className={btnSecundario}
        >
          Cancelar
        </button>
        <button type="submit" disabled={pendiente} className={btnPrimario}>
          {pendiente ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
