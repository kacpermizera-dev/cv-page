import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";

const areas = [
  {
    title: "UI engineering",
    body: "Semantic, accessible components that hold up across breakpoints, browsers and keyboards — not just the happy path in Chrome.",
  },
  {
    title: "Interaction design",
    body: "Motion and feedback with a job to do: loading, empty and error states that tell people what just happened.",
  },
  {
    title: "Frontend architecture",
    body: "Typed data flows, small focused modules and code that's easy to review — the kind I'd want to inherit.",
  },
  {
    title: "Performance & analytics",
    body: "Measure first. Analytics and profiling decide what gets optimised, then the numbers confirm it worked.",
  },
];

export function About() {
  return (
    <Section
      id="about"
      index="03"
      label="Approach"
      title="Care about the details the user never notices."
      intro="I started with plain HTML and CSS, moved through JavaScript into React, and today spend my days on Next.js and TypeScript. What hasn't changed: I like interfaces that feel obvious, and code that stays easy to change."
    >
      <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
        {areas.map((area, index) => (
          <Reveal as="li" key={area.title} delay={index * 70} className="bg-bg p-8 md:p-10">
            <p className="font-mono text-xs text-lime">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">{area.title}</h3>
            <p className="mt-3 leading-relaxed text-pretty text-muted">{area.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
