import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PhotoGrid } from "@/components/PhotoGrid";
import { formatDate, daysUntilExpiry } from "@/lib/utils";
import Link from "next/link";

interface GalleryPageProps {
  params: Promise<{ code: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { code } = await params;

  const gallery = await prisma.gallery.findUnique({
    where: { accessCode: code },
    include: {
      photos: { orderBy: { order: "asc" } },
      client: true,
    },
  });

  if (!gallery) {
    notFound();
  }

  const daysLeft = daysUntilExpiry(gallery.expiresAt);
  const isExpired = daysLeft <= 0;

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Gallery Expired</h1>
          <p className="text-gray-600 mb-4">
            This gallery is no longer available. Please contact the photographer
            for more information.
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
            ← Back to Photo Studio
          </Link>
          <h1 className="text-3xl font-bold">{gallery.title}</h1>
          {gallery.client && (
            <p className="text-gray-400 mt-2">
              For {gallery.client.name}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
            <span>{gallery.photos.length} photos</span>
            <span>•</span>
            <span>Created {formatDate(gallery.createdAt)}</span>
            <span>•</span>
            <span className={daysLeft <= 30 ? "text-yellow-400" : ""}>
              {daysLeft} days until expiration
            </span>
          </div>
        </div>
      </header>

      {/* Gallery Actions */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">
              Download All
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
              Share Gallery
            </button>
          </div>
          {daysLeft <= 30 && (
            <div className="text-sm text-yellow-600 bg-yellow-50 px-4 py-2 rounded-lg">
              This gallery expires in {daysLeft} days.
              <button className="underline ml-2">Extend storage</button>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <PhotoGrid photos={gallery.photos} />
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Photos are stored securely and will be available until {formatDate(gallery.expiresAt)}.</p>
          <p className="mt-2">
            <Link href="/" className="hover:underline">
              Book your own photo session →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
