import { Reveal } from "@/components/motion/reveal";
import type { CaseStudy as CaseStudyData } from "@/data/projects";

/** The full Problem → Approach → Implementation → Result write-up on a project page. */
export function CaseStudy({ caseStudy }: { caseStudy: CaseStudyData }) {
  const parts = [
    { title: "Problem", body: <p>{caseStudy.problem}</p> },
    {
      title: "Approach",
      body: (
        <ul className="grid gap-3">
          {caseStudy.approach.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-lime" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    { title: "Implementation", body: <p>{caseStudy.implementation}</p> },
    { title: "Result", body: <p>{caseStudy.result}</p> },
    ...(caseStudy.lesson ? [{ title: "What I'd do differently", body: <p>{caseStudy.lesson}</p> }] : []),
  ];

  return (
    <div className="grid gap-0">
      {parts.map((part, index) => (
        <Reveal
          key={part.title}
          as="section"
          className="grid gap-4 border-t border-line py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10"
        >
          <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            <span className="text-lime">{String(index + 1).padStart(2, "0")}</span> — {part.title}
          </h2>
          <div className="max-w-2xl text-lg leading-relaxed text-pretty">{part.body}</div>
        </Reveal>
      ))}
    </div>
  );
}
