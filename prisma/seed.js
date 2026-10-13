// Carga los datos iniciales en la base de datos.
// Uso:  npm run seed   (borra todo y vuelve a cargar)
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DESTINOS = [
  {
    nombre: "Google",
    url: "https://www.google.com",
    descripcion: "Buscador principal.",
    categoria: "Buscadores",
    icono: "🔍",
    color: "#4285F4",
    orden: 1,
  },
  {
    nombre: "YouTube",
    url: "https://www.youtube.com",
    descripcion: "Plataforma de videos.",
    categoria: "Entretenimiento",
    icono: "▶️",
    color: "#FF0000",
    orden: 2,
  },
  {
    nombre: "GitHub",
    url: "https://github.com",
    descripcion: "Repositorios de código.",
    categoria: "Desarrollo",
    icono: "💻",
    color: "#8b949e",
    orden: 3,
  },
  {
    nombre: "Gmail",
    url: "https://mail.google.com",
    descripcion: "Correo electrónico.",
    categoria: "Correo",
    icono: "✉️",
    color: "#EA4335",
    orden: 4,
  },
  {
    nombre: "Dashboard",
    url: "https://example.com/dashboard",
    descripcion: "Panel interno de métricas.",
    categoria: "Interno",
    icono: "📊",
    color: "#38bdf8",
    orden: 5,
  },
  {
    nombre: "Portal de acceso",
    url: "https://example.com/portal",
    descripcion: "Portal con credenciales.",
    categoria: "Interno",
    icono: "🔑",
    color: "#fbbf24",
    orden: 6,
  },
];

async function main() {
  console.log("Borrando datos anteriores...");
  await prisma.destino.deleteMany();

  console.log(`Insertando ${DESTINOS.length} destinos...`);
  for (const d of DESTINOS) {
    await prisma.destino.create({ data: d });
  }

  const total = await prisma.destino.count();
  console.log(`Listo. Destinos en la base: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
