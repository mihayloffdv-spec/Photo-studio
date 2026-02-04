"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GalleryCard } from "@/components/GalleryCard";

interface Photo {
  id: string;
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const res = await fetch("/api/auth");
    const data = await res.json();
    setIsAuthenticated(data.authenticated);

    if (data.authenticated) {
      fetchGalleries();
    } else {
      setLoading(false);
    }
  }

  async function fetchGalleries() {
    try {
      const res = await fetch("/api/galleries");
      const data = await res.json();
      setGalleries(data);
    } catch (err) {
      console.error("Failed to fetch galleries:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setIsAuthenticated(true);
      fetchGalleries();
      router.refresh();
    } else {
      setError("Invalid password");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this gallery?")) return;

    const res = await fetch(`/api/galleries/${id}`, { method: "DELETE" });

    if (res.ok) {
      setGalleries(galleries.filter((g) => g.id !== id));
    }
  }

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Default password: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Galleries</h1>
        <a
          href="/admin/upload"
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          + Create Gallery
        </a>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">No galleries yet.</p>
          <a
            href="/admin/upload"
            className="text-blue-600 hover:underline"
          >
            Create your first gallery →
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
