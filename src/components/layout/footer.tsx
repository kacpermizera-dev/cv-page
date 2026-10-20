import { Container } from "@/components/layout/section";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <Container className="flex flex-col gap-3 font-mono text-xs text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {site.copyrightYear} {site.name}
        </p>
        <p>
          Designed &amp; built by me · Next.js · TypeScript · Three.js ·{" "}
          <a href={`${site.github}/cv-page`} className="link-line hover:text-fg">
            source
          </a>
        </p>
      </Container>
    </footer>
  );
}
