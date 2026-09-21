import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon de marca: monograma «PK» (ThePro·Know) sobre navy. */
export default function Icon() {
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
          borderRadius: 14,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        <span style={{ color: "#FFFFFF" }}>P</span>
        <span style={{ color: "#5B8BFF" }}>K</span>
      </div>
    ),
    { ...size },
  );
}
