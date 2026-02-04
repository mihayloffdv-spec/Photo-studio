import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  const isAuthenticated = authCookie?.value === "authenticated";

  // Check if we're on the login page (main /admin page handles login)
  // Don't redirect from the main admin page itself
  const isLoginPage = false; // This layout wraps all admin pages

  if (!isAuthenticated) {
    // Return children for the login form to show
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
