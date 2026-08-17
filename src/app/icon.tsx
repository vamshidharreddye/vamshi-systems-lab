import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#070a0c",
        border: "2px solid #344644",
        color: "#edf2ef",
        display: "flex",
        fontFamily: "monospace",
        fontSize: 18,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        letterSpacing: "-1px",
        width: "100%"
      }}
    >
      V<span style={{ color: "#68d8ce" }}>/</span>E
    </div>
  );
}
