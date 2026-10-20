/**
 * Every project on the site comes from this list: the home page blocks, the
 * /projects/[slug] case study pages, the sitemap and the command palette.
 * Adding a project means adding an entry here — no component changes needed.
 */

/** Custom interactive mockups, registered in components/showcase/showcase.tsx. */
export type MockupId = "vscode-terminal-buttons";

/** How the project is presented visually. */
export type Showcase =
  /** A live app in an iframe, loaded only after the visitor asks for it. */
  | {
      kind: "embed";
      src: string;
      title: string;
      /** Permissions for the iframe, e.g. "geolocation". */
      allow?: string;
      /** Shown before launch; without it a stylised placeholder is drawn. */
      poster?: string;
      /** Short note on what launching costs, shown under the button. */
      launchNote?: string;
    }
  /** A hand-built interactive simulation of the product. */
  | { kind: "mockup"; id: MockupId }
  /** A screen recording. Prefer MP4/WebM over GIF: smaller and sharper. */
  | { kind: "video"; src: string; poster?: string; caption?: string }
  | { kind: "image"; src: string; alt: string; width: number; height: number };

export type ProjectLink = {
  label: string;
  href: string;
  kind: "repo" | "live" | "store" | "article";
};

export type CaseStudy = {
  problem: string;
  approach: string[];
  implementation: string;
  result: string;
  /** Your own reflection — what you'd do differently. Leave unset until written. */
  lesson?: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: number;
  /** One line under the title, e.g. "Published on the VS Code Marketplace". */
  status?: string;
  summary: string;
  /** Short verifiable facts shown as a strip. Never invent numbers. */
  facts?: { label: string; value: string }[];
  stack: string[];
  links: ProjectLink[];
  showcase: Showcase;
  caseStudy: CaseStudy;
  /** Featured projects get a full block on the home page; others go into "More work". */
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "terminal-command-buttons",
    title: "Terminal Command Buttons",
    category: "VS Code extension",
    year: 2026,
    status: "Published on the VS Code Marketplace",
    summary:
      "One-click buttons for the terminal commands you run every day, docked right next to the terminal — with run status, variables, groups, stop / restart and a git alias manager.",
    facts: [
      { label: "Version", value: "1.0.1" },
      { label: "Modules", value: "15 TS" },
      { label: "Test suites", value: "7" },
      { label: "CI", value: "GitHub Actions" },
    ],
    stack: [
      "TypeScript",
      "VS Code Extension API",
      "Webview",
      "Shell Integration",
      "Mocha",
      "webpack",
      "GitHub Actions",
    ],
    links: [
      {
        label: "Marketplace",
        href: "https://marketplace.visualstudio.com/items?itemName=kacpermizera-dev.terminal-command-buttons",
        kind: "store",
      },
      {
        label: "Source",
        href: "https://github.com/kacpermizera-dev/vscode-terminal-command-buttons",
        kind: "repo",
      },
    ],
    showcase: { kind: "mockup", id: "vscode-terminal-buttons" },
    caseStudy: {
      problem:
        "Dev servers, test runs, git chores — the same commands get retyped or dug out of shell history dozens of times a day. tasks.json is too heavy for one-off shortcuts, and the terminal never tells you at a glance whether the last run actually worked.",
      approach: [
        "A view that docks right beside the terminal, with a compact icon layout and a detailed list layout.",
        "Run status from VS Code's shell integration: a dot that pulses while running and turns green or red on the exit code.",
        "Variables that mirror tasks.json — ${input:branch}, ${file}, ${selectedText} — so there's nothing new to learn.",
        "Nothing written to the project: global buttons live in user settings, workspace buttons in VS Code's own storage.",
      ],
      implementation:
        "Fifteen focused TypeScript modules (runner, variables, shell quoting, git aliases, status bar…) behind a webview with a strict Content Security Policy and nonce. Values from the editor are quoted per shell — bash, zsh, fish, PowerShell and cmd — so a file named a$(curl …|sh).js can never execute; where safe quoting is impossible, the run stops with a message instead. Git is spawned by absolute path, untrusted workspaces only read global aliases, and large command output is processed without blocking the extension host.",
      result:
        "Shipped 1.0 to the VS Code Marketplace with CI that builds, lints, tests and packages a .vsix on every push — and unit tests around the riskiest parts: shell quoting, variable resolution and settings parsing.",
    },
    featured: true,
  },
  {
    slug: "interactive-weather",
    title: "Interactive Weather",
    category: "Interactive web app",
    year: 2026,
    status: "Live demo below — runs entirely in the browser",
    summary:
      "A forecast you can feel: current conditions, the next hours and seven days ahead, on top of a 3D scene whose rain, snow, mist and lightning follow the real weather code from Open-Meteo.",
    facts: [
      { label: "API key", value: "None" },
      { label: "Forecast", value: "Hourly + 7-day" },
      { label: "Offline", value: "Cached" },
      { label: "Tests", value: "9 · Vitest" },
    ],
    stack: [
      "React 19",
      "TypeScript",
      "Vite",
      "React Three Fiber",
      "drei",
      "Tailwind CSS 4",
      "Open-Meteo",
      "Vitest",
    ],
    links: [
      { label: "Open full screen", href: "/demos/weather/index.html", kind: "live" },
      {
        label: "Source",
        href: "https://github.com/kacpermizera-dev/interactive-weather-app",
        kind: "repo",
      },
    ],
    showcase: {
      kind: "embed",
      src: "/demos/weather/index.html",
      title: "Interactive Weather — live demo",
      allow: "geolocation",
      poster: "/images/projects/interactive-weather.jpg",
      launchNote: "Loads a WebGL scene (~310 kB). Sharing your location is optional — without it the forecast starts in Los Angeles.",
    },
    caseStudy: {
      problem:
        "Most weather apps show the same flat card whatever the sky is doing, and bury the useful part — the next few hours — behind taps. I wanted the conditions felt at a glance and a forecast that's quick to read, for wherever you are.",
      approach: [
        "A 3D scene whose mood follows the WMO weather code: rain and snow particles, mist, wind rings and lightning for storms, with a slow camera drift.",
        "A calm, monochrome interface on top: current conditions, a one-line brief, the next hours and a 7-day forecast.",
        "Location from the device, city search through Open-Meteo Geocoding, and up to eight saved places.",
        "Units the visitor picks — °C / °F, km/h / mph, 12 / 24 h — remembered between visits.",
      ],
      implementation:
        "A typed data layer over Open-Meteo's forecast and geocoding APIs validates every field before it reaches the UI and builds the hourly and daily series from the raw arrays. Settings, saved places and the last forecast for each place persist in localStorage with defensive parsing, so a corrupted entry never breaks the app — and when the network drops, the cached forecast is shown with a note. The scene is a set of small React Three Fiber components (particles, wind rings, a lightning light) driven by one config per weather mood. Vitest covers the data layer and the weather code mapping.",
      result:
        "A fully client-side app with no API keys and no backend — which is also why it can run right here, embedded in this page.",
    },
    featured: true,
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const featuredProjects = projects.filter((project) => project.featured);
export const otherProjects = projects.filter((project) => !project.featured);
