import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAccessCode } from "@/lib/utils";
import { logger } from "@/lib/logger";

// GET all galleries (admin)
export async function GET() {
  try {
    logger.debug("Fetching all galleries");

    const galleries = await prisma.gallery.findMany({
      include: {
        photos: true,
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });

    logger.info("Galleries fetched successfully", { count: galleries.length });
    return NextResponse.json(galleries);
  } catch (error) {
    logger.error("Failed to fetch galleries", error);
    return NextResponse.json(
      { error: "Failed to fetch galleries" },
      { status: 500 }
    );
  }
}

// POST create new gallery
export async function POST(request: NextRequest) {
  try {
    const { title, clientEmail, clientName } = await request.json();

    logger.info("Creating new gallery", { title, clientEmail, clientName });

    if (!title) {
      logger.warn("Gallery creation failed: title missing");
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate unique access code
    let accessCode = generateAccessCode();
    let existingGallery = await prisma.gallery.findUnique({
      where: { accessCode },
    });

    while (existingGallery) {
      accessCode = generateAccessCode();
      existingGallery = await prisma.gallery.findUnique({
        where: { accessCode },
      });
    }

    // Create client if email provided
    let clientId = null;
    if (clientEmail && clientName) {
      const client = await prisma.client.upsert({
        where: { email: clientEmail },
        update: { name: clientName },
        create: { email: clientEmail, name: clientName },
      });
      clientId = client.id;
      logger.debug("Client created/updated", { clientId, email: clientEmail });
    }

    // Set expiration to 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const gallery = await prisma.gallery.create({
      data: {
        title,
        accessCode,
        clientId,
        expiresAt,
      },
      include: {
        photos: true,
        client: true,
      },
    });

    logger.info("Gallery created successfully", {
      galleryId: gallery.id,
      accessCode: gallery.accessCode,
      title: gallery.title,
    });

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    logger.error("Failed to create gallery", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
}
