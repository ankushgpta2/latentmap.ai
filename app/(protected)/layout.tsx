import { redirect } from "next/navigation";
import { ContourField } from "@/components/ContourField";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { isAuthenticated } from "@/lib/auth";

/**
 * Auth defense in depth: middleware redirects unauthenticated users before
 * any code runs, but we also verify on the server here so that any future
 * refactor of `matcher` paths cannot accidentally expose a protected page.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/login?next=/platform");
  }

  return (
    <>
      <ContourField intensity="subtle" />
      <Nav authenticated variant="protected" />
      <main className="relative mx-auto max-w-3xl px-5 sm:px-6 pt-20 md:pt-32 pb-12">
        {children}
      </main>
      <Footer />
    </>
  );
}
