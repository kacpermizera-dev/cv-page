import Link from "next/link";
import type { Project } from "@/data/projects";

/** Compact entry for non-featured projects in the "More work" grid. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-line bg-surface/60 p-6 transition-colors hover:border-lime/50">
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
        {project.category} · {project.year}
      </p>
      <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
          {project.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-pretty text-muted">{project.summary}</p>
      <p className="mt-5 font-mono text-xs text-muted">{project.stack.slice(0, 4).join(" · ")}</p>
      <span aria-hidden className="absolute top-6 right-6 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime">
        ↗
      </span>
    </article>
  );
}
