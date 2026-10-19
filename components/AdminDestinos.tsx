"use client";

// Gestión de destinos del panel:
//  - Botón "＋ Añadir"  → modal de alta
//  - Botón "⋯ Acciones" (por fila) → modal que engloba Editar / Ocultar / Borrar
import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import type { Destino } from "@prisma/client";
import { Modal, Opcion, inputCls } from "@/components/Modal";
import {
  alternarDestino,
  actualizarDestino,
  borrarDestino,
  crearDestino,
} from "@/app/actions";

const btnFantasma =
  "rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-400 transition";

const btnPeligro =
  "rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/20 transition";

export default function AdminDestinos({ destinos }: { destinos: Destino[] }) {
  // Destino seleccionado en la tabla y qué vista tiene el modal
  const [seleccion, setSeleccion] = useState<Destino | null>(null);
  const [vista, setVista] = useState<"acciones" | "editar">("acciones");

  const abrirAcciones = (d: Destino) => {
    setSeleccion(d);
    setVista("acciones");
  };

  const cerrarModal = () => {
    setSeleccion(null);
    setVista("acciones");
  };

  return (
    <>
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
                  <div className="flex justify-end">
                    <button
                      onClick={() => abrirAcciones(d)}
                      aria-label={`Acciones de ${d.nombre}`}
                      className={btnFantasma}
                    >
                      ⋯ Acciones
                    </button>
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

      {/* ---- Modal de acciones / edición ---- */}
      {seleccion && (
        <Modal
          titulo={vista === "editar" ? "Editar destino" : "Acciones"}
          onCerrar={cerrarModal}
        >
          {vista === "editar" ? (
            <FormEditar destino={seleccion} onExito={cerrarModal} />
          ) : (
            <MenuAcciones
              destino={seleccion}
              onEditar={() => setVista("editar")}
              onCerrar={cerrarModal}
            />
          )}
        </Modal>
      )}
    </>
  );
}

/* ------------- Botón "＋ Añadir" (va en la cabecera del admin) ------------- */

export function BotonAnadirDestino() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        data-testid="abrir-alta-destino"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-400 to-indigo-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
      >
        <span aria-hidden="true">＋</span> Añadir
      </button>

      {abierto && (
        <Modal titulo="Añadir destino" onCerrar={() => setAbierto(false)}>
          <FormDestino onExito={() => setAbierto(false)} />
        </Modal>
      )}
    </>
  );
}

/* ---------------------- Modal genérico ---------------------- */
// (vive en components/Modal.tsx y lo comparten destinos y credenciales)

/* ------------- Menú de acciones de un destino ------------- */

function MenuAcciones({
  destino,
  onEditar,
  onCerrar,
}: {
  destino: Destino;
  onEditar: () => void;
  onCerrar: () => void;
}) {
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [pendiente, correr] = useTransition();

  // Ejecuta una server action con el id del destino y cierra el modal
  const ejecutar = (accion: (fd: FormData) => Promise<void>) =>
    correr(async () => {
      const fd = new FormData();
      fd.append("id", String(destino.id));
      await accion(fd);
      onCerrar();
    });

  return (
    <div className="flex flex-col gap-3">
      {/* Ficha del destino que se está gestionando */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg"
          style={{ backgroundColor: destino.color }}
        >
          {destino.icono}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-slate-100 truncate">{destino.nombre}</p>
          <p className="text-xs text-slate-500 truncate">{destino.url}</p>
        </div>
        <span
          className={`ml-auto shrink-0 text-xs px-2.5 py-1 rounded-full border ${
            destino.activo
              ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/30"
              : "text-slate-400 bg-slate-700/30 border-slate-600"
          }`}
        >
          {destino.activo ? "Activo" : "Oculto"}
        </span>
      </div>

      {confirmarBorrado ? (
        <>
          <p className="text-sm text-slate-300">
            ¿Seguro que querés borrar{" "}
            <span className="font-semibold text-slate-100">{destino.nombre}</span>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => setConfirmarBorrado(false)}
              disabled={pendiente}
              className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 transition hover:border-slate-500 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={() => ejecutar(borrarDestino)}
              disabled={pendiente}
              className="flex-1 rounded-lg bg-rose-500/90 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
            >
              {pendiente ? "Borrando..." : "Sí, borrar"}
            </button>
          </div>
        </>
      ) : (
        <>
          <Opcion
            icono="✏️"
            titulo="Editar"
            detalle="Cambiar nombre, URL, categoría, icono o color"
            onClick={onEditar}
          />
          <Opcion
            icono={destino.activo ? "🙈" : "👁️"}
            titulo={destino.activo ? "Ocultar del panel" : "Activar en el panel"}
            detalle={
              destino.activo
                ? "Deja de mostrarse en el panel público"
                : "Vuelve a mostrarse en el panel público"
            }
            disabled={pendiente}
            onClick={() => ejecutar(alternarDestino)}
          />
          <Opcion
            icono="🗑️"
            titulo="Borrar"
            detalle="Elimina el destino de la base de datos"
            peligro
            onClick={() => setConfirmarBorrado(true)}
          />
        </>
      )}
    </div>
  );
}

