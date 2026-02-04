import Link from "next/link";

export default function GalleryNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Gallery Not Found</h1>
        <p className="text-gray-600 mb-8">
          The gallery code you entered doesn&apos;t exist or may have expired.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please check your access code and try again, or contact the photographer.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
