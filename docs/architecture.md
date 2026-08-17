# Internal architecture

This document records the rendering boundaries, state ownership, and failure behavior behind Vamshi Systems Lab. The central constraint is simple: the site has no database and must remain useful when every optional external source is unavailable.

## Runtime shape

```text
Incoming request
  → Next.js App Router
    → server route/page metadata
    → RootLayout
      → SystemShell client boundary
        → persistent navigation / command palette / X-Ray state
        → server-rendered or client-interactive route content
```

`RootLayout` owns document metadata, fonts, and the persistent shell. `SystemShell` is a client component because it coordinates pathname state, the command palette, mobile navigation, route transitions, and X-Ray preference. Server-rendered children are passed through that boundary rather than refetched in the browser.

| Surface | Primary render/data boundary | Persistent state |
| --- | --- | --- |
| Home | Client interaction over static project content | Component state only |
| Systems | Client interaction over verified static project definitions | Component state only |
| Project WiFi | Server page/case study plus client simulation | Reducer state only |
| Lab | Server route plus five client instruments | Component/model state; experiment in URL |
| Signals | Server feed assembly plus client URL filters | In-memory server cache; category in URL |
| Field Notes | Build-time MDX and static params | None |
| About | Server-rendered static content and public env links | None |
| X-Ray | Persistent client shell | `localStorage` preference only |

## Persistent shell and X-Ray

The shell is deliberately outside individual route compositions. Navigation, route labels, X-Ray state, and command actions therefore keep the same interaction grammar while page content changes.

Inspectable regions declare:

- a stable `data-inspect-id` identity;
- an optional `data-inspect-relationship` pointing to an upstream region;
- component identity plus accurate execution and source metadata;
- optional cache and interactivity detail.

When X-Ray is enabled, `Inspectable` renders a focusable metadata tag without replacing the underlying content. `XRayCanvas` measures currently visible related regions and draws non-interactive SVG paths between their centers. Resize and scroll observers remeasure the paths. On narrow viewports, connection drawing is suppressed while the inline metadata remains available, avoiding unreadable line overlap.

The boolean preference is stored under `vamshi-systems-xray` in browser `localStorage`. No inspection data is transmitted or persisted elsewhere.

## Project WiFi state machine

The case study has server-rendered narrative surrounding a deterministic client reducer. The reducer enforces this ordered stage list:

```text
echo → routine → skill → lambda → ngrok → webhook → sse → react
```

State tracks run status, safe simulation event ID and kind, current and selected stages, browser-measured elapsed animation time, final presence, configured failure, stage history, and run sequence. Supported actions are `START`, `ADVANCE`, `PAUSE`, `RESUME`, `STEP`, `REPLAY`, `RESET`, `TICK`, `SELECT_STAGE`, `CONFIGURE_FAILURE`, and `FAIL`.

The UI derives current-stage, inspector, failure, and visual-node state through selectors. It never calls the private service. Failure branches stop at their real architectural boundary: Lambda timeout, tunnel/receiver unavailable, webhook 401, unsupported-event 400, or SSE reconnecting. Reduced-motion preference swaps the long cinematic interval for a short stepped sequence and removes continuous path animation.

All displayed elapsed values are labelled simulation time. They measure the browser sequence and make no latency claim about Echo, AWS, ngrok, the webhook receiver, or SSE.

## Lab models

The Lab is a client workbench backed by deterministic TypeScript functions in `src/lib/lab/models.ts`. The vertical tab rail selects one of five instruments and writes the selected experiment to the query string so the view is linkable without server persistence.

- Retry Storm models attempt amplification, backoff, jitter, and recovery shape.
- Backpressure models arrival/service rates, bounded queue pressure, admission, and drops.
- RAG Microscope models chunking, lexical/vector-like ranking, top-k selection, and context pressure over a fixed educational corpus.
- Agent Router exposes deterministic specialist scoring and routing reasons.
- Latency Budget composes stage budgets into an end-to-end envelope.

