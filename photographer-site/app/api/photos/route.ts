import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST upload photos to gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const galleryId = formData.get("galleryId") as string;
    const files = formData.getAll("files") as File[];

    if (!galleryId) {
      return NextResponse.json(
        { error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Verify gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", galleryId);
    await mkdir(uploadDir, { recursive: true });

    // Get current photo count for ordering
    const existingPhotos = await prisma.photo.count({
      where: { galleryId },
    });

    const uploadedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const ext = path.extname(file.name);
      const filename = `${timestamp}-${i}${ext}`;
      const filepath = path.join(uploadDir, filename);

      // Write file to disk
      await writeFile(filepath, buffer);

      // Create photo record
      const photo = await prisma.photo.create({
        data: {
          galleryId,
          filename: file.name,
          storagePath: `/uploads/${galleryId}/${filename}`,
          order: existingPhotos + i,
        },
      });

      uploadedPhotos.push(photo);
    }

    return NextResponse.json(uploadedPhotos, { status: 201 });
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}

// DELETE photo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
