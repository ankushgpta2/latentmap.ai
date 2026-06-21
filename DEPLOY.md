# Deploying `lml-web` to `latentmap.ai`

This is the **exact, ordered checklist** for migrating this Next.js app into
your existing `github.com/<you>/latentmap.ai` repo and getting it live at
`https://www.latentmap.ai`. Read top to bottom; do not skip steps.

> **Headline:** the existing repo today serves a **static** site through
> **GitHub Pages**. This app **cannot** run on GitHub Pages — it needs a
> Node.js runtime for middleware (auth gating), API routes
> (`/api/auth/login`, `/api/auth/logout`), and HS256 JWT minting/verification.
> The path is: **same GitHub repo, different hosting**. We host on **Vercel**
> (free tier, native Next.js support), repoint DNS, and disable the old
> GitHub Pages workflow.

---

## 0. What you'll need

| Item | Where to get it |
|---|---|
| A Vercel account | <https://vercel.com/signup> — free Hobby tier is enough |
| Push access to `github.com/<you>/latentmap.ai` | Already have it |
| DNS access for `latentmap.ai` | Wherever the domain is registered (Namecheap, GoDaddy, Cloudflare, etc.) |
| ~15 minutes | One-time setup; subsequent deploys are git-push |

---

## 1. Generate production secrets (locally, do not commit)

```bash
cd /Users/aguptaz716/Code/kb-private/Personal/latentmap/website/lml-web

# 1a. Generate a signing secret for JWT session cookies.
npm run generate-secret
#   Copy the line that starts with: SESSION_SECRET=...

# 1b. Generate the SHA-256 hash of your real invite code.
#     (Pick a code you'll actually share with collaborators, e.g.
#      something memorable but not guessable.)
npm run generate-hash
#   Type the plaintext invite code, press Enter.
#   Copy the line that starts with: INVITE_CODE_HASH=...
```

Save both values in a password manager. You will paste them into Vercel in
step 4. **Never** commit them to git — `.gitignore` already excludes
`.env.local`.

---

## 2. Replace the contents of your existing repo

The old repo is currently the Jekyll site at
`/Users/aguptaz716/Code/kb-private/Personal/latentmap/website/latentmap.ai`.
We are going to **wipe the tracked content** (preserving git history) and
copy this Next.js app in its place.

```bash
# Move into the existing GitHub clone.
cd /Users/aguptaz716/Code/kb-private/Personal/latentmap/website/latentmap.ai

# Confirm you're on the right remote.
git remote -v
#   origin  git@github.com:<you>/latentmap.ai.git (push)

# Make a safety branch in case you want to roll back.
git checkout -b backup/jekyll-site
git push -u origin backup/jekyll-site
git checkout main

# Remove the old static site files (kept in the backup branch above).
git rm index.html platform.html team.html careers.html blog.html styles.css CNAME
git rm your-video.mp4 home-button.gif contact-button.gif
git rm -r .github

# Copy the new app on top of the now-empty working tree.
# The trailing /. and /. matter — they include dotfiles like .gitignore,
# .env.example, .eslintrc.json, and the .github/workflows folder.
rsync -a --exclude='node_modules' --exclude='.next' --exclude='.env.local' \
  ../lml-web/. ./

# Confirm what changed.
git status
#   You should see: ~40 new tracked files, ~10 deleted files.

git add -A
git commit -m "Migrate to Next.js 15 with invite-gated research pages"
git push origin main
```

### Why we delete `CNAME`
The `CNAME` file is a **GitHub Pages-only convention**. Vercel ignores it
and instead reads your custom-domain config from the Vercel dashboard
(step 5). Leaving it behind is harmless but adds confusion.

### Why we delete `.github/workflows/jekyll-gh-pages.yml`
That workflow rebuilds and publishes a Jekyll site to GitHub Pages on every
push. Leaving it active would:
1. Keep wasting Action minutes on a build that no longer makes sense, and
2. Conflict with the `ci.yml` workflow that ships with this app.

The replacement is `.github/workflows/ci.yml` (already in this repo), which
runs `typecheck`, `lint`, and `build` on every push and PR.

---

## 3. Sanity-check the push (10 seconds)

Open `https://github.com/<you>/latentmap.ai` in a browser. You should see:

| Expected | Verify |
|---|---|
| New top-level files: `package.json`, `next.config.ts`, `app/`, `components/`, `lib/`, `middleware.ts`, `DEPLOY.md`, `README.md` | ✓ |
| Old `index.html`, `your-video.mp4` etc. are **gone** from `main` | ✓ |
| `.github/workflows/ci.yml` is present, `jekyll-gh-pages.yml` is not | ✓ |
| The new CI run on `main` is green (or still running) | Tab: **Actions** |

If anything looks off, you still have `backup/jekyll-site` to revert from.

---

## 4. Connect the repo to Vercel

1. Go to <https://vercel.com/new>.
2. Click **Import Git Repository** and select `latentmap.ai`.
3. Vercel auto-detects **Next.js**. Leave **Framework Preset**, **Build
   Command**, **Output Directory**, **Install Command**, and **Root
   Directory** at their defaults (root = repo root). Do **not** override
   them.
