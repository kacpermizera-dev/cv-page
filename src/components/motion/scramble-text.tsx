"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, usePrefersReducedMotion } from "@/lib/use-in-view";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

/**
 * Text that "decodes" from random glyphs when it scrolls into view.
 * Meant for short monospace labels, where the scramble causes no layout shift.
 * Server render and screen readers always get the real text.
 */
export function ScrambleText({ text, duration = 700 }: { text: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!inView || reducedMotion) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const revealed = Math.floor(progress * text.length);
      let next = text.slice(0, revealed);
      for (let i = revealed; i < text.length; i++) {
        next += text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reducedMotion, text, duration]);

  return (
    <span ref={ref}>
      <span aria-hidden>{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
