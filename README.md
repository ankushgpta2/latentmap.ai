# Latent Map Labs — Web

The marketing + invite-gated research site for **Latent Map Labs (LML)**, built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind v4.

```
website/
├── lml-web/           # this app (Next.js, Vercel-ready)
└── latentmap.ai/      # legacy GitHub Pages static site (archive)
```

The home page is **public** and presents the lab's thesis. The Platform, Team, Careers, and Blog pages are **invite-gated** behind a signed-cookie session; the gate is enforced by both Next.js middleware (Edge) and a server-side check in the protected route group's layout (defense in depth).

---

## Architecture at a glance

| Concern | Implementation |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript strict |
| Styling | Tailwind v4 (`@tailwindcss/postcss`), CSS custom properties for design tokens |
| Fonts | `next/font` self-hosting Inter, Instrument Serif, JetBrains Mono — no external font fetches at runtime |
| Auth | SHA-256 hash of an invite code (stored only as a hash), `jose` HS256 JWT in an httpOnly `lml_session` cookie |
| Rate limit | In-memory token bucket on `/api/auth/login`, IP-keyed via `x-forwarded-for` |
| Security headers | HSTS, X-Frame-Options DENY, Permissions-Policy, X-Content-Type-Options nosniff, strict Referrer-Policy (set in `next.config.ts`) |
| Deployment | Vercel (recommended), or any Node 20+ host that can run `next start` |

### Route map

```
/                         public  · home / manifesto
/login                    public  · invite-code entry form
/api/auth/login           public  · POST { code } → sets session cookie
/api/auth/logout          public  · POST or GET → clears cookie, redirects /
/platform                 gated   · research platform
/team                     gated   · team
/careers                  gated   · careers
/blog                     gated   · blog
```

Middleware (`middleware.ts`) only runs on `/platform/*`, `/team/*`, `/careers/*`, `/blog/*`.

---

## Local development

### 1. Install

```bash
cd lml-web
npm install
```

### 2. Generate local secrets

```bash
npm run generate-secret   # → SESSION_SECRET=...
npm run generate-hash     # prompts for an invite code → INVITE_CODE_HASH=...
```

Each command prints a single `KEY=VALUE` line. Copy them into `.env.local`.

### 3. Create `.env.local`

```bash
cp .env.example .env.local
# then paste the SESSION_SECRET and INVITE_CODE_HASH lines you generated
```

Minimum required keys for local dev:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CANONICAL_HOST=www.latentmap.ai
INVITE_CODE_HASH=<paste from generate-hash>
SESSION_SECRET=<paste from generate-secret>
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>. The home page renders without login. Visiting `/platform`, `/team`, `/careers`, or `/blog` redirects to `/login?next=...` until you enter the plaintext invite code.

### 5. Useful scripts

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run build        # production build
npm start            # serve a built app
```

---

## Deployment

### Vercel (recommended)

This site is designed for Vercel. The auth model (JWT in cookie, validated at the Edge) and the middleware-based gating both work natively there.

1. **Push the `lml-web/` folder to its own GitHub repository.** A simple approach:
   ```bash
   cd lml-web
   git init
   git add .
   git commit -m "feat: initial Latent Map Labs site"
   git branch -M main
   git remote add origin git@github.com:<your-handle>/lml-web.git
   git push -u origin main
   ```

2. **Import the repo on Vercel.** Choose the `lml-web` repo, accept the auto-detected `Next.js` framework preset. No root override needed if the repo root is `lml-web/`.

3. **Set environment variables** under *Project Settings → Environment Variables*. Add these for the **Production** environment (and copy them to **Preview** if you want preview deployments gated identically):

   | Key | Example value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://www.latentmap.ai` |
   | `NEXT_PUBLIC_CANONICAL_HOST` | `www.latentmap.ai` |
   | `INVITE_CODE_HASH` | output of `npm run generate-hash` |
   | `SESSION_SECRET` | output of `npm run generate-secret` |
   | `SESSION_TTL_SECONDS` | `86400` (24h) — optional |
   | `RATE_LIMIT_MAX_ATTEMPTS` | `5` — optional |
   | `RATE_LIMIT_WINDOW_SECONDS` | `900` — optional |

