import { ImageResponse } from "next/og";

export const alt = "Vamshi Systems Lab — inspectable engineering systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const stages = ["MODELS", "SOFTWARE", "INFRA", "PHYSICAL"];

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#070a0c",
        color: "#edf2ef",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "64px 72px",
        position: "relative",
        width: "100%"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
          <div style={{ alignItems: "center", border: "1px solid #526b68", display: "flex", fontFamily: "monospace", fontSize: 20, height: 48, justifyContent: "center", width: 48 }}>
            V<span style={{ color: "#68d8ce" }}>/</span>E
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 15, letterSpacing: 4 }}>
            <strong>VAMSHI</strong>
            <span style={{ color: "#6f7d7b", fontFamily: "monospace", fontSize: 11, marginTop: 6 }}>SYSTEMS LAB</span>
          </div>
        </div>
        <div style={{ color: "#68d8ce", display: "flex", fontFamily: "monospace", fontSize: 12, letterSpacing: 2 }}>
          SYSTEM / READY
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
        <div style={{ color: "#68d8ce", display: "flex", fontFamily: "monospace", fontSize: 13, letterSpacing: 3, marginBottom: 22 }}>
          SOFTWARE ENGINEER · AI SYSTEMS · INFRASTRUCTURE
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 600, letterSpacing: -4, lineHeight: 1.02 }}>
          Systems you can inspect, not just screenshots you can scroll past.
        </div>
      </div>

      <div style={{ alignItems: "center", borderTop: "1px solid #25312f", display: "flex", justifyContent: "space-between", paddingTop: 28, width: "100%" }}>
        {stages.map((stage, index) => (
          <div key={stage} style={{ alignItems: "center", display: "flex", flex: 1 }}>
            <div style={{ background: index === 3 ? "#68d8ce" : "#101b1a", border: "1px solid #526b68", height: 12, transform: "rotate(45deg)", width: 12 }} />
            <span style={{ color: index === 3 ? "#edf2ef" : "#7f8e8b", fontFamily: "monospace", fontSize: 12, letterSpacing: 2, marginLeft: 18 }}>{stage}</span>
            {index < stages.length - 1 ? <div style={{ background: "#25312f", flex: 1, height: 1, margin: "0 24px" }} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
