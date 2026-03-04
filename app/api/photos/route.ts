import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(Array.isArray(photos) ? photos : []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isVercel = process.env.VERCEL === "1";
    const uploadDir = isVercel ? "/tmp/uploads" : path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const url = isVercel ? `/api/images/${uniqueName}` : `/uploads/${uniqueName}`;

    const photo = await prisma.photo.create({
      data: {
        filename: uniqueName,
        url,
      },
      include: { comments: true },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}