// Fila-opción del menú de acciones → vive en components/Modal.tsx

/* ------------- Campos compartidos del formulario ------------- */

function CamposDestino({ destino }: { destino?: Destino }) {
  return (
    <>
      <input
        name="nombre"
        placeholder="Nombre *"
        required
        defaultValue={destino?.nombre ?? ""}
        autoFocus={!destino}
        className={inputCls}
      />
      <input
        name="url"
        placeholder="https://... *"
        required
        defaultValue={destino?.url ?? ""}
        className={inputCls}
      />
      <input
        name="descripcion"
        placeholder="Descripción"
        defaultValue={destino?.descripcion ?? ""}
        className={inputCls}
      />
      <input
        name="categoria"
        placeholder="Categoría (ej. Interno)"
        defaultValue={destino?.categoria === "Otros" ? "" : destino?.categoria ?? ""}
        className={inputCls}
      />
      <input
        name="icono"
        placeholder="Icono emoji (ej. 🔑)"
        defaultValue={destino?.icono ?? ""}
        className={inputCls}
      />

      <label className="flex items-center gap-2 text-sm text-slate-400">
        Color
        <input
          type="color"
          name="color"
          defaultValue={destino?.color ?? "#38bdf8"}
          className="h-8 w-14 rounded bg-transparent border border-slate-700 cursor-pointer"
        />
      </label>
    </>
  );
}

/* ------------- Formulario de alta (modal "Añadir") ------------- */

function FormDestino({ onExito }: { onExito: () => void }) {
  const [estado, action, pendiente] = useActionState(crearDestino, null);

  // Si el servidor confirmó, cerramos el modal (React ya limpió los campos)
  useEffect(() => {
    if (estado?.ok) onExito();
  }, [estado, onExito]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <CamposDestino />

      {estado?.error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
          {estado.error}
        </p>
      )}

      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onExito}
          className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 transition hover:border-slate-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pendiente}
          className="flex-1 rounded-lg bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-900 text-sm font-semibold py-2.5 disabled:opacity-60 transition hover:brightness-110"
        >
          {pendiente ? "Guardando..." : "Agregar"}
        </button>
      </div>
    </form>
  );
}

/* ------------- Formulario de edición (modal "Acciones") ------------- */

function FormEditar({
  destino,
  onExito,
}: {
  destino: Destino;
  onExito: () => void;
}) {
  const [estado, action, pendiente] = useActionState(actualizarDestino, null);

  useEffect(() => {
    if (estado?.ok) onExito();
  }, [estado, onExito]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={destino.id} />
      <CamposDestino destino={destino} />

      {estado?.error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
          {estado.error}
        </p>
      )}

      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onExito}
          className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 transition hover:border-slate-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pendiente}
          className="flex-1 rounded-lg bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-900 text-sm font-semibold py-2.5 disabled:opacity-60 transition hover:brightness-110"
        >
          {pendiente ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
