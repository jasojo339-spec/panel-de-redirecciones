import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Acceso — Panel de Redirecciones" };

export default function LoginPage() {
  // getUsuario() lee cookies() -> va dentro de <Suspense>
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
  if (usuario) redirect("/admin");

  return (
    <main className="flex-1 flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800/70 border border-slate-700 p-8 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-bold text-center text-slate-100">
          🔒 Acceso
        </h1>
        <p className="text-sm text-slate-400 text-center mt-2 mb-6">
          Zona de administración
        </p>

        <LoginForm />

        <p className="text-xs text-slate-500 text-center mt-6">
          Usuario y contraseña definidos en el archivo <code>.env</code>
        </p>
      </div>
    </main>
  );
}
