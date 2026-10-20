"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { HeroObject } from "@/components/three/hero-object";
import { useInView, usePrefersReducedMotion } from "@/lib/use-in-view";

/** The WebGL canvas. Loaded lazily by HeroVisual, never server-rendered. */
export default function HeroScene() {
  const wrapper = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapper);
  const reducedMotion = usePrefersReducedMotion();
  const animate = !reducedMotion;

  return (
    <div ref={wrapper} className="absolute inset-0 animate-[fade-in_1.2s_ease-out_both]">
      <Canvas
        // Stop rendering entirely while scrolled away; one frame is enough for the static pose.
        frameloop={inView && animate ? "always" : "demand"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <HeroObject animate={animate} />
      </Canvas>
    </div>
  );
}
