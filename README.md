# kacper.mizera — portfolio

Personal portfolio of Kacper Mizera, React developer. Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4 and a single Three.js object in the hero.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run typecheck
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin (e.g. `https://kacper-mizera.vercel.app`) so canonical URLs, the sitemap and Open Graph images point to the right place.

## Adding a project

Everything is driven by [`src/data/projects.ts`](src/data/projects.ts). Add an entry and it appears on the home page, gets its own `/projects/<slug>` case study page, a sitemap entry and a command palette (Ctrl K) item.

- `featured: true` gives it a full block on the home page; `false` puts it in the "More work" grid.
- `showcase` decides how it is presented:
  - `embed` — a live app in an iframe, loaded only when the visitor clicks *Launch*.
  - `mockup` — a custom interactive component, registered in [`src/components/showcase/showcase.tsx`](src/components/showcase/showcase.tsx).
  - `video` — a screen recording (MP4/WebM; avoid GIFs).
  - `image` — a screenshot.
- `facts` must be verifiable. `caseStudy.lesson` is your own reflection — leave it out until it's written.

## Live demos

The weather app is built from its repository and served from `public/demos/weather`, so it is embedded from the same origin:

```bash
npm run demo:weather            # latest default branch
npm run demo:weather -- v1.2.0  # a branch, tag or commit
```

Commit the updated `public/demos/weather` afterwards.

## Other content

- Site-wide details (email, GitHub, LinkedIn, CV link): [`src/data/site.ts`](src/data/site.ts)
- Roles, education, languages: [`src/data/experience.ts`](src/data/experience.ts)
