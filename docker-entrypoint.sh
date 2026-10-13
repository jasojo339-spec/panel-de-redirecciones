#!/bin/sh
# Se ejecuta cada vez que arranca el contenedor.
set -e

# La contraseña del admin NUNCA se guarda dentro de la imagen: se pasa con
#   docker run ... -e ADMIN_PASSWORD="tu-clave"
if [ -z "$ADMIN_PASSWORD" ]; then
  echo "============================================================"
  echo "ERROR: falta ADMIN_PASSWORD."
  echo "Arrancá el contenedor con la contraseña del panel /admin:"
  echo ""
  echo "  docker run -d --name panel -p 3000:3000 \\"
  echo "    -v \"\$PWD/data:/app/data\" \\"
  echo "    -e ADMIN_PASSWORD=\"4dm1n!\" \\"
  echo "    panel-redirecciones"
  echo "============================================================"
  exit 1
fi

echo "==> Aplicando migraciones de la base de datos..."
npx prisma migrate deploy

echo "==> Base lista en ${DATABASE_URL}"
echo "==> Panel de administración: usuario ${ADMIN_USER:-admin}"

exec "$@"
