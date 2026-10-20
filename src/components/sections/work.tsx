import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFeature } from "@/components/projects/project-feature";
import { featuredProjects, otherProjects } from "@/data/projects";

export function SelectedWork() {
  return (
    <Section
      id="work"
      index="01"
      label="Selected work"
      title="Things I've built on my own time."
      intro="Not screenshots — the real thing. Click around the extension below, or launch the weather app right here on the page."
    >
      <div className="grid gap-28 md:gap-40">
        {featuredProjects.map((project, index) => (
          <ProjectFeature key={project.slug} project={project} index={index} />
        ))}
      </div>

      {otherProjects.length > 0 ? (
        <div className="mt-28 md:mt-40">
          <Reveal>
            <h3 className="mb-8 font-mono text-xs tracking-[0.2em] text-muted uppercase">More work</h3>
          </Reveal>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {otherProjects.map((project, index) => (
              <Reveal as="li" key={project.slug} delay={index * 60}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