4. Expand **Environment Variables** and add these four for the **Production**
   environment (and add the same set for **Preview** if you want PR previews
   to also be gated):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://www.latentmap.ai` |
   | `NEXT_PUBLIC_CANONICAL_HOST` | `www.latentmap.ai` |
   | `INVITE_CODE_HASH` | The hash from step 1b |
   | `SESSION_SECRET` | The secret from step 1a |

   Optional (already have sane defaults in code):

   | Name | Value |
   |---|---|
   | `SESSION_TTL_SECONDS` | `86400` (24h) |
   | `RATE_LIMIT_MAX_ATTEMPTS` | `5` |
   | `RATE_LIMIT_WINDOW_SECONDS` | `900` (15 min) |

5. Click **Deploy**. First build takes ~60–90 s. When it's done, Vercel
   gives you a `*.vercel.app` URL — open it, test the invite code, confirm
   `/platform` redirects to `/login` and gates correctly.

---

## 5. Attach `latentmap.ai` and `www.latentmap.ai`

In the Vercel project: **Settings → Domains → Add**.

1. Add `www.latentmap.ai` first. Vercel will tell you exactly which DNS
   record to create:
   ```
   Type:   CNAME
   Host:   www
   Value:  cname.vercel-dns.com
   ```
2. Add `latentmap.ai` (apex). Vercel will tell you to create:
   ```
   Type:   A
   Host:   @
   Value:  76.76.21.21
   ```
   (Some registrars support `ALIAS`/`ANAME` for the apex, which is
   preferable. Vercel's UI will show both options.)
3. Configure the redirect direction in the Vercel UI: pick whether
   `latentmap.ai` → `www.latentmap.ai` (recommended) or the reverse.
4. Go to your registrar's DNS panel and **delete the old GitHub Pages A
   records** (185.199.108.153 / .109.153 / .110.153 / .111.153 — there are
   typically four) and the old `www` CNAME if it pointed at GitHub.
5. Save. DNS propagates in 1–30 min on most registrars (Cloudflare is near
   instant; Namecheap/GoDaddy can take longer). Vercel will automatically
   provision a Let's Encrypt TLS cert once DNS resolves.

---

## 6. Turn off the old GitHub Pages source

`github.com/<you>/latentmap.ai` → **Settings → Pages** → set
**Source** to **None** (or **Disabled**). This stops GitHub from trying to
serve the now-deleted Jekyll site.

---

## 7. Final verification (do this from your phone, on cellular)

| Check | Pass criteria |
|---|---|
| `https://latentmap.ai` redirects to `https://www.latentmap.ai` | 301 or 308 |
| `https://www.latentmap.ai` returns 200, shows the manifesto + manifold | ✓ |
| Manifold renders, animates, responds to touch-drag | ✓ |
| Hamburger menu opens, lists all four protected sections | ✓ |
| `https://www.latentmap.ai/platform` redirects to `/login?next=/platform` | 307 |
| Login with the real invite code → bounces back to `/platform` | ✓ |
| **Sign out** clears the cookie, `/platform` is gated again | ✓ |
| Wrong invite code → "Invalid invite code." | ✓ |
| Submit 6 wrong codes in a row from one IP → rate-limit message | ✓ |
| `https://www.latentmap.ai/robots.txt` returns 200 | ✓ |
| `https://www.latentmap.ai/sitemap.xml` returns 200 with the four pages | ✓ |

If any of these fails, open the Vercel project → **Deployments** → most
recent → **Logs**. Auth issues are almost always missing or mistyped env
vars (especially `SESSION_SECRET` < 32 bytes or `INVITE_CODE_HASH` not
being a 64-char hex string).

---

## 8. Day-to-day workflow after deploy

| You want to… | You do… |
|---|---|
| Edit content / fix a typo | Push to `main` → Vercel builds + ships in ~60 s |
| Test a change before going live | Push to any branch / open a PR → Vercel makes a Preview URL automatically |
| Rotate the invite code | Run `npm run generate-hash` locally → paste new `INVITE_CODE_HASH` in Vercel → redeploy (Settings → Deployments → ⋯ → Redeploy) → share new plaintext code |
| Roll back | Vercel → Deployments → click prior deploy → **Promote to Production** |
| Pause the site | Vercel → Settings → Domains → remove the domain (or disable Production deployment) |

---

## Why GitHub Pages is not an option for this app

For completeness, here is exactly what would break if you tried to host
this on GitHub Pages (e.g. via `next export` / `output: 'export'`):

| Feature | GitHub Pages? |
|---|---|
| `middleware.ts` gating `/platform`, `/team`, etc. | ❌ No runtime — middleware never executes, every route would be public |
| `app/api/auth/login/route.ts` + `logout/route.ts` | ❌ Static hosts cannot run API routes |
| Setting `httpOnly; Secure; SameSite=Lax` session cookies | ❌ No server to set them |
| JWT (HS256) sign/verify with a server-side `SESSION_SECRET` | ❌ Secret would have to live in client JS, defeating the entire auth model |
| Rate limiting on login attempts | ❌ Nothing to rate-limit |
| HSTS + frame-ancestors security headers from `next.config.ts` | ❌ Headers come from Next runtime; GH Pages only sets its own minimal set |

So either you keep static + drop auth (and the whole "researcher access"
gate becomes decorative), or you host on a runtime platform. Vercel is the
shortest path, but Cloudflare Pages (with Workers), Netlify, Render, or
Railway all work too. Vercel happens to be the most zero-config because
Next.js is built by the same team.
