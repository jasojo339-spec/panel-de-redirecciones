"use client";

import { useState } from "react";
import { useActionState } from "react";
import { acceder } from "@/app/actions";

const inputCls =
  "w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition";

export default function LoginForm() {
  const [state, action, pending] = useActionState(acceder, null);

  // Inputs controlados: así lo que escribiste no se borra si la contraseña
  // sale mal (React limpia los formularios sin controlar tras cada envío).
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-slate-300">
        Usuario
        <input
          name="usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="username"
          required
          className={inputCls}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-slate-300">
        Contraseña
        <input
          name="clave"
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </label>

      {state?.error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 border border-rose-400/30 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-900 font-semibold py-2.5 disabled:opacity-60 transition hover:brightness-110"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
