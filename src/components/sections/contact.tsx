import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/layout/section";
import { CopyEmail } from "@/components/sections/copy-email";
import { site } from "@/data/site";

export function Contact() {
  const links = [
    { label: "GitHub", href: site.github },
    ...(site.linkedin ? [{ label: "LinkedIn", href: site.linkedin }] : []),
  ];

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-24 md:py-40">
      <Container>
        <Reveal className="border-t border-line pt-6">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            <span className="text-lime">[04]</span> Contact
          </p>
          <h2
            id="contact-heading"
            className="mt-10 font-display text-[clamp(2.75rem,9vw,8rem)] leading-[0.92] font-semibold tracking-[-0.04em] text-balance"
          >
            Let&apos;s build <span className="text-lime">something</span> good.
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="max-w-md text-lg text-pretty text-muted">
              Open to conversations about React and frontend roles, and interesting projects. Email is the fastest way to reach me.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${site.email}`}
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-lime px-6 font-medium text-bg transition-colors hover:bg-fg"
              >
                {site.email}
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <CopyEmail email={site.email} />
            </div>
          </div>

          <ul className="flex gap-6 font-mono text-sm">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener" className="link-line text-muted hover:text-fg">
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
