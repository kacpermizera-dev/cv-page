import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#101110",
          color: "#f0f0e8",
          backgroundImage:
            "radial-gradient(circle at 85% 30%, rgba(197,243,107,0.22), transparent 45%), linear-gradient(rgba(240,240,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,240,232,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 72px 72px, 72px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#92968d" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#c5f36b" }} />
          {`${site.role.toUpperCase()} — ${site.location.toUpperCase()}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>
          <span>Interfaces that feel fast.</span>
          <span style={{ color: "#92968d" }}>Tools that make them faster.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
          <span>{site.name}</span>
          <span style={{ color: "#c5f36b" }}>{"~/kacper.mizera"}</span>
        </div>
      </div>
    ),
    size,
  );
}
