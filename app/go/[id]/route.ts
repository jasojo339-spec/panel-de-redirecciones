// /go/1  ->  suma una visita en la base de datos y redirige al destino
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const destinoId = Number(id);

  if (!Number.isInteger(destinoId)) {
    return NextResponse.redirect(new URL("/", requestUrl(_request)));
  }

  const destino = await prisma.destino.findUnique({
    where: { id: destinoId },
  });

  if (!destino || !destino.activo) {
    return NextResponse.redirect(new URL("/", requestUrl(_request)));
  }

  // Contador de visitas (fire & forget: no frenamos la redirección)
  prisma.destino
    .update({
      where: { id: destinoId },
      data: { visitas: { increment: 1 } },
    })
    .catch(() => {});

  return NextResponse.redirect(destino.url);
}

function requestUrl(request: Request) {
  return new URL(request.url).origin;
}
