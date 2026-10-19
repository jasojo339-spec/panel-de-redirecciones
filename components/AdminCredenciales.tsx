"use client";

// Gestión de credenciales de los servicios.
//  - Botón "＋ Añadir credencial" (cabecera) → modal de alta
//  - Botón "⋯ Acciones" (por fila) → modal que engloba Editar / Ver contraseña / Borrar
// Las contraseñas se muestran ocultas por defecto.
import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import type { Credencial } from "@prisma/client";
import {
  btnPrimario,
  btnSecundario,
  inputCls,
  Modal,
  Opcion,
} from "@/components/Modal";
import {
  actualizarCredencial,
  borrarCredencial,
  guardarCredencial,
} from "@/app/actions";

const btnFantasma =
  "rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-sky-400 transition";

export default function AdminCredenciales({
  credenciales,
}: {
  credenciales: Credencial[];
}) {
  const [visibles, setVisibles] = useState<Set<number>>(new Set());

  // Credencial seleccionada en la tabla y qué vista tiene el modal
  const [seleccion, setSeleccion] = useState<Credencial | null>(null);
  const [vista, setVista] = useState<"acciones" | "editar">("acciones");

  const alternarVisibilidad = (id: number) =>
    setVisibles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const cerrarModal = () => {
    setSeleccion(null);
    setVista("acciones");
  };

  // Sin credenciales no se muestra nada debajo del encabezado:
  // se agregan con el botón "＋ Añadir credencial" de la cabecera.
  if (credenciales.length === 0) return null;

  return (
    <>
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
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSeleccion(c)}
                      aria-label={`Acciones de ${c.servicio}`}
                      className={btnFantasma}
                    >
                      ⋯ Acciones
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Modal de acciones / edición ---- */}
      {seleccion && (
        <Modal
          titulo={vista === "editar" ? "Editar credencial" : "Acciones"}
          onCerrar={cerrarModal}
        >
          {vista === "editar" ? (
            <FormEditar credencial={seleccion} onExito={cerrarModal} />
          ) : (
            <MenuAcciones
              credencial={seleccion}
              oculta={!visibles.has(seleccion.id)}
              onAlternar={() => alternarVisibilidad(seleccion.id)}
              onEditar={() => setVista("editar")}
              onCerrar={cerrarModal}
            />
          )}
        </Modal>
      )}
    </>
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

/* ------------- Menú de acciones de una credencial ------------- */

function MenuAcciones({
  credencial,
  oculta,
  onAlternar,
  onEditar,
  onCerrar,
}: {
  credencial: Credencial;
  oculta: boolean;
  onAlternar: () => void;
  onEditar: () => void;
  onCerrar: () => void;
}) {
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [pendiente, correr] = useTransition();

  const borrar = () =>
    correr(async () => {
      const fd = new FormData();
      fd.append("id", String(credencial.id));
      await borrarCredencial(fd);
      onCerrar();
    });

  return (
    <div className="flex flex-col gap-3">
      {/* Ficha de la credencial */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-400/15 text-lg">
            🔑
          </span>
          <div className="min-w-0">
            <p className="font-medium text-slate-100 truncate">
              {credencial.servicio}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {credencial.usuario}
            </p>
          </div>
          <span
            className={`ml-auto shrink-0 text-xs px-2.5 py-1 rounded-full border ${
              oculta
                ? "text-slate-400 bg-slate-700/30 border-slate-600"
                : "text-amber-300 bg-amber-400/10 border-amber-400/30"
            }`}
          >
            {oculta ? "Oculta" : "Visible"}
          </span>
        </div>

        {credencial.url && (
          <a
            href={credencial.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block pl-[52px] text-xs text-sky-400 hover:underline truncate"
          >
            {credencial.url}
          </a>
        )}
        {credencial.notas && (
          <p className="mt-1 pl-[52px] text-xs text-slate-500 truncate">
            {credencial.notas}
          </p>
        )}
      </div>

      {confirmarBorrado ? (
        <>
          <p className="text-sm text-slate-300">
            ¿Seguro que querés borrar la credencial de{" "}
            <span className="font-semibold text-slate-100">
              {credencial.servicio}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => setConfirmarBorrado(false)}
              disabled={pendiente}
              className={btnSecundario + " disabled:opacity-60"}
            >
              Cancelar
            </button>
            <button
              onClick={borrar}
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
            detalle="Cambiar servicio, usuario, contraseña, URL o notas"
            onClick={onEditar}
          />
          <Opcion
            icono={oculta ? "👁️" : "🙈"}
            titulo={oculta ? "Ver contraseña" : "Ocultar contraseña"}
            detalle={
              oculta
                ? "Muestra la contraseña en la tabla"
                : "La vuelve a tapar con puntos"
            }
            disabled={pendiente}
            onClick={onAlternar}
          />
          <Opcion
            icono="🗑️"
            titulo="Borrar"
            detalle="Elimina la credencial de la base de datos"
            peligro
            onClick={() => setConfirmarBorrado(true)}
          />
        </>
      )}
    </div>
  );
}

/* ------------- Campos compartidos del formulario ------------- */

function CamposCredencial({ credencial }: { credencial?: Credencial }) {
  return (
    <>
      <input
        name="servicio"
        placeholder="Servicio (ej. Gmail) *"
        required
        defaultValue={credencial?.servicio ?? ""}
        autoFocus={!credencial}
        className={inputCls}
      />
      <input
        name="usuario"
        placeholder="Usuario *"
        required
        defaultValue={credencial?.usuario ?? ""}
        className={inputCls}
      />
      <input
        name="password"
        placeholder={
          credencial
            ? "Nueva contraseña (vacío = mantener la actual)"
            : "Contraseña *"
        }
        // Al editar es opcional: vacío conserva la contraseña que ya tenía
        required={!credencial}
        className={inputCls}
      />
      <input
        name="url"
        placeholder="URL de acceso"
        defaultValue={credencial?.url ?? ""}
        className={inputCls}
      />
      <input
        name="notas"
        placeholder="Notas"
        defaultValue={credencial?.notas ?? ""}
        className={inputCls}
      />
    </>
  );
}

/* ------------- Formulario de alta ------------- */

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

      <CamposCredencial />

      {estado?.error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
          {estado.error}
        </p>
      )}

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onExito} className={btnSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={pendiente} className={btnPrimario}>
          {pendiente ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

/* ------------- Formulario de edición ------------- */

function FormEditar({
  credencial,
  onExito,
}: {
  credencial: Credencial;
  onExito: () => void;
}) {
  const [estado, action, pendiente] = useActionState(actualizarCredencial, null);

  useEffect(() => {
    if (estado?.ok) onExito();
  }, [estado, onExito]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={credencial.id} />

      <CamposCredencial credencial={credencial} />

      {estado?.error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
          {estado.error}
        </p>
      )}

      <div className="flex gap-3 mt-1">
        <button type="button" onClick={onExito} className={btnSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={pendiente} className={btnPrimario}>
          {pendiente ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
