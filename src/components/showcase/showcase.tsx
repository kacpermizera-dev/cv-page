import Image from "next/image";
import type { ComponentType } from "react";
import { LiveEmbed } from "@/components/showcase/live-embed";
import { VSCodeDemo } from "@/components/showcase/vscode-demo/vscode-demo";
import type { MockupId, Showcase as ShowcaseData } from "@/data/projects";

/** Custom interactive mockups. Register a new one here and reference its id from data/projects.ts. */
const mockups: Record<MockupId, ComponentType> = {
  "vscode-terminal-buttons": VSCodeDemo,
};

export function Showcase({ showcase }: { showcase: ShowcaseData }) {
  switch (showcase.kind) {
    case "mockup": {
      const Mockup = mockups[showcase.id];
      return <Mockup />;
    }
    case "embed":
      return <LiveEmbed showcase={showcase} />;
    case "video":
      return (
        <figure className="overflow-hidden rounded-xl border border-line bg-surface">
          <video
            src={showcase.src}
            poster={showcase.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="block w-full"
          />
          {showcase.caption ? (
            <figcaption className="border-t border-line px-4 py-3 font-mono text-xs text-muted">{showcase.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "image":
      return (
        <Image
          src={showcase.src}
          alt={showcase.alt}
          width={showcase.width}
          height={showcase.height}
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="rounded-xl border border-line"
        />
      );
  }
}
