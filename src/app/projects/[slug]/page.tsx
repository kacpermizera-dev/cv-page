import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/section";
import { CaseStudy } from "@/components/projects/case-study";
import { FactStrip, ProjectLinks, StackList } from "@/components/projects/project-parts";
import { Showcase } from "@/components/showcase/showcase";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: "article" },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="pt-32 pb-24 md:pt-40">
      <Container>
        <Link href="/#work" className="group inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-fg">
          <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span> All work
        </Link>

        <header className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
              {project.category} · {project.year}
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-balance">
              {project.title}
            </h1>
            {project.status ? <p className="mt-4 font-mono text-xs text-lime/80">{project.status}</p> : null}
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-pretty text-muted">{project.summary}</p>
            <ProjectLinks links={project.links} />
          </div>
        </header>

        <div className="mt-16">
          <Showcase showcase={project.showcase} />
        </div>

        {project.facts ? (
          <div className="mt-10">
            <FactStrip facts={project.facts} />
          </div>
        ) : null}

        <div className="mt-20">
          <CaseStudy caseStudy={project.caseStudy} />
          <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
            <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Stack</h2>
            <StackList stack={project.stack} />
          </section>
        </div>

        {next && next.slug !== project.slug ? (
          <Link
            href={`/projects/${next.slug}`}
            className="group mt-10 flex flex-col gap-3 rounded-xl border border-line p-8 transition-colors hover:border-lime/60 md:p-12"
          >
            <span className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Next project</span>
            <span className="flex items-center justify-between gap-6 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {next.title}
              <span aria-hidden className="text-lime transition-transform group-hover:translate-x-2">→</span>
            </span>
          </Link>
        ) : null}
      </Container>
    </article>
  );
}
