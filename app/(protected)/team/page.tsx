import type { Metadata } from "next";
import {
  ResearchPageShell,
  StatusBadge,
} from "@/components/ResearchPageShell";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Latent Map Labs is a small, deliberately interdisciplinary research lab.",
};

export default function TeamPage() {
  return (
    <ResearchPageShell
      index="02"
      label="Team"
      heading="Small, deliberate, interdisciplinary."
      intro="LML is built by researchers and engineers working across the disciplines that the lab studies: machine learning, neuroscience, theoretical physics, and the engineering of real systems acting in the world."
    >
      <div className="mb-2">
        <StatusBadge />
      </div>

      <p>
        We are in the founding phase. Public profiles for the founding team
        and the first cohort of researchers will appear here as they
        on-board. We are intentionally not chasing headcount — depth and
        compounding focus matter more to us at this stage than visible team
        size.
      </p>

      <p>
        We hire across four broad shapes: <em>research scientists</em>{" "}
        steeped in one of the lab's disciplinary planes, <em>research
        engineers</em> who can build production-grade measurement tools
        without the system collapsing, <em>founding members of technical
        staff</em> who comfortably move between the two, and <em>operating
        partners</em> who let the rest of the team stay close to the work.
      </p>

      <hr className="hr-faint my-6" />

      <p className="text-[15px]">
        If you fit any of these shapes and the thesis on the home page is
        the kind of question you've been quietly turning over, the careers
        page is the right next step.
      </p>
    </ResearchPageShell>
  );
}
