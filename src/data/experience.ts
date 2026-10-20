export type Role = {
  company: string;
  companyUrl?: string;
  location: string;
  title: string;
  /** Extra line under the title, e.g. how the role started. */
  note?: string;
  start: string;
  end: string;
  highlights: string[];
  stack: string[];
};

export const roles: Role[] = [
  {
    company: "Komfort",
    companyUrl: "https://www.komfort.pl",
    location: "Łódź, PL",
    title: "React Developer",
    note: "Joined as Junior Frontend Developer",
    start: "08/2022",
    end: "Present",
    highlights: [
      "Rebuilt a key view of the Komfort reservation system without breaking existing functionality, and instrumented it with user analytics to guide UX decisions.",
      "Built the Na Komfortowej site and its core interactive component, with analytics to monitor and improve how it performs.",
      "Drive ongoing front-end optimisation — performance, code structure and user experience.",
      "Ship static pages and components across projects of every size, consistent with design and requirements.",
      "Review code and work closely with backend and design in an Agile / Scrum team.",
    ],
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Analytics"],
  },
  {
    company: "Codeally.io",
    location: "Łódź, PL",
    title: "JavaScript Developer — Intern",
    start: "06/2021",
    end: "09/2021",
    highlights: ["Wrote JavaScript scripts and tools in a Git-based team workflow."],
    stack: ["JavaScript", "Git"],
  },
];

export const education = {
  school: "University of Łódź",
  degree: "BSc, Business Informatics",
  faculty: "Faculty of Economics and Sociology",
  start: "2019",
  end: "2023",
};

export const languages = [
  { name: "Polish", level: "Native" },
  { name: "English", level: "C1" },
];
