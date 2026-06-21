import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ContourField } from "@/components/ContourField";
import { ManifoldField } from "@/components/ManifoldField";
import { isAuthenticated } from "@/lib/auth";
import { SITE } from "@/lib/site-config";

export default async function HomePage() {
  const authed = await isAuthenticated();

  return (
    <>
      <ContourField />
      <Nav authenticated={authed} variant="public" />

      <main className="relative mx-auto max-w-3xl px-5 sm:px-6 pt-20 md:pt-32">
        {/* Hero */}
        <section className="fade-up">
          <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] mb-6 sm:mb-8">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] mr-3 align-middle" />
            Frontier Research Lab · Founded {SITE.founded}
          </div>
          <h1 className="display text-[clamp(2.5rem,8vw,5.25rem)] text-[var(--color-fg)] break-words">
            {SITE.name}{" "}
            <span className="text-[var(--color-fg-subtle)] whitespace-nowrap">
              ({SITE.shortName})
            </span>
          </h1>
          <p className="lede mt-6 sm:mt-8 max-w-2xl text-[var(--color-fg-muted)]">
            We are charting the <em>latent map</em> between intelligence and
            reality — the high-dimensional manifold where cognition, action,
            and the physical world meet. Our work spans artificial
            intelligence, quantum computation, neuroscience, and physics, in
            search of the structures that connect them.
          </p>
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href="#thesis"
              className="mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-fg)] border-b border-[var(--color-fg)] py-2 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
            >
              Read the thesis ↓
            </Link>
            <Link
              href="/login"
              className="mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] py-2 transition-colors"
            >
              Researcher access →
            </Link>
          </div>
        </section>

        <section className="mt-12 md:mt-20 fade-up fade-up-delay-1">
          <ManifoldField />
        </section>

        <hr className="hr-faint my-16 md:my-24" />

        {/* Thesis Section 1 */}
        <section id="thesis" className="fade-up fade-up-delay-1">
          <SectionLabel value="01" title="Thesis" />
          <h2 className="display text-[clamp(1.75rem,5vw,3rem)] mt-6 mb-6 sm:mb-8 break-words">
            Intelligence is not a brain in a vat.
          </h2>
          <Prose>
            <p>
              <em>
                Cognition becomes useful only through bidirectional coupling
                with the world.
              </em>{" "}
              The brain is consequential not because it computes in isolation,
              but because it sits at the center of a dense lattice of
              sensorimotor pathways — afferent signals carrying the world in,
              efferent signals carrying action out. Every meaningful
              representation is shaped, constrained, and validated by that
              loop.
            </p>
            <p>
              The current frontier of artificial intelligence has been built
              the other way around: vast competence cultivated inside the vat,
              with embodiment, interaction, and consequence treated as
              downstream applications. We believe this gets the order wrong.
              An intelligence that cannot be grounded in, corrected by, and
              held accountable to reality is not robust, not interpretable,
              and not ultimately useful.
            </p>
            <p>
              {SITE.shortName} is built around the inverse premise — that the
              coupling{" "}
              <span className="text-[var(--color-fg)]">
                between
              </span>{" "}
              model and world is the primary object of study, not a peripheral
              concern.
            </p>
          </Prose>
        </section>

        <hr className="hr-faint my-16 md:my-24" />

        {/* Thesis Section 2 */}
        <section className="fade-up fade-up-delay-2">
          <SectionLabel value="02" title="Method" />
          <h2 className="display text-[clamp(1.75rem,5vw,3rem)] mt-6 mb-6 sm:mb-8 break-words">
            Ethics is the substrate, not the wrapper.
          </h2>
          <Prose>
            <p>
              <em>
                A system that cannot model the consequences of its actions
                cannot be aligned with anyone's values.
              </em>{" "}
              Alignment is not a layer applied after capability is achieved;
              it is the same problem, viewed from the other side. A model
              that lacks a coherent grasp of reality cannot be safely
              steered toward, or away from, any outcome within it.
            </p>
            <p>
              We therefore reject the view that capability and alignment are
              parallel tracks to be balanced. They are dual descriptions of
              the same underlying competence — the ability to represent
              what is, what could be, and what the difference costs. Our
              research is organized so that interpretability, evaluation,
              and value-sensitivity are built into the architecture rather
              than retrofitted onto it.
            </p>
          </Prose>
        </section>

        <hr className="hr-faint my-16 md:my-24" />

        {/* Thesis Section 3 */}
        <section id="research" className="fade-up fade-up-delay-3">
          <SectionLabel value="03" title="Scope" />
          <h2 className="display text-[clamp(1.75rem,5vw,3rem)] mt-6 mb-6 sm:mb-8 break-words">
            From models to matter.
          </h2>
          <Prose>
            <p>
              <em>
                Intelligence cannot be understood at any single level of
                description.
              </em>{" "}
              The same phenomenon — a system maintaining a useful model of
              its environment while acting within it — recurs in
              transformer activations, cortical microcircuits, quantum
              measurement, and physical control. We study these in parallel
              because we believe their structures inform one another.
            </p>
            <Quartet />
            <p className="mt-10">
              Each plane is not a separate department but a different
              vantage onto a single landscape. Insights from one are
              expected to constrain the others; the work succeeds when they
              begin to converge.
            </p>
          </Prose>
        </section>

        <hr className="hr-faint my-16 md:my-24" />

        {/* Principles */}
        <section className="fade-up fade-up-delay-4">
          <SectionLabel value="04" title="Principles" />
          <h2 className="display text-[clamp(1.75rem,5vw,3rem)] mt-6 mb-6 sm:mb-8 break-words">
            Solid foundations, slow inferences.
          </h2>
          <Prose>
            <p>
              <em>Open by default.</em> We publish what we learn, in
              papers, posts, and code, because frontier science is a
              collective enterprise and accountability requires legibility.
            </p>
            <p>
              <em>Empirical to the bone.</em> Theory advances by surviving
              contact with data. We instrument every claim and prefer
              measurements we can defend over narratives that sound good.
            </p>
            <p>
              <em>Small surface, deep stack.</em> We resist the temptation
              to do everything at once. The lab is organized around a
              narrow set of bets pursued with disproportionate depth.
            </p>
            <p>
              <em>Respect for prior art.</em> The questions we ask are old.
              The communities of cognitive science, condensed-matter
              physics, dynamical systems, and theoretical neuroscience
              have been here for decades. We borrow what works and credit
              what we borrow.
            </p>
          </Prose>
        </section>

        <hr className="hr-faint my-16 md:my-24" />

        {/* CTA */}
        <section id="join" className="fade-up">
          <SectionLabel value="05" title="Join" />
          <h2 className="display text-[clamp(1.75rem,5vw,3rem)] mt-6 mb-6 sm:mb-8 break-words">
            We are looking for collaborators.
          </h2>
          <Prose>
            <p>
              {SITE.shortName} is a small, deliberately interdisciplinary
              lab. We are interested in researchers and engineers who treat
              this as a serious technical question rather than a slogan —
              people fluent in the mathematics of learning, the biology of
              cognition, the physics of measurement, or the engineering of
              real systems acting in the world.
            </p>
            <p>
              If your work touches any of these, we would like to hear from
              you.
            </p>
          </Prose>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 items-center">
            <Link
              href="/careers"
              className="mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-fg)] border-b border-[var(--color-fg)] pb-1 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
            >
              Open roles →
            </Link>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="mono text-[12px] uppercase tracking-[0.1em] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
            >
              {SITE.contactEmail}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function SectionLabel({ value, title }: { value: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)]">
      <span className="text-[var(--color-accent)]">{value}</span>
      <span className="h-px w-8 bg-[var(--color-border-strong)]" />
      <span>{title}</span>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 text-[17px] leading-[1.7] text-[var(--color-fg-muted)] [&_em]:text-[var(--color-fg)] [&_em]:not-italic [&_em]:font-medium">
      {children}
    </div>
  );
}

function Quartet() {
  const items = [
    {
      tag: "AI",
      title: "Artificial intelligence",
      blurb:
        "World models, grounded representations, and architectures that learn from interaction rather than from text alone.",
    },
    {
      tag: "QC",
      title: "Quantum computation",
      blurb:
        "Measurement, decoherence, and the structure of physical inference under uncertainty.",
    },
    {
      tag: "NS",
      title: "Neuroscience",
      blurb:
        "Cortical circuits as a working blueprint for active, embodied prediction under metabolic budget.",
    },
    {
      tag: "PH",
      title: "Physics",
      blurb:
        "Dynamics, statistical mechanics, and the geometry of systems that act within the worlds they model.",
    },
  ];
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 not-prose">
      {items.map((it) => (
        <div key={it.tag} className="border-t border-[var(--color-border)] pt-5">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {it.tag}
            </span>
            <span className="text-[var(--color-fg)] text-[15px] font-medium">
              {it.title}
            </span>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-[var(--color-fg-muted)]">
            {it.blurb}
          </p>
        </div>
      ))}
    </div>
  );
}
