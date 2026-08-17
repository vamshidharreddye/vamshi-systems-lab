# Vamshi Systems Lab

An inspectable personal engineering environment for Vamshi Endurthi. The site makes software behavior visible through architecture traces, deterministic Lab instruments, source-aware engineering Signals, and technical Field Notes. Its visual system is spatial and cinematic, but every interaction exists to explain state, causality, or a system boundary.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 plus scoped CSS modules
- Motion for purposeful transitions and reduced-motion-aware simulation behavior
- MDX for statically compiled Field Notes
- Zod at external data boundaries
- Vitest for models and data utilities
- Playwright for browser-level route, interaction, responsive, and accessibility smoke tests

There is no database, authentication layer, analytics dependency, paid API, or required secret for the base experience.

## Run locally

Prerequisites: a current Node.js LTS release and npm. Then:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. For a production-like local run:

```bash
npm run build
npm run start
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run start:public` | Serve the production build on port 3000 for a tunnel |
| `npm run tunnel` | Expose port 3000 through the installed ngrok CLI |
| `npm run lint` | Run ESLint across source, tests, and configuration |
| `npm run typecheck` | Type-check without emitting files |
| `npm test` | Run deterministic Vitest suites once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run Playwright browser tests |
| `npm run test:e2e:update` | Update intentional Playwright snapshots |

Install the browser runtime once before running E2E tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright reuses an app already running on port `3000`, or starts one when needed. Set `PLAYWRIGHT_BASE_URL` to test an already-running deployment at another origin, or `PLAYWRIGHT_PORT` to use a different local test port when no Next.js development process owns the workspace.

## Routes

- `/` — identity, signature architecture preview, system tableaux, and environment entry points
- `/systems` — five distinct interactive system explorations
- `/systems/project-wifi` — full Project WiFi simulation and case study
- `/lab` — retry, backpressure, retrieval, routing, and latency instruments
- `/signals` — filtered engineering intelligence with source and cache metadata
- `/field-notes` and `/field-notes/[slug]` — statically generated MDX notes
- `/about` — engineering themes, principles, and optional external contact links
- `/api/health` — no-store process health response
- `/api/signals` — normalized Signals feed response

The persistent shell supplies navigation, route state, the command palette (`Ctrl/Cmd + K`), route transitions, and X-Ray Mode. X-Ray preference is stored locally in the browser; it does not leave the device.

## Architecture and data provenance

The App Router keeps page metadata, static MDX, and Signals retrieval on the server while interactive simulations cross explicit client boundaries. Project WiFi and every Lab instrument use deterministic in-browser state; animation duration is never presented as real infrastructure latency. See [docs/architecture.md](docs/architecture.md) for the internal data-flow and rendering-boundary map.

Reference repositories were inspected read-only through the already-connected GitHub app during implementation. No personal access token was requested, created, stored, or added as configuration. The public `llmlocalai` repository may be linked directly. Project WiFi, ClipStash, Application Intelligence, and Network Lab are private, so the UI exposes only verified, sanitized architecture with the label `Private source · architecture shown`; it does not manufacture inaccessible repository links.

Project WiFi's canonical demonstration path is:

```text
Echo → Routine → Skill → Lambda → ngrok → webhook → SSE → React
```

The portfolio simulation is local and deterministic. It does not call the private system, accept production events, expose secrets, or claim measured AWS/ngrok/SSE latency.

Signals uses server-side adapters for GitHub Changelog, Hugging Face, AWS Machine Learning, and arXiv. Entries are normalized, deduplicated, deterministically ranked, and cached in process memory. Adapter failures are isolated; stale cache can be reused, and a clearly labelled curated first-party reference set keeps the page useful when every upstream source is unavailable. No fetched feed data is persisted to disk.

## Environment variables

Copy `.env.example` to `.env.local` only when optional public metadata is needed.

| Variable | Required | Use |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute public origin used by `sitemap.xml`; defaults to `http://localhost:3000` |
| `NEXT_PUBLIC_RESUME_URL` | No | Shows a small external/PDF résumé link on About |
| `NEXT_PUBLIC_LINKEDIN_URL` | No | Shows an external LinkedIn link on About |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Shows a direct email link on About |
| `SIGNALS_CACHE_TTL_MS` | No | Overrides the 15-minute Signals source-cache lifetime, clamped to 10–30 minutes |

