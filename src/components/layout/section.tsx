import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { ScrambleText } from "@/components/motion/scramble-text";
import { cn } from "@/lib/cn";

type SectionProps = {
  id: string;
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({ id, index, label, title, intro, children, className }: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className={cn("py-24 md:py-36", className)}>
      <Container>
        <Reveal className="mb-14 grid gap-6 border-t border-line pt-6 md:mb-20 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            <span className="text-lime">[{index}]</span> <ScrambleText text={label} />
          </p>
          <div>
            <h2
              id={headingId}
              className="font-display text-4xl font-semibold tracking-tight text-balance md:text-6xl"
            >
              {title}
            </h2>
            {intro ? <p className="mt-5 max-w-2xl text-lg text-pretty text-muted">{intro}</p> : null}
          </div>
        </Reveal>
        {children}
      </Container>
    </section>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 md:px-10", className)}>{children}</div>;
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-3 py-1 font-mono text-xs text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
