import { Reveal } from "@/components/motion/reveal";
import { CaseStudyLink, FactStrip, ProjectLinks, StackList } from "@/components/projects/project-parts";
import { Showcase } from "@/components/showcase/showcase";
import type { Project } from "@/data/projects";

/** A featured project on the home page: a short case study next to its live showcase. */
export function ProjectFeature({ project, index }: { project: Project; index: number }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article aria-labelledby={`${project.slug}-title`} className="grid gap-10">
      <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            <span className="text-lime">{number}</span> / {project.category} · {project.year}
          </p>
          <h3 id={`${project.slug}-title`} className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {project.title}
          </h3>
          {project.status ? <p className="mt-3 font-mono text-xs text-lime/80">{project.status}</p> : null}
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-lg leading-relaxed text-pretty">{project.summary}</p>
          <div className="grid gap-5 text-sm leading-relaxed text-muted sm:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[11px] tracking-widest text-fg uppercase">Problem</p>
              <p className="text-pretty">{project.caseStudy.problem}</p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] tracking-widest text-fg uppercase">Result</p>
              <p className="text-pretty">{project.caseStudy.result}</p>
            </div>
          </div>
          <StackList stack={project.stack} />
          <div className="flex flex-wrap items-center justify-between gap-5">
            <ProjectLinks links={project.links} />
            <CaseStudyLink slug={project.slug} />
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <Showcase showcase={project.showcase} />
      </Reveal>

      {project.facts ? (
        <Reveal delay={150}>
          <FactStrip facts={project.facts} />
        </Reveal>
      ) : null}
    </article>
  );
}
