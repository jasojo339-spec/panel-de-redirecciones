import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Panel from "@/components/Panel";

// Se ejecuta en el servidor, en cada petición: siempre lee la base fresca
async function Destinos() {
  const destinos = await prisma.destino.findMany({
    where: { activo: true },
    orderBy: [{ categoria: "asc" }, { orden: "asc" }, { id: "asc" }],
    select: {
      id: true,
      nombre: true,
      url: true,
      descripcion: true,
      categoria: true,
      icono: true,
      color: true,
      visitas: true,
    },
  });

  return <Panel destinos={destinos} />;
}

export default function Page() {
  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          Panel de Redirecciones
        </h1>
        <p className="text-slate-400 mt-3">
          Selecciona el destino al que quieres acceder
        </p>
      </header>

      <Suspense
        fallback={
          <p className="text-center text-slate-400 py-20">Cargando destinos…</p>
        }
      >
        <Destinos />
      </Suspense>
    </main>
  );
}
