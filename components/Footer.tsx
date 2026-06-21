import Link from "next/link";
import { SITE } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-24 sm:mt-32 border-t border-[color:var(--color-border)]">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-10 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)]">
            {SITE.shortName} · est. {SITE.founded}
          </span>
          <span className="text-[13px] text-[var(--color-fg-muted)] max-w-md">
            {SITE.tagline}
          </span>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            <li>
              <Link
                href="/"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/platform"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                Platform
              </Link>
            </li>
            <li>
              <Link
                href="/team"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                Team
              </Link>
            </li>
            <li>
              <Link
                href="/careers"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                Blog
              </Link>
            </li>
          </ul>
          <span className="mono text-[11px] text-[var(--color-fg-subtle)]">
            © {new Date().getFullYear()} {SITE.legalName} · All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
