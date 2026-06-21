import Link from "next/link";

export function Wordmark({
  size = "default",
  href = "/",
}: {
  size?: "default" | "small";
  href?: string;
}) {
  const cls =
    size === "small"
      ? "text-base tracking-[0.02em]"
      : "text-[15px] tracking-[0.02em]";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 ${cls} text-[var(--color-fg)] min-w-0`}
      aria-label="Latent Map Labs home"
    >
      <span aria-hidden="true" className="inline-block shrink-0">
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-500 group-hover:rotate-90"
        >
          <circle
            cx="11"
            cy="11"
            r="9.5"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <circle
            cx="11"
            cy="11"
            r="6"
            stroke="currentColor"
            strokeOpacity="0.6"
          />
          <circle
            cx="11"
            cy="11"
            r="2.5"
            stroke="currentColor"
            strokeOpacity="0.9"
          />
          <line
            x1="11"
            y1="1.5"
            x2="11"
            y2="20.5"
            stroke="currentColor"
            strokeOpacity="0.2"
          />
          <line
            x1="1.5"
            y1="11"
            x2="20.5"
            y2="11"
            stroke="currentColor"
            strokeOpacity="0.2"
          />
        </svg>
      </span>
      <span className="font-medium truncate">Latent Map Labs</span>
      <span className="mono text-[11px] uppercase text-[var(--color-fg-subtle)] hidden sm:inline shrink-0">
        / LML
      </span>
    </Link>
  );
}
