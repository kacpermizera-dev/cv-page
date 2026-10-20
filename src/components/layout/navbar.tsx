import Link from "next/link";
import { PaletteTrigger } from "@/components/palette-trigger";
import { navLinks } from "@/data/site";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-bg/70 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-10">
        <Link href="/" className="group font-mono text-sm tracking-tight" aria-label="Kacper Mizera — home">
          <span className="text-lime transition-colors group-hover:text-fg">~/</span>
          kacper<span className="text-muted">.mizera</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-8">
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-line text-sm text-muted hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <PaletteTrigger />
        </div>
      </nav>
    </header>
  );
}
