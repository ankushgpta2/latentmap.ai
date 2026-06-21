import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ContourField } from "@/components/ContourField";
import { isAuthenticated } from "@/lib/auth";
import { SITE } from "@/lib/site-config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Researcher access",
  description: `Invite-gated access to ${SITE.name} research pages.`,
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await isAuthenticated()) {
    redirect(safeNext(next));
  }

  return (
    <>
      <ContourField intensity="subtle" />
      <Nav variant="public" />
      <main className="relative mx-auto max-w-md px-5 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24 min-h-[calc(100svh-15rem)] flex flex-col justify-center">
        <div className="fade-up">
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] mr-3 align-middle" />
            Restricted · Researcher Access
          </div>
          <h1 className="display text-[clamp(2rem,5vw,2.75rem)] text-[var(--color-fg)] mb-4">
            Enter your invite code.
          </h1>
          <p className="text-[15px] leading-[1.65] text-[var(--color-fg-muted)] mb-10">
            The platform, team, careers, and blog sections are currently
            restricted to invited researchers and collaborators. If you
            don&apos;t have a code yet,{" "}
            <a className="link" href={`mailto:${SITE.contactEmail}`}>
              request access
            </a>
            .
          </p>
          <LoginForm next={safeNext(next)} />
        </div>
      </main>
      <Footer />
    </>
  );
}

/**
 * Defend against open-redirect by only allowing internal, absolute paths.
 */
function safeNext(next: string | undefined): string {
  if (!next) return "/platform";
  if (!next.startsWith("/") || next.startsWith("//")) return "/platform";
  return next;
}
