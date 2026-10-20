"use client";

import Image from "next/image";
import { useState } from "react";
import type { Showcase } from "@/data/projects";
import { cn } from "@/lib/cn";

type EmbedShowcase = Extract<Showcase, { kind: "embed" }>;

/**
 * A live app in a browser frame. The iframe is only created after the visitor
 * clicks "Launch", so the page never pays for the app's bundle up front.
 */
export function LiveEmbed({ showcase }: { showcase: EmbedShowcase }) {
  const [state, setState] = useState<"poster" | "loading" | "live">("poster");
  const [frameKey, setFrameKey] = useState(0);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/50">
      <div className="flex h-11 items-center gap-3 border-b border-line px-4">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </span>
        <span className="mx-auto flex min-w-0 items-center gap-2 truncate rounded-md bg-bg px-3 py-1 font-mono text-xs text-muted">
          <span aria-hidden className={cn("size-1.5 rounded-full", state === "live" ? "bg-lime" : "bg-muted")} />
          {showcase.src}
        </span>
        <div className="flex items-center gap-1">
          {state !== "poster" ? (
            <button
              type="button"
              onClick={() => {
                setState("loading");
                setFrameKey((key) => key + 1);
              }}
              aria-label="Reload demo"
              className="rounded p-1.5 text-muted transition-colors hover:bg-bg hover:text-fg"
            >
              <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}
          <a
            href={showcase.src}
            target="_blank"
            rel="noopener"
            aria-label="Open demo in a new tab"
            className="rounded p-1.5 text-muted transition-colors hover:bg-bg hover:text-fg"
          >
            <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 9.5v4H2.5V4h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <div className="relative aspect-[4/5] sm:aspect-[16/10]">
        {state === "poster" ? (
          <div className="absolute inset-0">
            {showcase.poster ? (
              <Image src={showcase.poster} alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
            ) : (
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-surface-2),var(--color-bg))]" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-3 bg-gradient-to-t from-bg/90 via-bg/30 to-transparent p-6 text-center">
              <button
                type="button"
                onClick={() => setState("loading")}
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-lime px-6 font-medium text-bg transition-colors hover:bg-fg"
              >
                <span aria-hidden className="transition-transform group-hover:scale-110">▶</span>
                Launch live demo
              </button>
              {showcase.launchNote ? <p className="max-w-md text-xs text-pretty text-fg/70">{showcase.launchNote}</p> : null}
            </div>
          </div>
        ) : (
          <>
            <iframe
              key={frameKey}
              src={showcase.src}
              title={showcase.title}
              allow={showcase.allow}
              onLoad={() => setState("live")}
              className="absolute inset-0 size-full border-0 bg-bg"
            />
            {state === "loading" ? (
              <div role="status" className="absolute inset-0 flex items-center justify-center bg-bg font-mono text-xs text-muted">
                <span className="animate-pulse-dot mr-3 size-2 rounded-full bg-lime" /> booting WebGL scene…
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
