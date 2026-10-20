/** Scripted content for the Terminal Command Buttons simulation. */

export type RunStatus = "idle" | "running" | "success" | "failure";

export type OutputLine = { text: string; tone?: "muted" | "success" | "error" | "accent" };

export type DemoButton = {
  id: string;
  name: string;
  command: string;
  icon: string;
  color: string;
  /** Runs in its own named terminal and keeps running until stopped. */
  terminal?: string;
  input?: { id: string; prompt: string; options: string[] };
  confirm?: boolean;
  pinned?: boolean;
  output: (command: string) => OutputLine[];
  /** null keeps the command running (dev server). */
  exitCode: number | null;
  /** The tour step this button demonstrates. */
  step: number;
};

export const DEMO_BUTTONS: DemoButton[] = [
  {
    id: "dev",
    name: "Dev server",
    command: "npm run dev",
    icon: "rocket",
    color: "#89d185",
    terminal: "dev",
    pinned: true,
    exitCode: null,
    step: 0,
    output: () => [
      { text: "> portfolio@1.0.0 dev", tone: "muted" },
      { text: "> next dev", tone: "muted" },
      { text: "" },
      { text: "▲ Next.js 16.4.2", tone: "accent" },
      { text: "- Local:   http://localhost:3000" },
      { text: "✓ Ready in 1.1s", tone: "success" },
    ],
  },
  {
    id: "test",
    name: "Test",
    command: "npm test",
    icon: "beaker",
    color: "#3794ff",
    exitCode: 0,
    step: 1,
    output: () => [
      { text: "> vitest run", tone: "muted" },
      { text: " ✓ src/lib/format.test.ts (8 tests)", tone: "success" },
      { text: " ✓ src/api/client.test.ts (5 tests)", tone: "success" },
      { text: "" },
      { text: " Tests  13 passed (13)", tone: "success" },
    ],
  },
  {
    id: "lint",
    name: "Lint",
    command: "npm run lint",
    icon: "checklist",
    color: "#cca700",
    exitCode: 1,
    step: 1,
    output: () => [
      { text: "> eslint .", tone: "muted" },
      { text: "" },
      { text: "src/app/page.tsx" },
      { text: "  12:7  error  'draft' is assigned a value but never used", tone: "error" },
      { text: "" },
      { text: "✖ 1 problem (1 error, 0 warnings)", tone: "error" },
    ],
  },
  {
    id: "checkout",
    name: "Checkout",
    command: "git checkout ${input:branch}",
    icon: "git-branch",
    color: "#b180d7",
    input: { id: "branch", prompt: "branch", options: ["main", "develop", "feature/hero-scene"] },
    exitCode: 0,
    step: 2,
    output: (command) => [{ text: `Switched to branch '${command.split(" ").pop()}'` }],
  },
  {
    id: "push",
    name: "Force push",
    command: "git push --force-with-lease",
    icon: "cloud-upload",
    color: "#f14c4c",
    confirm: true,
    exitCode: 0,
    step: 3,
    output: () => [
      { text: "Enumerating objects: 9, done.", tone: "muted" },
      { text: "To github.com:kacper/portfolio.git" },
      { text: " + 3f2c1a9...8e41b7d HEAD -> develop (forced update)", tone: "success" },
    ],
  },
];

export const TOUR_STEPS = [
  {
    title: "Docked next to the terminal",
    body: "One click runs a command. A dev server gets its own terminal — click it again to stop.",
  },
  {
    title: "Run status at a glance",
    body: "A dot pulses while it runs, then turns green or red from the real exit code.",
  },
  {
    title: "Variables ask when you click",
    body: "${input:branch} opens a quick pick — the tasks.json syntax, without the JSON.",
  },
  {
    title: "Ask before running",
    body: "Risky commands like a force push wait for an explicit confirmation.",
  },
];

/** The settings.json shown in the editor, as lines of [text, token] pairs. */
type Token = [string, "key" | "string" | "punct" | "var"];

const key = (text: string): Token => [`"${text}"`, "key"];
const str = (text: string): Token[] => {
  const parts = text.split(/(\$\{[^}]+\})/);
  return [
    ['"', "string"],
    ...parts.filter(Boolean).map<Token>((part) => [part, part.startsWith("${") ? "var" : "string"]),
    ['"', "string"],
  ];
};
const p = (text: string): Token => [text, "punct"];

export const SETTINGS_LINES: Token[][] = [
  [p("{")],
  [p("  "), key("terminalCommandButtons.buttons"), p(": [")],
  [p("    {")],
  [p("      "), key("name"), p(": "), ...str("Checkout"), p(",")],
  [p("      "), key("command"), p(": "), ...str("git checkout ${input:branch}"), p(",")],
  [p("      "), key("icon"), p(": "), ...str("git-branch"), p(",")],
  [p("      "), key("inputs"), p(": [{ "), key("id"), p(": "), ...str("branch"), p(", "), key("type"), p(": "), ...str("pickString"), p(" }]")],
  [p("    },")],
  [p("    {")],
  [p("      "), key("name"), p(": "), ...str("Dev server"), p(",")],
  [p("      "), key("command"), p(": "), ...str("npm run dev"), p(",")],
  [p("      "), key("terminal"), p(": "), ...str("dev")],
  [p("    }")],
  [p("  ]")],
  [p("}")],
];
