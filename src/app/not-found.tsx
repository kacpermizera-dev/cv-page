import Link from "next/link";
import { Container } from "@/components/layout/section";

export default function NotFound() {
  return (
    <Container className="flex min-h-[80svh] flex-col justify-center pt-16">
      <p className="font-mono text-xs tracking-[0.2em] text-lime uppercase">Error 404</p>
      <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight md:text-7xl">Nothing lives here.</h1>
      <p className="mt-6 max-w-md text-lg text-muted">The page moved or never existed. The work is still where it was.</p>
      <Link
        href="/"
        className="mt-10 inline-flex h-12 w-fit items-center gap-3 rounded-full bg-lime px-6 font-medium text-bg transition-colors hover:bg-fg"
      >
        ← Back home
      </Link>
    </Container>
  );
}
