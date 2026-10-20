import { Container } from "@/components/layout/section";
import { PaletteTrigger } from "@/components/palette-trigger";
import { HeroVisual } from "@/components/three/hero-visual";
import { site } from "@/data/site";

const facts = [
  { value: "4+ yrs", label: "React in production" },
  { value: "1.0", label: "VS Code extension shipped" },
  { value: "Łódź", label: "Poland · CET" },
];

/** Staggered entrance, done in CSS so the text is painted immediately and never waits for JS. */
const rise = (delay: number) => ({ animation: `rise-in 0.9s var(--ease-out-expo) ${delay}ms both` });

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative flex min-h-svh flex-col pt-16">
      <Container className="relative grid flex-1 items-center gap-10 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="relative z-10">
          <p style={rise(0)} className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-muted uppercase">
            <span className="relative flex size-2">
              <span className="animate-pulse-dot absolute inset-0 rounded-full bg-lime" />
            </span>
            {site.role} — {site.location}
          </p>

          <h1
            id="hero-heading"
            style={rise(80)}
            className="mt-8 font-display text-[clamp(2.75rem,6.6vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.035em] text-balance"
          >
            Interfaces that feel fast.{" "}
            <span className="text-muted">Tools that make them faster.</span>
          </h1>

          <p style={rise(160)} className="mt-8 max-w-xl text-lg leading-relaxed text-pretty text-muted">
            I&apos;m Kacper — a React developer at Komfort, shipping production React and Next.js: reservation
            flows, marketing sites, performance work and analytics. In my own time I build tools for developers,
            like a VS Code extension now on the Marketplace.
          </p>

          <div style={rise(240)} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#work"
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-lime px-6 font-medium text-bg transition-colors hover:bg-fg"
            >
              Explore my work
              <span aria-hidden className="transition-transform group-hover:translate-y-0.5">↓</span>
            </a>
            <a
              href={site.github}
              className="group inline-flex h-12 items-center gap-3 rounded-full border border-line px-6 font-medium transition-colors hover:border-fg"
            >
              GitHub
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
            </a>
          </div>

          <div style={rise(320)} className="mt-6 hidden md:block">
            <PaletteTrigger variant="hint" />
          </div>
        </div>

        <div className="pointer-events-none absolute -top-10 -right-24 size-90 opacity-60 sm:size-110 lg:pointer-events-auto lg:relative lg:top-auto lg:right-auto lg:aspect-square lg:size-auto lg:opacity-100">
          <HeroVisual />
        </div>
      </Container>

      <Container>
        <dl
          style={rise(420)}
          className="grid grid-cols-3 gap-4 border-t border-line py-5 font-mono text-[11px] text-muted md:text-xs"
        >
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse gap-1 md:flex-row-reverse md:items-baseline md:justify-end md:gap-3">
              <dt>{fact.label}</dt>
              <dd className="text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
