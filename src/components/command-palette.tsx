"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { OPEN_PALETTE_EVENT } from "@/components/palette-trigger";
import { projects } from "@/data/projects";
import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/cn";

type Command = {
  id: string;
  group: "Navigate" | "Projects" | "Links" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  run: (ctx: { navigate: (href: string) => void }) => void | Promise<void>;
};

function buildCommands(): Command[] {
  const external = (href: string) => () => void window.open(href, "_blank", "noopener,noreferrer");

  const commands: Command[] = [
    { id: "home", group: "Navigate", label: "Home", hint: "/", run: ({ navigate }) => navigate("/") },
    ...navLinks.map<Command>((link) => ({
      id: `nav-${link.label}`,
      group: "Navigate",
      label: link.label,
      hint: link.href.replace("/", ""),
      run: ({ navigate }) => navigate(link.href),
    })),
    ...projects.map<Command>((project) => ({
      id: `project-${project.slug}`,
      group: "Projects",
      label: project.title,
      hint: project.category,
      keywords: project.stack.join(" "),
      run: ({ navigate }) => navigate(`/projects/${project.slug}`),
    })),
    ...projects.flatMap((project) =>
      project.links
        .filter((link) => link.kind !== "live")
        .map<Command>((link) => ({
          id: `link-${project.slug}-${link.label}`,
          group: "Links",
          label: `${project.title}: ${link.label}`,
          hint: new URL(link.href).hostname,
          run: external(link.href),
        })),
    ),
    { id: "github", group: "Links", label: "GitHub profile", hint: "github.com", run: external(site.github) },
    {
      id: "copy-email",
      group: "Actions",
      label: "Copy email address",
      hint: site.email,
      keywords: "contact mail",
      run: () => navigator.clipboard.writeText(site.email),
    },
    {
      id: "write-email",
      group: "Actions",
      label: "Write an email",
      hint: "mailto",
      keywords: "contact",
      run: () => void (window.location.href = `mailto:${site.email}`),
    },
  ];

  if (site.linkedin) {
    commands.push({ id: "linkedin", group: "Links", label: "LinkedIn", hint: "linkedin.com", run: external(site.linkedin) });
  }
  if (site.cvUrl) {
    commands.push({ id: "cv", group: "Actions", label: "Download CV", hint: "PDF", run: external(site.cvUrl) });
  }

  return commands;
}

/** Subsequence match: "tcb" finds "Terminal Command Buttons". Lower score is better. */
function score(command: Command, query: string) {
  if (!query) return 0;
  const haystack = `${command.label} ${command.hint ?? ""} ${command.keywords ?? ""}`.toLowerCase();
  const needle = query.toLowerCase();

  const direct = haystack.indexOf(needle);
  if (direct !== -1) return direct;

  let position = -1;
  let gaps = 0;
  for (const char of needle) {
    const next = haystack.indexOf(char, position + 1);
    if (next === -1) return null;
    gaps += next - position - 1;
    position = next;
  }
  return 100 + gaps;
}

export function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const commands = useMemo(() => buildCommands(), []);
  const results = useMemo(() => {
    return commands
      .map((command) => ({ command, score: score(command, query) }))
      .filter((entry): entry is { command: Command; score: number } => entry.score !== null)
      .sort((a, b) => (query ? a.score - b.score : 0))
      .map((entry) => entry.command);
  }, [commands, query]);

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActiveIndex(0);
    dialog.showModal();
    inputRef.current?.focus();
  };

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, open);
    };
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const execute = async (command: Command) => {
    close();
    await command.run({ navigate: (href) => router.push(href) });
    if (command.id === "copy-email") setToast("Email copied to clipboard");
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + step + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      void execute(results[activeIndex]);
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId]);

  let lastGroup: string | null = null;

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-label="Command palette"
        onClick={(event) => event.target === dialogRef.current && close()}
        className="m-auto mt-[12vh] w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface p-0 text-fg shadow-2xl shadow-black/60 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span aria-hidden className="font-mono text-lime">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Type a command or search…"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            aria-autocomplete="list"
            className="h-14 w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label="Commands" className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center font-mono text-sm text-muted">No matching commands</li>
          ) : (
            results.map((command, index) => {
              const showGroup = !query && command.group !== lastGroup;
              lastGroup = command.group;
              return (
                <li key={command.id} role="presentation">
                  {showGroup ? (
                    <p className="px-3 pt-3 pb-1 font-mono text-[11px] tracking-widest text-muted uppercase">
                      {command.group}
                    </p>
                  ) : null}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => void execute(command)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2.5 text-sm",
                      index === activeIndex ? "bg-lime text-bg" : "text-fg",
                    )}
                  >
                    <span className="truncate">{command.label}</span>
                    {command.hint ? (
                      <span
                        className={cn(
                          "shrink-0 truncate font-mono text-xs",
                          index === activeIndex ? "text-bg/70" : "text-muted",
                        )}
                      >
                        {command.hint}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex gap-4 border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </dialog>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-2 font-mono text-xs transition-all duration-300",
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        {toast ? <span className="text-lime">✓</span> : null} {toast}
      </div>
    </>
  );
}
