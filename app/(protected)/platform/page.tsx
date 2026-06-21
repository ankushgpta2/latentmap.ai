import type { Metadata } from "next";
import {
  ResearchPageShell,
  StatusBadge,
} from "@/components/ResearchPageShell";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "The Latent Map Labs research platform — instrumentation, world-model architectures, and the lab's measurement stack.",
};

export default function PlatformPage() {
  return (
    <ResearchPageShell
      index="01"
      label="Platform"
      heading="The instruments we build to study coupling."
      intro="The platform is the substrate beneath every research thread at LML: a shared stack of architectures, training pipelines, and measurement tools that lets us study how a model represents — and intervenes in — the world it inhabits."
    >
      <div className="mb-2">
        <StatusBadge />
      </div>

      <p>
        We are deliberately publishing the platform incrementally. The first
        public release will focus on the core measurement primitives —
        representation-alignment probes, intervention scaffolds for active
        evaluation, and a small set of reference world-model architectures
        we use internally.
      </p>

      <p>
        If you build, deploy, or evaluate frontier systems and want early
        access to the platform stack, get in touch via the careers page or
        write to us directly. We are particularly interested in collaborators
        who would push the toolchain in domains we have not yet covered.
      </p>

      <hr className="hr-faint my-6" />

      <h2 className="display text-[1.5rem] text-[var(--color-fg)] mt-2 mb-2">
        Currently in development
      </h2>
      <ul className="space-y-3 list-none pl-0">
        <PlatformLine
          tag="WM"
          title="World-Model Substrate"
          body="A reference implementation of an energy-based, hierarchical predictive architecture. Internal milestone, public release Q1."
        />
        <PlatformLine
          tag="EV"
          title="Active Evaluation Suite"
          body="Counterfactual probes and intervention scaffolds for measuring grounding, calibration, and consequence-aware behavior."
        />
        <PlatformLine
          tag="OB"
          title="Observatory"
          body="A live measurement console for representation drift, scaling-law diagnostics, and capability/alignment co-tracking."
        />
        <PlatformLine
          tag="OS"
          title="Open Specs"
          body="Public design documents and reproducible benchmarks for each platform component."
        />
      </ul>
    </ResearchPageShell>
  );
}

function PlatformLine({
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
      <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-accent)] min-w-[2rem]">
        {tag}
      </span>
      <div>
        <div className="text-[var(--color-fg)] font-medium">{title}</div>
        <p className="text-[14.5px] text-[var(--color-fg-muted)] mt-1">{body}</p>
      </div>
    </li>
  );
}
