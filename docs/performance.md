# Performance

## Method

- Production build (`npm run build`) served by the API with `NODE_ENV=production`, pre-compressed
  assets, local PostgreSQL 16 with the development seed (28 tutorials).
- Lighthouse 12.8.2, headless Chromium 141, default **mobile** profile (simulated slow 4G, 4× CPU
  slowdown, Moto G Power viewport) and `--preset=desktop`. One run per page; a run that failed with a
  Lighthouse tracing error was repeated.
- API latency: 200 sequential requests per endpoint from the same host (`fetch`), excluding no outliers.
- Date: 2026-10-16, cloud container (4 vCPU).

## Results

| Page | Profile | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --: | --: | --: | --: | --: | --: | --: | --: |
| `/` | mobile | 98 | 100 | 100 | 100 | 1.7 s | 1.9 s | 70 ms | 0 |
| `/tutorials` | mobile | 97 | 100 | 100 | 100 | 1.9 s | 2.3 s | 50 ms | 0 |
| `/tutorials/14` | mobile | 98 | 100 | 100 | 100 | 1.8 s | 2.1 s | 20 ms | 0 |
| `/` | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0.5 s | 0 ms | 0 |
| `/tutorials` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0.6 s | 0 ms | 0 |
| `/tutorials/14` | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0.5 s | 0 ms | 0.001 |

Interaction to Next Paint needs real user input and is not produced by a Lighthouse navigation run;
Total Blocking Time (≤ 70 ms) is the lab proxy. Admin pages were not scored (behind sign-in).

### Initial bundle (home page)

| Asset | Raw | Brotli | Gzip |
| --- | --: | --: | --: |
| `react` vendor chunk (react, react-dom, react-router) | 283 KiB | 79 KiB | 91 KiB |
| `query` vendor chunk | 35 KiB | 9 KiB | 10 KiB |
| app entry | 36 KiB | 11 KiB | 12 KiB |
| **JavaScript total** | 354 KiB | **99 KiB** | 113 KiB |
| CSS | 40 KiB | 7 KiB | 8 KiB |
| Manrope (latin, variable) | 25 KiB | — | — |

Admin screens load as separate chunks only after sign-in.

### API latency (seeded catalogue)

| Endpoint | p50 | p95 |
| --- | --: | --: |
| `GET /tutorials?pageSize=12` | 4.4 ms | 7.2 ms |
| `GET /tutorials?search=data&sort=title` | 4.3 ms | 5.9 ms |
| `GET /tutorials/14` | 3.5 ms | 5.1 ms |
| `GET /categories` | 1.2 ms | 1.5 ms |

## What changed during measurement

| Finding | Fix | Effect |
| --- | --- | --- |
| Static assets served uncompressed (Lighthouse: 274 KiB savings) | Build writes `.br`/`.gz`; `@fastify/static` `preCompressed` | Mobile perf 68 → 98 on `/` |
| Footer started on-screen then moved as content loaded (CLS 0.205) | `main` is at least one viewport tall | CLS 0 |
| “Related tutorials” fired an unfiltered request and briefly showed unrelated cards (CLS 0.105 desktop) | Query waits for the category; no placeholder data | CLS 0.001, one fewer request |
| Logo accent contrast 4.49:1 | Darker accent token | A11y 96 → 100 |
| Heading levels skipped on the catalogue | Hidden “Results” `h2` | A11y 98 → 100 |
| Fonts inlined as `data:` URIs were blocked by CSP | `assetsInlineLimit: 0` | Fonts load, no console errors |
| `/auth/me` 401 logged on every anonymous page | `GET /auth/session` returns `200 { data: null }` | Clean console |

## Remaining considerations

- At larger catalogue sizes, `search` uses `ILIKE '%…%'` on title and description, which cannot use a
  B-tree index. If search becomes slow, add a `pg_trgm` GIN index or PostgreSQL full-text search.
- LCP on throttled mobile is dominated by downloading the React vendor chunk before first render.
  Server-side rendering or pre-rendering the public pages would be the next step if needed.
