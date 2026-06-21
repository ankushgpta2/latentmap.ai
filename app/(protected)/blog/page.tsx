import type { Metadata } from "next";
import {
  ResearchPageShell,
  StatusBadge,
} from "@/components/ResearchPageShell";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical posts, research notes, and lab updates from Latent Map Labs.",
};

export default function BlogPage() {
  return (
    <ResearchPageShell
      index="04"
      label="Blog"
      heading="Notes from the lab."
      intro="A place for technical writeups, in-progress research notes, and the slower kind of thinking that doesn't fit in a paper."
    >
      <div className="mb-2">
        <StatusBadge />
      </div>

      <p>
        The first cohort of posts is being written. Until they land, the
        clearest summary of the lab's stance is the thesis on the home
        page.
      </p>

      <hr className="hr-faint my-6" />

      <h2 className="display text-[1.5rem] text-[var(--color-fg)] mt-2 mb-4">
        Planned series
      </h2>
      <ul className="space-y-3 list-none pl-0">
        <PostStub
          tag="WM-01"
          title="Why world models, not just bigger text models."
        />
        <PostStub
          tag="ALN-01"
          title="Alignment as the dual of grounding."
        />
        <PostStub
          tag="NS-01"
          title="Predictive coding revisited, with budget."
        />
        <PostStub
          tag="QM-01"
          title="What measurement teaches us about inference."
        />
      </ul>
    </ResearchPageShell>
  );
}

function PostStub({ tag, title }: { tag: string; title: string }) {
  return (
    <li className="border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0 flex flex-col md:flex-row md:items-baseline md:gap-6">
      <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-accent)] min-w-[4rem]">
        {tag}
      </span>
      <span className="text-[var(--color-fg)]">{title}</span>
    </li>
  );
}
