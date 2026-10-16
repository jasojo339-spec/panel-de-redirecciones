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
