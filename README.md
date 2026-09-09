# Supercutz

A personal tool for generating AI ad videos. Upload footage of yourself, write or generate
a script with Claude, build a model-ready prompt, and submit it to a fal.ai video model —
all from one page.

Single-user, no accounts, no database. Everything lives in the browser tab until you close it.

## What it does

The page walks through four sections:

1. **Model** — pick a fal.ai video model. Only **Seedance 2.0**, **Seedance 2.0 Fast**, and
   **Seedance 2.5 Reference-to-Video** have a working generation adapter; the others listed
   (Kling, Happy Horse) are placeholders with no backend wiring yet and can't be used to
   generate a video.
2. **Assets** — upload a source video of yourself, an optional style/reference video, images
   (logo, product, screenshot, etc. — each tagged with a role), and optional audio.
3. **Script** — fill in campaign details (type, offer, CTA, audience, tone) and a target
   duration/aspect ratio, then either paste a transcript and have Claude clean it up, or have
   Claude write a script from scratch. Scripts come back as timecoded beats
   (`[MM:SS-MM:SS] KEEP | [BEAT]`) and can be resized to a new duration. Pick an environment
   preset (or write your own) and describe any object replacement, then build one detailed,
   model-ready prompt that references your uploaded assets as `@Image1`, `@Video1`, `@Audio1`,
   etc. — editable by hand afterward.
4. **Generate** — submit to the selected model, watch it move through Uploading → Queued →
   Generating → Processing Result → Ready, then preview and download the finished MP4.

## Environment variables

Three, all server-only — none are ever sent to the browser (no `NEXT_PUBLIC_` prefix, no
client-side reference):

| Variable | Used for | Get one at |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API calls (script generation, transcript reformatting, script resizing) | https://console.anthropic.com/settings/keys |
| `FAL_KEY` | fal.ai calls (asset uploads, video generation, status polling) | https://fal.ai/dashboard/keys |
| `SITE_PASSWORD` | Gates the whole app behind one shared password (see below) | pick your own |

Copy `.env.example` to `.env.local` and fill all three in:

```bash
cp .env.example .env.local
```

### Access gate

`src/proxy.ts` puts the entire app — the page and every `/api/*` route — behind HTTP Basic
Auth, checked against `SITE_PASSWORD`. This exists so a stranger who finds your deployed URL
can't reach the API routes and burn through your Anthropic/fal.ai credits. There's no
username; your browser will prompt for one anyway, but only the password is checked.

**It fails closed**: if `SITE_PASSWORD` isn't set, every request is denied — including your
own — rather than the app being left open. If you ever forget the password, go to Vercel →
your project → Settings → Environment Variables, update `SITE_PASSWORD`, and redeploy.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other useful commands:

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript, no emit
npm run build       # production build (also type-checks)
```

## Deploying to Vercel

1. Push this repo to GitHub (or import it directly into Vercel from a Git provider).
2. In Vercel, import the project — it's auto-detected as Next.js, no build configuration needed.
3. Add the three environment variables above (`ANTHROPIC_API_KEY`, `FAL_KEY`,
   `SITE_PASSWORD`) under Project Settings → Environment Variables.
4. Deploy.

No database, KV store, or Blob storage is needed — this version doesn't use any.

## No persistence

This version has no database or file storage. Uploaded assets live in browser memory only
for the current session, and generated videos are served from fal.ai's temporary storage —
**download the finished MP4 before closing the tab**. Nothing is saved between sessions, and
there's no history or gallery of past generations.

## Known limitations

- **Upload size**: asset uploads pass through this app's own server route before reaching
  fal.ai's storage, so on Vercel they're subject to the platform's default 4.5 MB serverless
  request body limit. Large source videos can exceed this.
- **Seedance 2.0/2.5 endpoint IDs are unverified**: the fal.ai model IDs configured for these
  three models follow fal's established naming convention but haven't been confirmed against
  fal's live catalog. If generation fails immediately with a "not found"-style error, check
  the endpoint string in `src/lib/models.ts` against your fal.ai dashboard.
- **Aspect ratio isn't cross-validated against the model** in the Script section — an
  incompatible choice will surface as a failed generation with the server's validation
  message, rather than being caught earlier in the form.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, `@anthropic-ai/sdk` for Claude, and
`@fal-ai/client` for fal.ai (queue-based submission, not the blocking `run`/`subscribe`
calls, so generations don't time out serverless functions).
