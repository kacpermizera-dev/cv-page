import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/layout/section";
import { StackList } from "@/components/projects/project-parts";
import { education, languages, roles } from "@/data/experience";
import { site } from "@/data/site";

export function Experience() {
  return (
    <Section
      id="experience"
      index="02"
      label="Experience"
      title="Four years of shipping React in production."
      intro="Most of my work happens inside a product team at Komfort — the side projects above are where I explore."
    >
      <ol className="grid">
        {roles.map((role, index) => (
          <Reveal
            as="li"
            key={`${role.company}-${role.start}`}
            delay={index * 60}
            className="grid gap-4 border-t border-line py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10"
          >
            <div className="font-mono text-xs text-muted">
              <p className="text-fg">
                {role.start} — {role.end}
              </p>
              <p className="mt-1">{role.location}</p>
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {role.title}{" "}
                <span className="text-muted">
                  @{" "}
                  {role.companyUrl ? (
                    <a href={role.companyUrl} target="_blank" rel="noopener" className="link-line hover:text-fg">
                      {role.company}
                    </a>
                  ) : (
                    role.company
                  )}
                </span>
              </h3>
              {role.note ? <p className="mt-2 font-mono text-xs text-lime/80">{role.note}</p> : null}
              <ul className="mt-6 grid max-w-2xl gap-3 leading-relaxed text-muted">
                {role.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-lime" />
                    <span className="text-pretty">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <StackList stack={role.stack} />
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-bg p-6">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Education</p>
          <p className="mt-3 font-display text-lg font-semibold">{education.degree}</p>
          <p className="mt-1 text-sm text-muted">
            {education.school} · {education.start}–{education.end}
          </p>
        </div>
        <div className="bg-bg p-6">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Languages</p>
          <ul className="mt-3 grid gap-1">
            {languages.map((language) => (
              <li key={language.name} className="flex justify-between gap-4">
                <span className="font-display text-lg font-semibold">{language.name}</span>
                <span className="font-mono text-sm text-muted">{language.level}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-4 bg-bg p-6 sm:col-span-2 lg:col-span-1">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Full CV</p>
          {site.cvUrl ? (
            <a href={site.cvUrl} download className="group inline-flex items-center gap-2 font-display text-lg font-semibold">
              <span className="link-line">Download PDF</span>
              <span aria-hidden className="text-lime transition-transform group-hover:translate-y-0.5">↓</span>
            </a>
          ) : (
            <a href="#contact" className="group inline-flex items-center gap-2 font-display text-lg font-semibold">
              <span className="link-line">Available on request</span>
              <span aria-hidden className="text-lime">→</span>
            </a>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
