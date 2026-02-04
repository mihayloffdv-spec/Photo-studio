"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PhotoGrid } from "@/components/PhotoGrid";
import Link from "next/link";

interface Photo {
  id: string;
  filename: string;
  storagePath: string;
}

interface Client {
  name: string;
  email: string;
}

interface Gallery {
  id: string;
  title: string;
  accessCode: string;
  expiresAt: string;
  createdAt: string;
  photos: Photo[];
  client: Client | null;
}

export default function GalleryManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, [id]);

  async function fetchGallery() {
    try {
      const res = await fetch(`/api/galleries/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("galleryId", id);

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchGallery();
      }
    } catch (err) {
      console.error("Failed to upload photos:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handlePhotoDelete(photoId: string) {
    if (!confirm("Delete this photo?")) return;

    const res = await fetch(`/api/photos?id=${photoId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setGallery((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }
          : null
      );
    }
  }

  function copyAccessLink() {
    if (!gallery) return;
    const url = `${window.location.origin}/gallery/${gallery.accessCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Gallery not found</p>
        <Link href="/admin" className="text-blue-600 hover:underline">
          Back to galleries
        </Link>
      </div>
    );
  }

  const expiresAt = new Date(gallery.expiresAt);
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{gallery.title}</h1>
            {gallery.client && (
              <p className="text-gray-600 mt-1">
                {gallery.client.name} ({gallery.client.email})
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                {gallery.photos.length} photos
              </span>
              <span
                className={`px-3 py-1 rounded-full ${
                  daysLeft <= 30
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {daysLeft} days left
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <code className="px-3 py-2 bg-gray-100 rounded text-sm">
                {gallery.accessCode}
              </code>
              <button
                onClick={copyAccessLink}
                className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <Link
              href={`/gallery/${gallery.accessCode}`}
              target="_blank"
              className="text-sm text-blue-600 hover:underline text-right"
            >
              Preview gallery →
            </Link>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Upload Photos</h2>
            <p className="text-sm text-gray-500">
              Add more photos to this gallery
            </p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
            <span
              className={`px-4 py-2 rounded-lg font-medium ${
                uploading
                  ? "bg-gray-200 text-gray-500"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {uploading ? "Uploading..." : "Select Photos"}
            </span>
          </label>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Photos</h2>
        <PhotoGrid
          photos={gallery.photos}
          onDelete={handlePhotoDelete}
          showDelete
        />
      </div>
    </div>
  );
}
