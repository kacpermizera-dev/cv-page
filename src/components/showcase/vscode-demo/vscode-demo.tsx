"use client";

import "@vscode/codicons/dist/codicon.css";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  DEMO_BUTTONS,
  SETTINGS_LINES,
  TOUR_STEPS,
  type DemoButton,
  type OutputLine,
  type RunStatus,
} from "@/components/showcase/vscode-demo/demo-data";
import { cn } from "@/lib/cn";
import { useInView, usePrefersReducedMotion } from "@/lib/use-in-view";

type TermLine = { kind: "prompt"; branch: string; command: string } | ({ kind: "out" } & OutputLine);
type LastRun = { exit: number; ms: number };
type Cursor = { x: number; y: number; visible: boolean; pressed: boolean };

const byId = Object.fromEntries(DEMO_BUTTONS.map((button) => [button.id, button])) as Record<string, DemoButton>;
const INITIAL_BRANCH = "develop";
const HIDDEN_CURSOR: Cursor = { x: 0, y: 0, visible: false, pressed: false };

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

const TOKEN_COLORS = { key: "#9cdcfe", string: "#ce9178", punct: "#cccccc", var: "#dcdcaa" } as const;
const TONE_COLORS = { muted: "#8b8b8b", success: "#89d185", error: "#f48771", accent: "#e5e5e5" } as const;
const STATUS_COLORS: Record<RunStatus, string> = {
  idle: "transparent",
  running: "#3794ff",
  success: "#89d185",
  failure: "#f14c4c",
};

/**
 * A faithful, interactive mock of the extension inside VS Code (Dark Modern).
 * It plays a short tour with a scripted cursor while in view; the first click
 * or key press inside hands control to the visitor.
 */
