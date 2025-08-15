import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const config = {
  api: {
    bodyParser: false, // necesario para manejar FormData
  },
};

export async function GET(request, context) {
  const { params } = await context;
  try {
    const game = await prisma.games.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        platform: true,
        category: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("❌ Error en GET /games/[id]:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { params } = await context;
  try {
    const id = parseInt(params.id);
    const game = await prisma.games.delete({ where: { id } });

    return NextResponse.json({
      mensaje: "Game eliminado correctamente",
      game,
    });
  } catch (error) {
    console.error("❌ Error en DELETE /games/[id]:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { params } = await context;
  try {
    const id = parseInt(params.id);
    const formData = await request.formData();

    const title = formData.get("title");
    const platform_id = parseInt(formData.get("platform_id"));
    const category_id = parseInt(formData.get("category_id"));
    const year = parseInt(formData.get("year"));
    const version = formData.get("version");
    const file = formData.get("cover");

    let coverPath;

    // Si se envió nueva imagen, la guardamos
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = Date.now() + "_" + file.name;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      coverPath = `/uploads/${fileName}`;
    }

    const game = await prisma.games.update({
      where: { id },
      data: {
        title,
        platform_id,
        category_id,
        year,
        version, // <-- agrega aquí
        ...(coverPath && { cover: coverPath }),
      },
    });

    return NextResponse.json({
      mensaje: "Game actualizado correctamente",
      game,
    });
  } catch (error) {
    console.error("❌ Error en PUT /games/[id]:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}