4. **Add the custom domain.** *Project Settings → Domains → Add* → enter `latentmap.ai` and `www.latentmap.ai`. Vercel will give you DNS records:
   - **Apex (`latentmap.ai`)**: `A` record `76.76.21.21` (Vercel anycast)
   - **`www` (`www.latentmap.ai`)**: `CNAME` to `cname.vercel-dns.com`
   - **TLS** is provisioned automatically once DNS propagates.

5. **Redirect apex → www (or the other way):** in *Domains*, mark one as the canonical and the other as a redirect. The CNAME in `latentmap.ai/CNAME` currently points to `www.latentmap.ai`, so `www` as canonical keeps that contract.

6. **Verify:**
   - `https://www.latentmap.ai/` should render the public home page.
   - `https://www.latentmap.ai/platform` should 307-redirect to `/login?next=/platform`.
   - After entering the invite code, you should be sent through to `/platform`.

### Changing the deployment domain

The site uses `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CANONICAL_HOST` to know where it lives. To deploy under a different domain (staging, alternate brand, etc.):

```
NEXT_PUBLIC_SITE_URL=https://staging.lml.dev
NEXT_PUBLIC_CANONICAL_HOST=staging.lml.dev
```

Nothing else needs to change. There are no hard-coded hostnames in source.

### Alternative hosts

This is a server-rendered Next.js app — it requires a Node runtime. Static-only hosts (GitHub Pages, plain S3) **cannot** run the auth flow. Drop-in replacements for Vercel:

- **Cloudflare Pages** with `@cloudflare/next-on-pages` (use the Edge runtime).
- **AWS Amplify Hosting** (full Next.js support).
- **A self-hosted Node 20+ box** running `npm run build && npm start` behind a reverse proxy that terminates TLS.

---

## Security notes

- **Plaintext invite code never lives in the codebase, env file, or any log.** Only its SHA-256 hash is stored. Compromising the env file does not directly leak the code.
- **`SESSION_SECRET` rotation invalidates every currently-issued session cookie.** Plan for this if/when you rotate.
- **Constant-time comparison** is used everywhere a secret value is checked (`lib/auth.ts → timingSafeEqual`).
- **Rate limit is in-memory** and therefore per-Vercel-instance. For higher-scale abuse resistance, swap `lib/rate-limit.ts` to use `@vercel/kv` or Upstash Redis.
- **`/login` is marked `noindex`** so search engines should not index the gate.
- **HSTS, frame-ancestors DENY, MIME-sniff lock-off** are all set globally in `next.config.ts`.
- **Server-side check in `(protected)/layout.tsx`** is a deliberate redundancy with the middleware matcher; if the matcher is misconfigured in a future refactor, this still blocks the page.

If you spot a security issue, please email `security@latentmap.ai` rather than filing a public issue.

---

## Project structure

```
lml-web/
├── app/
│   ├── api/auth/login/route.ts         # POST /api/auth/login
│   ├── api/auth/logout/route.ts        # POST/GET /api/auth/logout
│   ├── (protected)/
│   │   ├── layout.tsx                  # server-side auth gate
│   │   ├── platform/page.tsx
│   │   ├── team/page.tsx
│   │   ├── careers/page.tsx
│   │   └── blog/page.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── LoginForm.tsx               # "use client"
│   ├── globals.css                     # design tokens via @theme inline
│   ├── layout.tsx                      # root layout + fonts + metadata
│   ├── page.tsx                        # public home / manifesto
│   └── sitemap.ts
├── components/
│   ├── ContourField.tsx                # SVG topographic background
│   ├── Footer.tsx
│   ├── Nav.tsx
│   ├── ResearchPageShell.tsx           # shared chrome for gated pages
│   └── Wordmark.tsx                    # LML mark
├── lib/
│   ├── auth.ts                         # JWT + hash + cookie helpers
│   ├── rate-limit.ts                   # in-memory limiter
│   └── site-config.ts                  # static brand constants
├── public/
│   └── robots.txt
├── scripts/
│   ├── generate-hash.mjs               # → INVITE_CODE_HASH
│   └── generate-secret.mjs             # → SESSION_SECRET
├── middleware.ts
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
└── README.md   ← you are here
```
