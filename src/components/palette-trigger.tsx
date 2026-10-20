"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

export const OPEN_PALETTE_EVENT = "command-palette:open";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

/** "⌘ K" on Apple devices, "Ctrl K" elsewhere (and during server render). */
export function useShortcutLabel() {
  const mac = useSyncExternalStore(() => () => {}, isMac, () => false);
  return mac ? "⌘ K" : "Ctrl K";
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted", className)}>
      {children}
    </kbd>
  );
}

export function PaletteTrigger({ variant = "nav" }: { variant?: "nav" | "hint" }) {
  const shortcut = useShortcutLabel();

  if (variant === "hint") {
    return (
      <button
        type="button"
        onClick={openCommandPalette}
        className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
      >
        or press <Kbd className="group-hover:border-lime group-hover:text-lime">{shortcut}</Kbd> to jump anywhere
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label="Open command palette"
      aria-keyshortcuts="Control+K Meta+K"
      className="inline-flex h-9 items-center gap-3 rounded-md border border-line bg-surface/60 px-3 text-sm text-muted transition-colors hover:border-lime/60 hover:text-fg"
    >
      <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3.5 3.5" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <Kbd>{shortcut}</Kbd>
    </button>
  );
}
