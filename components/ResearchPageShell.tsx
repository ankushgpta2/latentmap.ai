/**
 * Shared chrome for the four protected pages so their visual rhythm stays
 * identical. Each page provides its own narrative content as children.
 */
export function ResearchPageShell({
  index,
  label,
  heading,
  intro,
  children,
}: {
  index: string;
  label: string;
  heading: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="fade-up">
      <div className="flex items-center gap-4 mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] mb-8">
        <span className="text-[var(--color-accent)]">{index}</span>
        <span className="h-px w-8 bg-[var(--color-border-strong)]" />
        <span>{label}</span>
      </div>
      <h1 className="display text-[clamp(2rem,6vw,3.5rem)] text-[var(--color-fg)] mb-6 sm:mb-8 break-words">
        {heading}
      </h1>
      {intro ? (
        <p className="lede text-[var(--color-fg-muted)] max-w-2xl">{intro}</p>
      ) : null}
      {children ? (
        <div className="mt-16 space-y-12 text-[16px] leading-[1.7] text-[var(--color-fg-muted)] [&_em]:text-[var(--color-fg)] [&_em]:not-italic [&_em]:font-medium">
          {children}
        </div>
      ) : null}
    </article>
  );
}

export function StatusBadge({ kind = "soon" }: { kind?: "soon" | "alpha" | "draft" }) {
  const labels = {
    soon: "Coming soon",
    alpha: "Alpha",
    draft: "Draft",
  };
  return (
    <span className="inline-flex items-center gap-2 mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] border border-[var(--color-border-strong)] rounded-full px-3 py-1">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
      {labels[kind]}
    </span>
  );
}
