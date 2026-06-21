import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { MobileNav } from "./MobileNav";
import { NAV_PROTECTED, NAV_PUBLIC } from "@/lib/site-config";

export function Nav({
  authenticated = false,
  variant = "public",
}: {
  authenticated?: boolean;
  variant?: "public" | "protected";
}) {
  const links = variant === "protected" ? NAV_PROTECTED : NAV_PUBLIC;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--color-bg)]/70 border-b border-[color:var(--color-border)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Wordmark size="default" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <ul className="flex items-center gap-7 text-[13px]">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors py-2"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {authenticated ? (
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors py-2"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors py-2"
            >
              Access →
            </Link>
          )}
        </nav>

        {/* Mobile hamburger + drawer */}
        <MobileNav links={[...links]} authenticated={authenticated} />
      </div>
    </header>
  );
}
