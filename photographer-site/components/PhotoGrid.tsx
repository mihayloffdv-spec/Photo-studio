"use client";

import Image from "next/image";
import { useState } from "react";

interface Photo {
  id: string;
  filename: string;
  storagePath: string;
}

interface PhotoGridProps {
  photos: Photo[];
  onDelete?: (photoId: string) => void;
  showDelete?: boolean;
}

export function PhotoGrid({ photos, onDelete, showDelete = false }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No photos in this gallery yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-gray-100"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.storagePath}
              alt={photo.filename}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {showDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(photo.id);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl"
            onClick={() => setSelectedPhoto(null)}
          >
            &times;
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedPhoto.storagePath}
              alt={selectedPhoto.filename}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <a
            href={selectedPhoto.storagePath}
            download={selectedPhoto.filename}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            Download
          </a>
        </div>
      )}
    </>
  );
}
