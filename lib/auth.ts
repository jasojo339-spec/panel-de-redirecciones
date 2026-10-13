// Sesión de administrador con cookie firmada (HMAC-SHA256).
// Sin dependencias externas: usa solo node:crypto y las cookies de Next.
import { cookies } from "next/headers";
import crypto from "node:crypto";

const COOKIE = "panel_admin";
const SECRET = process.env.SESSION_SECRET ?? "cambia-esta-clave-en-produccion";

function firmar(valor: string): string {
  return crypto.createHmac("sha256", SECRET).update(valor).digest("hex").slice(0, 40);
}

/** Devuelve el usuario autenticado o null. */
export async function getUsuario(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;

  const [usuario, firma] = raw.split(".");
  if (!usuario || !firma) return null;
  if (firma !== firmar(usuario)) return null;

  return decodeURIComponent(usuario);
}

/** Valida contra ADMIN_USER / ADMIN_PASSWORD del .env */
export function verificarClaves(usuario: string, clave: string): boolean {
  const u = process.env.ADMIN_USER ?? "admin";
  const p = process.env.ADMIN_PASSWORD ?? "admin123";
  return usuario === u && clave === p;
}

export async function crearSesion(usuario: string): Promise<void> {
  const store = await cookies();
  const valor = `${encodeURIComponent(usuario)}.${firmar(usuario)}`;
  store.set(COOKIE, valor, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

export async function destruirSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
