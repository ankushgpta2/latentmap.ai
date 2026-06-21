/**
 * Ambient topographic-line background. Inline SVG — no network, no JS cost.
 * Rendered as a sibling of the page content with low opacity so it never
 * competes with the typography. Intentionally generated, not random, so
 * the visual is stable and SSR-deterministic.
 */
export function ContourField({
  intensity = "default",
}: {
  intensity?: "default" | "subtle";
}) {
  const lines = Array.from({ length: 18 });
  const opacity = intensity === "subtle" ? 0.04 : 0.07;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      style={{ opacity }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="contour-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9b89a" stopOpacity="0.0" />
            <stop offset="30%" stopColor="#c9b89a" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#8aa3b8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8aa3b8" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {lines.map((_, i) => {
          const cy = 100 + i * 35;
          const amp = 24 + (i % 5) * 8;
          const phase = (i * 23) % 360;
          return (
            <path
              key={i}
              d={buildContour(cy, amp, phase)}
              fill="none"
              stroke="url(#contour-grad)"
              strokeWidth="0.6"
            />
          );
        })}
      </svg>
    </div>
  );
}

function buildContour(cy: number, amp: number, phase: number): string {
  const points: string[] = [];
  const step = 24;
  for (let x = -50; x <= 1250; x += step) {
    const rad = ((x + phase) / 120) * Math.PI;
    const y = cy + Math.sin(rad) * amp + Math.cos(rad / 3) * (amp / 3);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M ${points.join(" L ")}`;
}