Inputs stay in the browser. There is no live model inference, vector database, queue, cloud resource, or benchmark behind these instruments. Pure model tests protect their numerical invariants independently from the rendered controls.

## Signals data path

```text
GitHub Changelog ─┐
Hugging Face ─────┤
AWS ML ───────────┼→ bounded adapters → normalize → deduplicate → rank → server page/API
arXiv cs.AI ──────┘          │
                             ├→ fresh in-memory snapshot
                             ├→ stale per-source snapshot after failure
                             └→ curated reference fallback when all sources fail
```

Each adapter makes a server-side RSS/Atom request with a six-second abort boundary and parses at most sixteen entries. Normalization strips markup, validates usable HTTP(S) links, classifies categories/tags, and creates a stable internal shape. Ranking is deterministic and source-aware; it is not model-generated analysis.

Sources load concurrently with `Promise.allSettled`, so a single rejection is isolated. The source cache lives in the Node.js process, uses a fifteen-minute default source TTL, and accepts a bounded 10–30 minute override through `SIGNALS_CACHE_TTL_MS`. It stores short two-minute failure snapshots. A stale successful snapshot may be served after an adapter failure. If no live/stale items exist, curated links to first-party technical resources are clearly identified as curated instead of being presented as current news.

`/signals` renders the assembled feed on the server. Client filtering writes `category` into the URL. `/api/signals` exposes the same normalized response with `Cache-Control: no-store`; the internal per-source memory cache still prevents repeated upstream work. Cache contents disappear on process restart and are never shared between instances.

## MDX Field Notes

Field Note bodies live in `src/content/notes/*.mdx`. `src/lib/notes/index.ts` is the explicit content registry for slug, title, thesis, publication date, reading time, tags, sequence, related links, and compiled component. The index route reads that registry, and `[slug]` uses `generateStaticParams` to produce static pages.

This explicit registry avoids runtime filesystem reads and keeps metadata reviewable. Adding a note requires both the MDX file and its registry entry. Related links are ordinary internal routes and should be verified by E2E or link checks.

## No-database data ownership

| Data | Owner | Lifetime |
| --- | --- | --- |
| Project definitions and case-study copy | Repository source | Build/deploy |
| Field Notes | Repository MDX | Build/deploy |
| Project WiFi simulation | Browser reducer | Current page session |
| Lab controls and outputs | Browser component state | Current page session |
| Selected Lab experiment | URL query | Shareable URL/history |
| Signal category | URL query | Shareable URL/history |
| Signals source snapshots | Node.js memory | TTL or process restart |
| X-Ray preference | Browser `localStorage` | Same browser/origin |
| Optional public contact links | Build/runtime environment | Deployment configuration |

No flow writes user content to a backend. `/api/health` reports `storage: "none"`. There is no auth session, contact submission, analytics event store, or cross-device preference service.

## Repository provenance and trust boundary

Reference projects were read through the connected GitHub app without a personal access token. Only the public Local AI repository receives a source link. Private projects surface sanitized, verified architecture and the neutral disclosure `Private source · architecture shown`; private repository URLs, secrets, credentials, source payloads, IPs, and deployment identifiers remain outside the rendered site.

Simulation fixtures, demo clips, job data, route state, and latency values are labelled deterministic, fictional, illustrative, or browser-measured where appropriate. The portfolio must not imply production traffic, user counts, benchmarks, uptime, or capabilities absent from the reference implementation.

## Verification boundaries

Vitest covers pure WiFi, Lab, normalization, ranking, and cache behavior. Playwright covers primary routes, the command palette, X-Ray persistence, an eight-stage Project WiFi trace, reduced motion, a static MDX route, mobile navigation, and document-level horizontal overflow. A release still requires a production build and rendered desktop/mobile visual review; automated smoke tests do not validate composition quality on their own.
