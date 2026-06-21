import type { Metadata } from "next";
import Link from "next/link";
import {
  ResearchPageShell,
  StatusBadge,
} from "@/components/ResearchPageShell";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open research and engineering roles at Latent Map Labs.",
};

export default function CareersPage() {
  return (
    <ResearchPageShell
      index="03"
      label="Careers"
      heading="Work on the coupling problem."
      intro="LML is hiring across a small number of well-defined roles. We move quickly when we meet the right person; we don't run a high-volume recruiting funnel."
    >
      <div className="mb-2">
        <StatusBadge />
      </div>

      <p>
        Most of our hiring happens through direct conversation rather than a
        public roles list. The fastest path is a short note telling us who
        you are, what you've built, and what you would most want to work on
        here. Public role pages will land on this page as the lab grows.
      </p>

      <hr className="hr-faint my-6" />

      <h2 className="display text-[1.5rem] text-[var(--color-fg)] mt-2 mb-2">
        What we look for
      </h2>
      <ul className="space-y-3 list-none pl-0">
        <CareerLine
          tag="RS"
          title="Research Scientists"
          body="Deep expertise in one of LML's planes — ML, neuroscience, theoretical physics, or quantum information — plus the willingness to read across the others."
        />
        <CareerLine
          tag="RE"
          title="Research Engineers"
          body="Production-grade systems people who can stand up training, evaluation, and measurement infrastructure that researchers can actually use."
        />
        <CareerLine
          tag="MTS"
          title="Founding Members of Technical Staff"
          body="People who move comfortably between research and infrastructure and want unusually broad scope at the founding stage."
        />
        <CareerLine
          tag="OPS"
          title="Operating Partners"
          body="Generalists who let the rest of the lab stay close to the work — recruiting, finance, partnerships, and the things that scale a research org."
        />
      </ul>

      <hr className="hr-faint my-6" />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent("LML — career interest")}`}
          className="mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-fg)] border-b border-[var(--color-fg)] pb-1 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
        >
          Reach out →
        </a>
        <Link
          href="/blog"
          className="mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          Read the blog
        </Link>
      </div>
    </ResearchPageShell>
  );
}

function CareerLine({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <li className="border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0 flex flex-col md:flex-row md:items-baseline md:gap-6">
      <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-accent)] min-w-[3rem]">
        {tag}
      </span>
      <div>
        <div className="text-[var(--color-fg)] font-medium">{title}</div>
        <p className="text-[14.5px] text-[var(--color-fg-muted)] mt-1">{body}</p>
      </div>
    </li>
  );
}
