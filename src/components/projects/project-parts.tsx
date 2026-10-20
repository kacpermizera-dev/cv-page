import Link from "next/link";
import { Chip } from "@/components/layout/section";
import type { Project, ProjectLink } from "@/data/projects";
import { cn } from "@/lib/cn";

const linkIcon: Record<ProjectLink["kind"], string> = {
  repo: "</>",
  live: "▶",
  store: "⬇",
  article: "¶",
};

export function ProjectLinks({ links, className }: { links: ProjectLink[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-3", className)}>
      {links.map((link) => {
        const external = link.href.startsWith("http");
        return (
          <li key={link.href}>
            <a
              href={link.href}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
              className="group inline-flex h-10 items-center gap-2.5 rounded-full border border-line px-4 text-sm transition-colors hover:border-lime hover:text-lime"
            >
              <span aria-hidden className="font-mono text-xs text-muted group-hover:text-lime">
                {linkIcon[link.kind]}
              </span>
              {link.label}
              {external ? <span aria-hidden className="text-muted group-hover:text-lime">↗</span> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function StackList({ stack }: { stack: string[] }) {
  return (
    <ul aria-label="Technologies" className="flex flex-wrap gap-2">
      {stack.map((item) => (
        <li key={item}>
          <Chip>{item}</Chip>
        </li>
      ))}
    </ul>
  );
}

export function FactStrip({ facts }: { facts: NonNullable<Project["facts"]> }) {
  return (
    <dl className="grid grid-cols-2 border-y border-line sm:grid-cols-4">
      {facts.map((fact, index) => (
        <div
          key={fact.label}
          className={cn("flex flex-col-reverse gap-1 py-4", index > 0 && "sm:border-l sm:border-line sm:pl-5")}
        >
          <dt className="font-mono text-[11px] tracking-wider text-muted uppercase">{fact.label}</dt>
          <dd className="font-display text-xl font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CaseStudyLink({ slug }: { slug: string }) {
  return (
    <Link href={`/projects/${slug}`} className="group inline-flex items-center gap-2 font-mono text-sm text-lime">
      <span className="link-line">Read the case study</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}