Only place deliberately public values in `NEXT_PUBLIC_*` variables. Do not add repository tokens, webhook secrets, private URLs, or a GitHub PAT.

## Run through ngrok

Install the ngrok CLI, create a free ngrok account, and authenticate the workstation once. Retrieve the token from the ngrok dashboard and enter it directly in your own terminal; never add it to this repository or an environment file:

```powershell
ngrok config add-authtoken "<YOUR_NGROK_AUTHTOKEN>"
```

For a production-like public preview, use two terminals:

```powershell
# Terminal 1
npm run build
npm run start:public
```

```powershell
# Terminal 2
npm run tunnel
```

ngrok prints an HTTPS forwarding URL such as `https://example.ngrok-free.app`. The free URL is generally temporary and remains available only while both processes are running.

For rapid development review, use the same tunnel command with the development server:

```powershell
npm run dev
npm run tunnel
```

Run those two commands in separate terminals. Set `NEXT_PUBLIC_SITE_URL` to a stable HTTPS origin before building when canonical sitemap URLs matter. Browser requests use same-origin paths, so the portfolio itself does not require a hard-coded localhost URL.

The `localhost:8787` references inside the Project WiFi case study describe that separate system's local webhook/SSE receiver. They are explanatory and are not a runtime dependency of this website.

## Content editing

- Add or revise project identity/provenance in `src/lib/projects.ts`, then implement any system-specific behavior in `src/components/systems`. A public source link must only be present when the repository is actually public.
- Add a Field Note as an MDX file under `src/content/notes`, then register its slug, metadata, component, and related links in `src/lib/notes/index.ts`. The detail route is generated from that registry.
- Signals sources live in `src/lib/signals/adapters.ts`; stable outage references live in `src/lib/signals/curated.ts`. Keep normalization and ranking deterministic and covered by tests.
- Project WiFi's browser model lives in `src/lib/wifi`; Lab's pure educational models live in `src/lib/lab`. Keep UI timing separate from any real infrastructure-performance claim.

## Security

`next.config.mjs` applies `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, same-origin frame protection, and a Permissions Policy that disables camera, microphone, and geolocation. External article and source links open with `noopener noreferrer`.

The repository contains no GitHub PAT, project credential, private tunnel URL, production payload, private project/production IP address, or generated WireGuard configuration. A strict Content Security Policy is not hard-coded because Next.js emits bootstrap scripts that require a nonce-aware deployment policy; adding per-request nonces at the deployment edge is preferred to weakening CSP with a broad inline-script exception.

## Accessibility and performance constraints

- Semantic landmarks, headings, named controls, visible keyboard focus, a skip link, and keyboard-operable navigation are release requirements.
- The command palette supports keyboard navigation; Lab tabs and Project WiFi stages expose native focus/ARIA state.
- `prefers-reduced-motion` shortens or removes non-essential movement and preserves a readable stepped Project WiFi trace.
- There is no scroll hijacking. Narrow layouts use normal document flow and a vertical architecture path.
- SVG/CSS communicates topology and state without a generic particle field or decorative WebGL payload.
- Signals adapters have bounded requests and graceful fallback; one source cannot take down the page.
- Playwright checks every primary route, key shell interactions, Project WiFi state flow, reduced motion, and document-level mobile overflow.

## Known limitations

- Signals freshness depends on upstream RSS/Atom availability. Its cache is per Node.js process, resets on restart/deploy, and is not shared across instances.
- Interactive systems and Lab outputs are educational models, not connected production dashboards or benchmarks.
- Private source remains private; architecture descriptions intentionally omit secrets, private URLs, exact infrastructure identifiers, and sensitive payload fields.
- The site has no database-backed contact form, user account, cross-device preference sync, or full résumé page.
- Optional résumé, LinkedIn, and email actions remain hidden until verified values are supplied.
- X-Ray relationship lines are intentionally simplified on constrained mobile layouts; component metadata remains readable without them.
