export const site = {
  name: "Kacper Mizera",
  role: "React Developer",
  location: "Łódź, Poland",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "React developer from Łódź building fast, considered interfaces with React, Next.js and TypeScript — and developer tools that make building them faster.",
  email: "kacper.mizera729@gmail.com",
  github: "https://github.com/kacpermizera-dev",
  /** Set to a LinkedIn profile URL to show it in the contact section and command palette. */
  linkedin: undefined as string | undefined,
  /** Path to a CV in /public (e.g. "/cv-kacper-mizera.pdf"). The download button is hidden while unset. */
  cvUrl: undefined as string | undefined,
  copyrightYear: 2026,
} as const;

export const navLinks = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
] as const;
