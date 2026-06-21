/**
 * Static, build-time site configuration. Anything that should change per
 * deploy belongs in env vars (see .env.example); the values here are
 * universal brand constants.
 */

export const SITE = {
  name: "Latent Map Labs",
  shortName: "LML",
  legalName: "Latent Map Labs, Inc.",
  tagline: "Charting the latent map between intelligence and reality.",
  description:
    "Latent Map Labs (LML) is a frontier research lab studying the bidirectional coupling between intelligent systems and the world they act within — across AI, quantum computation, neuroscience, and physics.",
  founded: 2026,
  contactEmail: "hello@latentmap.ai",
} as const;

export const NAV_PROTECTED = [
  { href: "/platform", label: "Platform" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers" },
  { href: "/blog", label: "Blog" },
] as const;

export const NAV_PUBLIC = [
  { href: "/#research", label: "Research" },
  { href: "/#thesis", label: "Thesis" },
  { href: "/#join", label: "Join" },
] as const;

export type NavItem = (typeof NAV_PROTECTED)[number] | (typeof NAV_PUBLIC)[number];

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function getCanonicalHost(): string {
  return process.env.NEXT_PUBLIC_CANONICAL_HOST ?? "www.latentmap.ai";
}
