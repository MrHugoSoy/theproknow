import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;

function clip(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

/** Tarjeta OG con la identidad de marca (navy + azul). Solo CSS en línea, como exige satori. */
export function ogImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const t = clip(title, 120);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0B1B3B 0%, #12306b 60%, #1d4ed8 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
          <span>ThePro</span>
          <span style={{ color: "#5B8BFF" }}>Know</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow ? (
            <div style={{ display: "flex", fontSize: 30, color: "#9DB8FF", marginBottom: 20, textTransform: "uppercase" }}>
              {clip(eyebrow, 60)}
            </div>
          ) : null}
          <div style={{ display: "flex", fontSize: t.length > 70 ? 54 : 68, fontWeight: 800, lineHeight: 1.12 }}>{t}</div>
          {subtitle ? (
            <div style={{ display: "flex", fontSize: 32, color: "#C7D6F5", marginTop: 28 }}>{clip(subtitle, 90)}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#9DB8FF" }}>Aprende de quienes saben</div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
