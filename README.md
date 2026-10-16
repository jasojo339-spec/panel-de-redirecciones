# Panel de Redirecciones (Next.js + Prisma + SQLite)


## Rutas

| Ruta     | Qué hace                                                        |
| -------- | --------------------------------------------------------------- |
| `/`      | Panel público: tarjetas con buscador y filtros por categoría     |
| `/go/1`  | Redirige al destino 1 y le suma una visita en la base de datos   |
| `/login` | Formulario de acceso al panel de administración                   |
| `/admin` | Alta/baja de destinos y gestión de credenciales (requiere sesión)|

## Arrancar el proyecto

```bash
cd Web
npm run dev        # servidor de desarrollo en http://localhost:3000
```

Versión de producción:

```bash
npm run build
npm start
```

## Comandos de la base de datos

```bash
npm run db:migrate   # crea/aplica migraciones (npx prisma migrate dev)
npm run db:push      # sincroniza el schema sin crear archivo de migración
npm run db:seed      # carga los datos de ejemplo (borra los destinos actuales)
npm run db:studio    # abre la interfaz web para ver/editar las tablas
```

Archivos importantes:

- `prisma/schema.prisma` → definición de las tablas (`Destino`, `Credencial`)
- `prisma/dev.db` → la base de datos SQLite (no se commitea)
- `prisma/seed.js` → datos de ejemplo
- `lib/prisma.ts` → cliente de Prisma (singleton)
- `app/actions.ts` → server actions: toda la escritura pasa por ahí

## Acceso al panel de administración

Usuario y contraseña salen del archivo `.env`:

```
ADMIN_USER=admin
ADMIN_PASSWORD=4dm1n!
```

**Cámbialos** antes de usarlo de verdad. La sesión se guarda en una cookie
firmada con HMAC (`lib/auth.ts`) y dura 7 días.

## Cómo agregar destinos

- Desde la interfaz: `/admin` → sección **Destinos**.
- O cargando datos de ejemplo: editá `prisma/seed.js` y ejecutá `npm run db:seed`.
- O desde una consulta directa a la base (por ejemplo con `npm run db:studio`).

## Estructura

```
Web/
├── app/
│   ├── page.tsx            # panel público (lee la base en el servidor)
│   ├── layout.tsx          # layout común con la barra de navegación
│   ├── actions.ts          # server actions (crear/borrar/borrar credenciales...)
│   ├── go/[id]/route.ts    # redirección + contador de visitas
│   ├── login/              # página y formulario de acceso
│   └── admin/              # panel de administración
├── components/             # componentes de cliente (Panel, tablas del admin)
├── lib/                    # prisma.ts (cliente) y auth.ts (sesión)
└── prisma/                 # schema, migraciones, seed y la base dev.db
```

## Docker

El proyecto se puede correr contenedorizado. El `Dockerfile` es multi-etapa:
instala dependencias, compila con Next, descarta los devDependencies y genera
una imagen final chiquita que arranca el servidor.

```bash
cd Web

# 1) Crear la carpeta de la base de datos ANTES de arrancar el contenedor.
#    Si la crea Docker solo, la crea como root y SQLite no puede escribir en ella.
mkdir -p data

# 2) Construir la imagen
docker build -t panel-redirecciones .

# 3) Correr el contenedor con volumen para la base de datos
docker run -d --name panel -p 3000:3000 \
  -v "$PWD/data:/app/data" \
  -e ADMIN_PASSWORD="4dm1n!" \
  panel-redirecciones

# 4) Verificar
docker logs -f panel
curl -I http://localhost:3000
```

> Si ya tenés `npm run dev` o `npm start` ocupando el 3000 en la máquina,
> usá otro puerto: `-p 3200:3000` → http://localhost:3200

Detalles importantes:

- **Base de datos**: dentro de la imagen está en `/app/data/dev.db`
  (`DATABASE_URL`). El volumen `-v "$PWD/data:/app/data"` hace que los datos
  sobrevivan a `docker rm` / `docker build`.
- **Migraciones**: `docker-entrypoint.sh` corre `npx prisma migrate deploy`
  cada vez que el contenedor arranca, así que la base se crea sola.
- **Credenciales**: el usuario viene por `ENV` en el Dockerfile
  (`ADMIN_USER=admin`), pero **la contraseña no se guarda en la imagen** (queda
  en las capas y `docker history` la mostraría): hay que pasarla al arrancar.
  Si falta, el contenedor no arranca y avisa:

  ```bash
  docker run -d --name panel -p 3000:3000 \
    -v "$PWD/data:/app/data" \
    -e ADMIN_USER=admin \
    -e ADMIN_PASSWORD="4dm1n!" \
    panel-redirecciones
  ```

- **Cargar los datos de ejemplo** (una sola vez):

  ```bash
  docker exec panel npm run db:seed
  ```

- **Ver las tablas**: `docker exec panel npx prisma studio` (puerto 5555,
  hay que publicarlo con `-p 5555:5555` al crear el contenedor).

- **Comandos útiles**:

  ```bash
  docker stop panel       # parar
  docker start panel      # volver a arrancar (conserva los datos)
  docker rm -f panel      # borrar el contenedor
  docker rmi panel-redirecciones  # borrar la imagen
  ```

## Notas

- Las páginas que leen cookies o la base van dentro de `<Suspense>` porque el
  proyecto tiene `cacheComponents: true` (modelo nuevo de Next 16).
- Cada server action verifica la sesión por su cuenta: las actions son
  alcanzables por POST directo, no solo desde la UI.
- Las contraseñas se guardan **en texto plano** en la tabla `Credencial`:
  está bien para un gestor personal propio, pero si esto se publica en internet
  hay que cifrarlas.
