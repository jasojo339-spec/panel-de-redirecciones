-- CreateTable
CREATE TABLE "Destino" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "categoria" TEXT NOT NULL DEFAULT 'Otros',
    "icono" TEXT NOT NULL DEFAULT '🔗',
    "color" TEXT NOT NULL DEFAULT '#38bdf8',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "visitas" INTEGER NOT NULL DEFAULT 0,
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Credencial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "servicio" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "creado" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Destino_categoria_idx" ON "Destino"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Credencial_servicio_usuario_key" ON "Credencial"("servicio", "usuario");
