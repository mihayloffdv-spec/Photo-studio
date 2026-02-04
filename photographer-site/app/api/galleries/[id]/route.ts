import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single gallery by ID or access code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by access code
    let gallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: "asc" } },
        client: true,
      },
    });

    if (!gallery) {
      gallery = await prisma.gallery.findUnique({
        where: { accessCode: id },
        include: {
          photos: { orderBy: { order: "asc" } },
          client: true,
        },
      });
    }

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

// DELETE gallery
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.gallery.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery" },
      { status: 500 }
    );
  }
}

// PATCH update gallery
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const gallery = await prisma.gallery.update({
      where: { id },
      data,
      include: {
        photos: true,
        client: true,
      },
    });

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}
