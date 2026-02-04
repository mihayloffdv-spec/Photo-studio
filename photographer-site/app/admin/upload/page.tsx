"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGalleryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProgress("Creating gallery...");

    try {
      // Step 1: Create gallery
      const galleryRes = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientName: clientName || undefined,
          clientEmail: clientEmail || undefined,
        }),
      });

      if (!galleryRes.ok) {
        throw new Error("Failed to create gallery");
      }

      const gallery = await galleryRes.json();

      // Step 2: Upload photos if any
      if (files && files.length > 0) {
        setProgress(`Uploading ${files.length} photos...`);

        const formData = new FormData();
        formData.append("galleryId", gallery.id);

        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }

        const uploadRes = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload photos");
        }
      }

      setProgress("Success! Redirecting...");
      router.push(`/admin/gallery/${gallery.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create New Gallery</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Gallery Title */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Gallery Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="e.g., Johnson Family Session - March 2024"
            required
          />
        </div>

        {/* Client Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-4">Client Information (Optional)</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="clientName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="clientEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Client Email
              </label>
              <input
                type="email"
                id="clientEmail"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label
            htmlFor="photos"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Photos
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
            />
            <label
              htmlFor="photos"
              className="cursor-pointer"
            >
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">
                  Click to select photos or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You can also upload photos after creating the gallery
                </p>
              </div>
            </label>
          </div>
          {files && files.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {files.length} file(s) selected
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Progress */}
        {loading && progress && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-600 rounded-lg">
            {progress}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Gallery"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
