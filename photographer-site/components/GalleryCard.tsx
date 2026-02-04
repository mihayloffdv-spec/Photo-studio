import Link from "next/link";
import Image from "next/image";
import { formatDate, daysUntilExpiry } from "@/lib/utils";

interface Photo {
  id: string;
  storagePath: string;
}

interface Client {
  name: string;
  email: string;
}

interface GalleryCardProps {
  gallery: {
    id: string;
    title: string;
    accessCode: string;
    expiresAt: Date | string;
    createdAt: Date | string;
    photos: Photo[];
    client: Client | null;
  };
  onDelete?: (id: string) => void;
}

export function GalleryCard({ gallery, onDelete }: GalleryCardProps) {
  const expiresAt = new Date(gallery.expiresAt);
  const daysLeft = daysUntilExpiry(expiresAt);
  const coverPhoto = gallery.photos[0];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative aspect-video bg-gray-100">
        {coverPhoto ? (
          <Image
            src={coverPhoto.storagePath}
            alt={gallery.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No photos
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {gallery.photos.length} photos
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{gallery.title}</h3>

        {gallery.client && (
          <p className="text-gray-600 text-sm mt-1">
            {gallery.client.name} ({gallery.client.email})
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>Code: {gallery.accessCode}</span>
          <span
            className={
              daysLeft <= 30 ? "text-red-500" : ""
            }
          >
            {daysLeft} days left
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          Created {formatDate(new Date(gallery.createdAt))}
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/admin/gallery/${gallery.id}`}
            className="flex-1 text-center px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-700"
          >
            Manage
          </Link>
          <Link
            href={`/gallery/${gallery.accessCode}`}
            target="_blank"
            className="flex-1 text-center px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            View
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(gallery.id)}
              className="px-3 py-2 border border-red-300 text-red-500 rounded text-sm hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
