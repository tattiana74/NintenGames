import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const games = await prisma.games.findMany();
  return NextResponse.json(games);
}

export const config = {
  api: {
    bodyParser: false, // necesario para manejar FormData
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const platform_id = parseInt(formData.get("platform_id"));
    const category_id = parseInt(formData.get("category_id"));
    const year = parseInt(formData.get("year"));
    const file = formData.get("cover");
    const version = formData.get("version");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No se subió imagen válida" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = Date.now() + "_" + file.name;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);

    // Define coverPath aquí
    const coverPath = `/uploads/${fileName}`;

    const game = await prisma.games.create({
      data: {
        title,
        platform_id,
        category_id,
        year,
        version,
        cover: coverPath, // ya puedes usar coverPath directamente
      },
    });

    return NextResponse.json({ mensaje: "Game creado correctamente", game });
  } catch (error) {
    console.error("❌ Error en POST /games:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}