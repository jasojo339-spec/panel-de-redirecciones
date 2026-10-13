# syntax=docker/dockerfile:1
# =====================================================================
#  Panel de Redirecciones — Next.js 16 + Prisma + SQLite
#  Build:  docker build -t panel-redirecciones .
#  Run:    docker run -d --name panel -p 3000:3000 \
#            -v "$PWD/data:/app/data" \
#            -e ADMIN_PASSWORD="4dm1n!" \
#            panel-redirecciones
#  (la contraseña va obligatoria por -e, no queda dentro de la imagen)
# =====================================================================

# ---------- Etapa 1: dependencias ----------
FROM node:22-slim AS deps
WORKDIR /app

# Copiamos solo los manifiestos para que esta capa se cachee
# mientras no cambien las versiones de los paquetes.
COPY package.json package-lock.json ./
RUN npm ci

# OpenSSL: sin el binario `openssl`, Prisma no detecta la versión del sistema
# y elige el motor equivocado (aviso "failed to detect the libssl/openssl").
# Va después de npm ci para no invalidar la caché de las dependencias.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------- Etapa 2: build ----------
FROM deps AS build
COPY . .

# Genera el cliente de Prisma y compila la app para producción
RUN npx prisma generate
RUN npm run build

# Dejamos solo las dependencias de producción (se descarta typescript,
# eslint, tipos, etc.)
RUN npm prune --omit=dev

# ---------- Etapa 3: imagen final ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    # Base de datos SQLite dentro del contenedor (montar volumen en /app/data)
    DATABASE_URL="file:/app/data/dev.db" \
    # Usuario del panel /admin
    ADMIN_USER=admin
# NOTA: ADMIN_PASSWORD no se define acá a propósito. Una contraseña dentro de
# un ENV queda guardada en las capas de la imagen (docker history la muestra).
# Se pasa al arrancar:  docker run ... -e ADMIN_PASSWORD="tu-clave"

# Copiamos el resultado del build (app compilada + dependencias de producción)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/next.config.ts ./next.config.ts

# La base de datos vive acá: usá un volumen para que no se pierda.
# - /app/data  → donde vive SQLite (lo montás con -v)
# - /app/.next → Next 16 escribe su caché de rutas en .next/server/route-cache
#                en tiempo de ejecución (sin esto aparece EACCES en los logs).
#   El -R acá es barato: .next tiene miles de archivos, node_modules cientos de
#   miles (por eso node_modules queda en solo lectura, propiedad de root).
RUN mkdir -p /app/data \
    && chown -R node:node /app/.next \
    && chown node:node /app/data

# OpenSSL para que Prisma detecte la versión del sistema (ver nota en deps)
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