export function VSCodeDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { threshold: 0.35 });
  const reducedMotion = usePrefersReducedMotion();

  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [tourKey, setTourKey] = useState(0);
  const [step, setStep] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, RunStatus>>({});
  const [lastRuns, setLastRuns] = useState<Record<string, LastRun>>({});
  const [terminals, setTerminals] = useState<Record<string, TermLine[]>>({ bash: [] });
  const [activeTerminal, setActiveTerminal] = useState("bash");
  const [branch, setBranch] = useState(INITIAL_BRANCH);
  const [quickPick, setQuickPick] = useState<{ button: DemoButton; active: number } | null>(null);
  const [confirm, setConfirm] = useState<{ button: DemoButton; command: string } | null>(null);
  const [cursor, setCursor] = useState<Cursor>(HIDDEN_CURSOR);

  // Mirrors for the async runner, which must read the latest values mid-flight.
  const statusRef = useRef<Record<string, RunStatus>>({});
  const branchRef = useRef(INITIAL_BRANCH);
  const pickResolver = useRef<((value: string | null) => void) | null>(null);
  const confirmResolver = useRef<((ok: boolean) => void) | null>(null);

  const touring = mode === "auto" && !reducedMotion;

  const setStatus = (id: string, status: RunStatus) => {
    statusRef.current = { ...statusRef.current, [id]: status };
    setStatuses(statusRef.current);
  };

  const pushLines = (terminal: string, lines: TermLine[]) =>
    setTerminals((current) => ({ ...current, [terminal]: [...(current[terminal] ?? []), ...lines] }));

  const reset = () => {
    statusRef.current = {};
    branchRef.current = INITIAL_BRANCH;
    setStatuses({});
    setLastRuns({});
    setTerminals({ bash: [] });
    setActiveTerminal("bash");
    setBranch(INITIAL_BRANCH);
    setQuickPick(null);
    setConfirm(null);
    setStep(0);
    setCursor(HIDDEN_CURSOR);
  };

  const pick = (value: string | null) => {
    const resolve = pickResolver.current;
    pickResolver.current = null;
    setQuickPick(null);
    resolve?.(value);
  };

  const answer = (ok: boolean) => {
    const resolve = confirmResolver.current;
    confirmResolver.current = null;
    setConfirm(null);
    resolve?.(ok);
  };

  const stop = (button: DemoButton) => {
    const terminal = button.terminal ?? "bash";
    pushLines(terminal, [{ kind: "out", text: "^C", tone: "muted" }]);
    setActiveTerminal(terminal);
    setStatus(button.id, "idle");
  };

  const run = async (button: DemoButton, signal?: AbortSignal) => {
    if (statusRef.current[button.id] === "running") {
      if (button.exitCode === null) stop(button);
      return;
    }

    let command = button.command;
    setStep(button.step);

    if (button.input) {
      const value = await new Promise<string | null>((resolve) => {
        pickResolver.current = resolve;
        setQuickPick({ button, active: 0 });
      });
      if (value === null) return;
      command = command.replace(`\${input:${button.input.id}}`, value);
    }

    if (button.confirm) {
      const ok = await new Promise<boolean>((resolve) => {
        confirmResolver.current = resolve;
        setConfirm({ button, command });
      });
      if (!ok) return;
    }

    const terminal = button.terminal ?? "bash";
    const started = performance.now();
    setActiveTerminal(terminal);
    pushLines(terminal, [{ kind: "prompt", branch: branchRef.current, command }]);
    setStatus(button.id, "running");

    for (const line of button.output(command)) {
      await sleep(120 + Math.random() * 180, signal);
      pushLines(terminal, [{ kind: "out", ...line }]);
    }

    if (button.id === "checkout") {
      branchRef.current = command.split(" ").pop() ?? INITIAL_BRANCH;
      setBranch(branchRef.current);
    }
    if (button.exitCode === null) return;

    setStatus(button.id, button.exitCode === 0 ? "success" : "failure");
    setLastRuns((current) => ({
      ...current,
      [button.id]: { exit: button.exitCode ?? 0, ms: Math.round(performance.now() - started) },
    }));
  };

  const moveCursor = async (target: string, signal: AbortSignal) => {
    const root = rootRef.current;
    const element = root?.querySelector<HTMLElement>(`[data-demo="${target}"]`);
    if (!root || !element) return;
    const box = element.getBoundingClientRect();
    const base = root.getBoundingClientRect();
    setCursor({
      x: box.left - base.left + box.width * 0.55,
      y: box.top - base.top + box.height * 0.55,
      visible: true,
      pressed: false,
    });
    await sleep(700, signal);
  };

  const press = async (signal: AbortSignal) => {
    setCursor((current) => ({ ...current, pressed: true }));
    await sleep(140, signal);
    setCursor((current) => ({ ...current, pressed: false }));
  };

  const playTour = useEffectEvent(async (signal: AbortSignal) => {
    const click = async (target: string) => {
      await moveCursor(target, signal);
      await press(signal);
    };

    // Starts from a clean state: the initial one, or the one left by the previous run's cleanup.
    while (!signal.aborted) {
      await click("btn-dev");
      await run(byId.dev, signal);
      await sleep(1800, signal);

      await click("btn-test");
      await run(byId.test, signal);
      await sleep(900, signal);
      await click("btn-lint");
      await run(byId.lint, signal);
      await sleep(1800, signal);

      await click("btn-checkout");
      const checkout = run(byId.checkout, signal);
      await sleep(450, signal);
      await moveCursor("qp-2", signal);
      setQuickPick((current) => current && { ...current, active: 2 });
      await press(signal);
      pick(byId.checkout.input!.options[2]);
      await checkout;
      await sleep(1800, signal);

      await click("btn-push");
      const push = run(byId.push, signal);
      await sleep(450, signal);
      await click("confirm-run");
      answer(true);
      await push;
      await sleep(1400, signal);

      await click("btn-dev");
      await run(byId.dev, signal);
      await sleep(2800, signal);
      reset();
      await sleep(900, signal);
    }
  });

  useEffect(() => {
    if (!inView || !touring) return;
    const controller = new AbortController();
    const timer = setTimeout(() => playTour(controller.signal).catch(() => {}), 900);
    return () => {
      clearTimeout(timer);
      controller.abort();
      pick(null);
      answer(false);
      reset();
    };
    // `tourKey` restarts the tour on "Replay".
  }, [inView, touring, tourKey]);

  // Keep the terminal scrolled to the newest line.
  useEffect(() => {
    const element = terminalRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [terminals, activeTerminal]);

  const takeOver = () => {
    if (mode === "auto") setMode("manual");
  };

  const onQuickPickKey = (event: KeyboardEvent) => {
    if (!quickPick?.button.input) return;
    const count = quickPick.button.input.options.length;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setQuickPick({ ...quickPick, active: (quickPick.active + delta + count) % count });
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(quickPick.button.input.options[quickPick.active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      pick(null);
    }
  };

  const lines = terminals[activeTerminal] ?? [];
  const devRunning = statuses.dev === "running";

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={rootRef}
        role="region"
        aria-label="Interactive simulation of the Terminal Command Buttons extension in VS Code"
        onPointerDownCapture={takeOver}
        onKeyDownCapture={takeOver}
        className="relative flex h-140 flex-col overflow-hidden rounded-xl border border-[#2b2b2b] bg-[#1f1f1f] font-[system-ui,-apple-system,'Segoe_UI',sans-serif] text-[13px] text-[#cccccc] shadow-2xl shadow-black/50 select-none md:h-150"
      >
        {/* Title bar */}
        <div aria-hidden className="flex h-9 shrink-0 items-center gap-2 border-b border-[#2b2b2b] bg-[#181818] px-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="min-w-0 flex-1 truncate text-center text-xs text-[#9d9d9d]">
            settings.json — portfolio<span className="hidden sm:inline"> — Visual Studio Code</span>
          </span>
          <span className="w-12" />
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Activity bar */}
          <div aria-hidden className="hidden w-12 shrink-0 flex-col items-center gap-5 border-r border-[#2b2b2b] bg-[#181818] pt-3 text-[22px] text-[#868686] sm:flex">
            <i className="codicon codicon-files" />
            <i className="codicon codicon-search" />
            <i className="codicon codicon-source-control" />
            <i className="codicon codicon-debug-alt" />
            <i className="codicon codicon-extensions" />
            <i className="codicon codicon-terminal relative text-[#d7d7d7] before:absolute before:-top-1.5 before:-left-3.25 before:h-9 before:w-0.5 before:bg-[#0078d4]" />
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col">
            {/* Editor */}
            <div aria-hidden className="hidden min-h-0 flex-1 flex-col lg:flex">
              <div className="flex h-9 shrink-0 bg-[#181818]">
                <span className="flex items-center gap-2 border-t border-t-[#0078d4] bg-[#1f1f1f] px-3 text-[#ffffff]">
                  <i className="codicon codicon-json text-[#cbcb41]" /> settings.json
                </span>
              </div>
              <pre className="min-h-0 flex-1 overflow-hidden py-2 font-mono text-[12.5px] leading-4.75">
                {SETTINGS_LINES.map((tokens, index) => (
                  <div key={index} className="flex">
                    <span className="w-12 shrink-0 pr-4 text-right text-[#6e7681]">{index + 1}</span>
                    <span>
                      {tokens.map(([text, kind], tokenIndex) => (
                        <span key={tokenIndex} style={{ color: TOKEN_COLORS[kind] }}>
                          {text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            </div>

            {/* Panel */}
            <div className="flex min-h-0 flex-1 flex-col border-t border-[#2b2b2b] bg-[#181818] lg:h-[56%] lg:flex-none">
              <div aria-hidden className="flex h-9 shrink-0 items-center gap-5 px-4 text-[11px] tracking-wide text-[#9d9d9d] uppercase">
                <span className="hidden md:inline">Problems</span>
                <span className="hidden md:inline">Output</span>
                <span className="border-b border-[#0078d4] pb-1 text-[#e7e7e7]">Terminal</span>
                <span className="hidden sm:inline">Ports</span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                {/* Command Buttons view */}
                <div className="order-first shrink-0 border-b border-[#2b2b2b] lg:order-last lg:w-[44%] lg:border-b-0 lg:border-l">
                  <div className="flex h-8 items-center justify-between px-3 text-[11px] font-semibold tracking-wide text-[#bbbbbb] uppercase">
                    <span>Command Buttons</span>
                    <span aria-hidden className="flex gap-2 text-[15px] font-normal text-[#9d9d9d]">
                      <i className="codicon codicon-split-horizontal" />
                      <i className="codicon codicon-list-flat" />
                      <i className="codicon codicon-source-control" />
                      <i className="codicon codicon-collapse-all" />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                    {DEMO_BUTTONS.map((button) => (
                      <CommandButton
                        key={button.id}
                        button={button}
                        status={statuses[button.id] ?? "idle"}
                        lastRun={lastRuns[button.id]}
                        onRun={() => void run(button)}
                      />
                    ))}
                    <span
                      aria-hidden
                      className="inline-flex size-8 items-center justify-center rounded border border-dashed border-[#9d9d9d] text-[#9d9d9d]"
                    >
                      <i className="codicon codicon-add" />
                    </span>
                  </div>
                </div>

                {/* Terminal */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <div ref={terminalRef} role="log" aria-label="Terminal output" className="min-h-0 flex-1 overflow-y-auto px-4 py-2 font-mono text-[12px] leading-4.5">
                    {lines.length === 0 ? (
                      <p className="text-[#8b8b8b]">
                        {touring ? "# starting…" : "# click a button above to run its command"}
                      </p>
                    ) : (
                      lines.map((line, index) =>
                        line.kind === "prompt" ? (
                          <p key={index} className="mt-1 whitespace-pre-wrap">
                            <span className="text-[#89d185]">~/portfolio</span>{" "}
                            <span className="text-[#3794ff]">({line.branch})</span> <span className="text-[#8b8b8b]">$</span>{" "}
                            {line.command}
                          </p>
                        ) : (
                          <p key={index} className="whitespace-pre-wrap" style={{ color: line.tone ? TONE_COLORS[line.tone] : undefined }}>
                            {line.text || " "}
                          </p>
                        ),
                      )
                    )}
                    <span aria-hidden className="animate-blink inline-block h-3.5 w-1.75 translate-y-0.5 bg-[#cccccc]" />
                  </div>
                  <div className="flex shrink-0 gap-1 px-3 pb-2">
                    {Object.keys(terminals).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setActiveTerminal(name)}
                        aria-pressed={name === activeTerminal}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-2 py-0.5 text-[12px]",
                          name === activeTerminal ? "bg-[#37373d] text-[#e7e7e7]" : "text-[#9d9d9d] hover:bg-[#2a2d2e]",
                        )}
                      >
                        <i aria-hidden className="codicon codicon-terminal" /> {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick pick */}
            {quickPick?.button.input ? (
              <div className="absolute top-2 left-1/2 z-20 w-[min(440px,92%)] -translate-x-1/2 rounded-md border border-[#313131] bg-[#222222] p-1.5 shadow-2xl shadow-black/60">
                <input
                  autoFocus={!touring}
                  readOnly
                  onKeyDown={onQuickPickKey}
                  aria-label={`Value for \${input:${quickPick.button.input.id}}`}
                  value=""
                  placeholder={`Value for \${input:${quickPick.button.input.prompt}} — ${quickPick.button.name}`}
                  className="mb-1 h-7 w-full rounded-sm border border-[#0078d4] bg-[#313131] px-2 text-[13px] outline-none placeholder:text-[#9d9d9d]"
                />
                <ul role="listbox" aria-label="Branches">
                  {quickPick.button.input.options.map((option, index) => (
                    <li
                      key={option}
                      role="option"
                      aria-selected={index === quickPick.active}
                      data-demo={`qp-${index}`}
                      onClick={() => pick(option)}
                      onMouseMove={() => setQuickPick({ ...quickPick, active: index })}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1",
                        index === quickPick.active && "bg-[#04395e] outline outline-[#2488db]",
                      )}
                    >
                      <i aria-hidden className="codicon codicon-git-branch" /> {option}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Confirmation */}
            {confirm ? (
              <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/30 pt-16">
                <div role="alertdialog" aria-label="Confirm command" className="w-[min(380px,92%)] rounded-md border border-[#454545] bg-[#252526] p-4 shadow-2xl shadow-black/60">
                  <p className="flex items-center gap-2 font-semibold text-[#e7e7e7]">
                    <i aria-hidden className="codicon codicon-warning text-[#cca700]" /> Run “{confirm.button.name}”?
                  </p>
                  <code className="mt-3 block rounded bg-[#1e1e1e] px-2 py-1.5 font-mono text-[12px]">{confirm.command}</code>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => answer(false)}
                      className="rounded-sm bg-[#313131] px-3 py-1 hover:bg-[#3c3c3c]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      autoFocus={!touring}
                      data-demo="confirm-run"
                      onClick={() => answer(true)}
                      className="rounded-sm bg-[#0078d4] px-3 py-1 text-white hover:bg-[#026ec1]"
                    >
                      Run
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Status bar */}
        <div aria-hidden className="flex h-6 shrink-0 items-center gap-4 border-t border-[#2b2b2b] bg-[#181818] px-3 text-[12px] text-[#9d9d9d]">
          <span className="flex items-center gap-1">
            <i className="codicon codicon-git-branch" /> {branch}
          </span>
          <span className={cn("flex items-center gap-1", devRunning && "text-[#e7e7e7]")}>
            <i className={cn("codicon", devRunning ? "codicon-loading codicon-modifier-spin" : "codicon-rocket")} /> Dev server
          </span>
          <span className="ml-auto hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">{"{ } JSON"}</span>
        </div>

        {/* Scripted cursor */}
        <svg
          aria-hidden
          width="20"
          height="22"
          viewBox="0 0 20 22"
          className="pointer-events-none absolute top-0 left-0 z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${cursor.pressed ? 0.82 : 1})`,
            opacity: cursor.visible && touring ? 1 : 0,
            transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s",
          }}
        >
          <path d="M2 1.5v16.2l4.3-4.1 2.9 6.6 2.9-1.3-2.9-6.4h6z" fill="#fff" stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Tour steps + control, outside the region so using them doesn't count as taking over. */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOUR_STEPS.map((tourStep, index) => (
            <li
              key={tourStep.title}
              aria-current={index === step ? "step" : undefined}
              className={cn(
                "border-t pt-3 transition-colors duration-500",
                index === step ? "border-lime" : "border-line",
              )}
            >
              <p className={cn("font-mono text-xs", index === step ? "text-lime" : "text-muted")}>
                0{index + 1} — {tourStep.title}
              </p>
              <p className="mt-1.5 text-sm text-pretty text-muted">{tourStep.body}</p>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => {
            if (touring) {
              setMode("manual");
            } else {
              reset();
              setMode("auto");
              setTourKey((key) => key + 1);
            }
          }}
          disabled={reducedMotion}
          className="inline-flex h-9 items-center gap-2 justify-self-start rounded-full border border-line px-4 font-mono text-xs text-muted transition-colors hover:border-lime hover:text-fg disabled:hidden"
        >
          {touring ? "❚❚ Pause tour" : "▶ Replay tour"}
        </button>
      </div>
    </div>
  );
}

function CommandButton({
  button,
  status,
  lastRun,
  onRun,
}: {
  button: DemoButton;
  status: RunStatus;
  lastRun?: LastRun;
  onRun: () => void;
}) {
  const running = status === "running";
  const stoppable = running && button.exitCode === null;
  const statusText =
    status === "running" ? "running" : lastRun ? `exit ${lastRun.exit} · ${(lastRun.ms / 1000).toFixed(1)}s` : "not run yet";

  return (
    <span className="group relative">
      <button
        type="button"
        data-demo={`btn-${button.id}`}
        onClick={onRun}
        aria-label={`${stoppable ? "Stop" : "Run"} ${button.name}: ${button.command} (${statusText})`}
        style={{ "--btn-color": button.color } as CSSProperties}
        className="relative inline-flex size-8 items-center justify-center rounded bg-[#313131] pb-0.75 text-(--btn-color) hover:bg-[#3c3c3c] focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-[#0078d4] after:absolute after:inset-x-1.75 after:bottom-0.75 after:h-0.5 after:rounded-[1px] after:bg-(--btn-color)"
      >
        {/* Wrapped in spans: codicon.css sets display on the <i>, which would beat `hidden`. */}
        <span aria-hidden className={cn("flex", stoppable && "group-hover:hidden")}>
          <i className={cn("codicon text-[16px]", `codicon-${button.icon}`)} />
        </span>
        {stoppable ? (
          <span aria-hidden className="hidden group-hover:flex">
            <i className="codicon codicon-debug-stop text-[16px]" />
          </span>
        ) : null}
        {status !== "idle" ? (
          <span
            aria-hidden
            className={cn("absolute top-0.75 right-0.75 size-1.75 rounded-full", running && "animate-pulse-dot")}
            style={{ background: STATUS_COLORS[status] }}
          />
        ) : null}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-10 mt-1.5 hidden w-max max-w-60 rounded border border-[#454545] bg-[#252526] px-2 py-1.5 text-[12px] shadow-lg shadow-black/50 group-hover:block"
      >
        <span className="block font-semibold text-[#e7e7e7]">{button.name}</span>
        <span className="block font-mono text-[11px] text-[#9cdcfe]">{button.command}</span>
        <span className="block text-[11px] text-[#9d9d9d]">
          {stoppable ? "Running — click to stop" : `Last run: ${statusText}`}
        </span>
      </span>
    </span>
  );
}
