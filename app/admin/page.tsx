import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { salir } from "@/app/actions";
import AdminDestinos from "@/components/AdminDestinos";
import AdminCredenciales from "@/components/AdminCredenciales";

export const metadata = { title: "Admin — Panel de Redirecciones" };

export default function AdminPage() {
  // La sección lee cookies() y la base de datos, así que se resuelve en
  // tiempo de request y va dentro de <Suspense> (Cache Components).
  return (
    <Suspense
      fallback={<p className="text-center text-slate-400 py-20">Cargando…</p>}
    >
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  const usuario = await getUsuario();
  if (!usuario) redirect("/login");

  const [destinos, credenciales] = await Promise.all([
    prisma.destino.findMany({ orderBy: [{ categoria: "asc" }, { id: "asc" }] }),
    prisma.credencial.findMany({ orderBy: { servicio: "asc" } }),
  ]);

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Administración</h1>
          <p className="text-slate-400 mt-1">
            Sesión de <span className="text-sky-400">{usuario}</span> ·{" "}
            {destinos.length} destinos · {credenciales.length} credenciales
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/"
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:border-sky-400 hover:text-slate-100 transition"
          >
            Ver panel
          </a>
          <form action={salir}>
            <button
              type="submit"
              className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm text-rose-300 hover:bg-rose-400/20 transition"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          🔗 Destinos
        </h2>
        <AdminDestinos destinos={destinos} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          🔑 Credenciales
        </h2>
        <AdminCredenciales credenciales={credenciales} />
      </section>
    </main>
  );
}
