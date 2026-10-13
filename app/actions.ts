"use server";

// Server Actions: toda la lógica de escritura pasa por acá.
// IMPORTANTE: cada acción verifica la sesión por su cuenta (las actions
// son accesibles por POST directo, no solo desde la UI).
//
// Las acciones que se usan con useActionState() reciben (estadoAnterior, formData)
// Las que van directo en <form action={...}> reciben solo (formData).
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  crearSesion,
  destruirSesion,
  getUsuario,
  verificarClaves,
} from "@/lib/auth";

export type Resultado = { error?: string; ok?: boolean } | null;

async function exigirAdmin() {
  const usuario = await getUsuario();
  if (!usuario) throw new Error("No autorizado");
  return usuario;
}

function texto(valor: FormDataEntryValue | null): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/* ------------------------- Sesión ------------------------- */

export async function acceder(
  _prev: Resultado,
  formData: FormData,
): Promise<Resultado> {
  const usuario = texto(formData.get("usuario"));
  const clave = texto(formData.get("clave"));

  if (!verificarClaves(usuario, clave)) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  await crearSesion(usuario);
  redirect("/admin");
}

export async function salir() {
  await destruirSesion();
  redirect("/login");
}

/* ----------------------- Destinos ------------------------- */

export async function crearDestino(
  _prev: Resultado,
  formData: FormData,
): Promise<Resultado> {
  await exigirAdmin();

  const nombre = texto(formData.get("nombre"));
  const url = texto(formData.get("url"));

  if (!nombre || !url) {
    return { error: "Nombre y URL son obligatorios" };
  }

  await prisma.destino.create({
    data: {
      nombre,
      url,
      descripcion: texto(formData.get("descripcion")),
      categoria: texto(formData.get("categoria")) || "Otros",
      icono: texto(formData.get("icono")) || "🔗",
      color: texto(formData.get("color")) || "#38bdf8",
    },
  });

  refrescar();
  return { ok: true };
}

// Se usa directo en <form action={borrarDestino}>, por eso recibe solo formData
// y no devuelve nada (React exige void para <form action>)
export async function borrarDestino(formData: FormData): Promise<void> {
  await exigirAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await prisma.destino.delete({ where: { id } });
  refrescar();
}

// Se usa directo en <form action={alternarDestino}>, por eso recibe solo formData
export async function alternarDestino(formData: FormData): Promise<void> {
  await exigirAdmin();

  const id = Number(formData.get("id"));
  const destino = await prisma.destino.findUnique({ where: { id } });
  if (!destino) return;

  await prisma.destino.update({
    where: { id },
    data: { activo: !destino.activo },
  });

  refrescar();
}

/* --------------------- Credenciales ----------------------- */

export async function guardarCredencial(
  _prev: Resultado,
  formData: FormData,
): Promise<Resultado> {
  await exigirAdmin();

  const servicio = texto(formData.get("servicio"));
  const usuarioServicio = texto(formData.get("usuario"));
  const password = texto(formData.get("password"));

  if (!servicio || !usuarioServicio || !password) {
    return { error: "Servicio, usuario y contraseña son obligatorios" };
  }

  await prisma.credencial.upsert({
    where: { servicio_usuario: { servicio, usuario: usuarioServicio } },
    update: {
      password,
      url: texto(formData.get("url")),
      notas: texto(formData.get("notas")),
    },
    create: {
      servicio,
      usuario: usuarioServicio,
      password,
      url: texto(formData.get("url")),
      notas: texto(formData.get("notas")),
    },
  });

  refrescar();
  return { ok: true };
}

// Se usa directo en <form action={borrarCredencial}>, por eso recibe solo formData
export async function borrarCredencial(formData: FormData): Promise<void> {
  await exigirAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await prisma.credencial.delete({ where: { id } });
  refrescar();
}

/* ------------------------------------------------------------ */

// Vuelve a generar las páginas para que se vean los cambios
function refrescar() {
  revalidatePath("/");
  revalidatePath("/admin");
}
