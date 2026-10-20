"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const HeroScene = dynamic(() => import("@/components/three/hero-scene"), {
  ssr: false,
  loading: () => null,
});

let webglSupport: boolean | undefined;

function supportsWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/**
 * Decorative 3D object for the hero. The glow below is always drawn, so the
 * layout looks finished before the scene loads or when WebGL is unavailable.
 */
export function HeroVisual() {
  const webgl = useSyncExternalStore(() => () => {}, supportsWebGL, () => false);

  return (
    <div aria-hidden className="pointer-events-none relative size-full">
      <div className="absolute inset-[18%] rounded-full bg-lime/10 blur-3xl" />
      <div className="absolute inset-[30%] rounded-full border border-lime/15" />
      {webgl ? <HeroScene /> : null}
    </div>
  );
}
