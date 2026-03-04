import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, text } = body;

    if (!photoId || !text?.trim()) {
      return NextResponse.json(
        { error: "photoId and text are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        photoId: Number(photoId),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}