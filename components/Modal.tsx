"use client";

// Modal genérico: se cierra con ✕, con Escape o haciendo clic en el fondo.
import { useEffect } from "react";

export function Modal({
  titulo,
  children,
  onCerrar,
}: {
  titulo: string;
  children: React.ReactNode;
  onCerrar: () => void;
}) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [onCerrar]);

  return (
    <div
      // Click en el fondo gris cierra el modal
      onClick={onCerrar}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()} // el click dentro no cierra
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-100">{titulo}</h3>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-rose-400/50 hover:text-rose-300"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// Estilo de los campos de formulario, compartido por los modales
export const inputCls =
  "w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition";

// Botón principal (degradado), usado por los modales de alta/edición
export const btnPrimario =
  "flex-1 rounded-lg bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-900 text-sm font-semibold py-2.5 disabled:opacity-60 transition hover:brightness-110";

export const btnSecundario =
  "flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 transition hover:border-slate-500";

// Fila-opción del menú de un modal de acciones
export function Opcion({
  icono,
  titulo,
  detalle,
  onClick,
  peligro = false,
  disabled = false,
}: {
  icono: string;
  titulo: string;
  detalle: string;
  onClick: () => void;
  peligro?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition disabled:opacity-60 ${
        peligro
          ? "border-rose-400/30 bg-rose-400/5 hover:bg-rose-400/15 hover:border-rose-400/60"
          : "border-slate-700 bg-slate-900/40 hover:border-sky-400 hover:bg-slate-900/80"
      }`}
    >
      <span className="text-xl" aria-hidden="true">
        {icono}
      </span>
      <span className="min-w-0">
        <span
          className={`block text-sm font-medium ${
            peligro ? "text-rose-300" : "text-slate-100"
          }`}
        >
          {titulo}
        </span>
        <span className="block text-xs text-slate-500">{detalle}</span>
      </span>
      <span className="ml-auto text-slate-600" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
