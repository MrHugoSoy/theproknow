import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1B3B",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -6,
        }}
      >
        <span style={{ color: "#FFFFFF" }}>P</span>
        <span style={{ color: "#5B8BFF" }}>K</span>
      </div>
    ),
    { ...size },
  );
}
