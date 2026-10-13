"use client";

// Panel de tarjetas: buscador + filtros por categoría.
// Los datos llegan del servidor (desde la base SQLite) como props.
import { useMemo, useState } from "react";

export type Destino = {
  id: number;
  nombre: string;
  url: string;
  descripcion: string;
  categoria: string;
  icono: string;
  color: string;
  visitas: number;
};

export default function Panel({ destinos }: { destinos: Destino[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const categorias = useMemo(
    () => ["Todas", ...Array.from(new Set(destinos.map((d) => d.categoria)))],
    [destinos],
  );

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return destinos.filter((d) => {
      const okCat = categoria === "Todas" || d.categoria === categoria;
      const okTxt =
        !q ||
        `${d.nombre} ${d.descripcion} ${d.categoria} ${d.url}`
          .toLowerCase()
          .includes(q);
      return okCat && okTxt;
    });
  }, [destinos, busqueda, categoria]);

  if (destinos.length === 0) {
    return (
      <p className="text-center text-slate-400 py-20">
        No hay destinos cargados todavía. Agrega algunos desde{" "}
        <a href="/admin" className="text-sky-400 underline">
          /admin
        </a>
        .
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar destino..."
          className="w-full sm:max-w-sm rounded-full bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition"
        />

        <div className="flex flex-wrap gap-2 justify-center">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`px-4 py-1.5 rounded-full text-xs border transition ${
                categoria === c
                  ? "bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-900 border-transparent font-semibold"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-100 hover:border-sky-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((d) => (
          <a
            key={d.id}
            href={`/go/${d.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 p-5 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-sky-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition duration-200"
          >
            <div className="flex items-center gap-3">
              <span
                className="grid place-items-center w-11 h-11 rounded-xl text-lg shrink-0"
                style={{ backgroundColor: d.color }}
              >
                {d.icono}
              </span>
              <h3 className="font-semibold text-slate-100">{d.nombre}</h3>
            </div>

            <p className="text-sm text-slate-400 flex-1">
              {d.descripcion || d.url}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-dashed border-slate-700 pt-3">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-400/15 text-indigo-300 border border-indigo-400/30">
                {d.categoria}
              </span>
              <span className="group-hover:text-sky-400 font-medium transition">
                Abrir →
              </span>
            </div>
          </a>
        ))}
      </div>

      {lista.length === 0 && (
        <p className="text-center text-slate-400 py-16">
          No se encontraron destinos.
        </p>
      )}

      <p className="text-center text-xs text-slate-500 mt-8">
        {lista.length} de {destinos.length} destinos
      </p>
    </>
  );
}
