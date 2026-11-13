import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };

const font = (w: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-normal.woff`));

/** Capa de compartilhamento (WhatsApp, LinkedIn): azul da marca, monograma e titulo da pagina. */
export async function ogImage(title: string, eyebrow = "Limeira, SP · Desde 1996") {
  const [f500, f600] = await Promise.all([font(500), font(600)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#f3eee5", fontFamily: "Cormorant", background: "linear-gradient(135deg, #0f1b2e 0%, #0a1322 60%, #1c1a1c 100%)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="#c9a078">
            <rect x="4" y="9" width="3" height="46" />
            <rect x="9.5" y="9" width="7.5" height="46" />
            <polygon points="4,9 23,9 43,36 35,47 17,23 17,9" />
            <polygon points="45,23 60,9 60,55 45,55" />
          </svg>
          <div style={{ width: 1, height: 64, background: "#c9a078", margin: "0 24px", opacity: 0.6 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: 3 }}>MARCHI GOMES</div>
            <div style={{ fontSize: 18, letterSpacing: 12, color: "#c9a078" }}>ADVOGADOS</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 8, color: "#c9a078", textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 60 ? 62 : 80, lineHeight: 1.04, marginTop: 20, maxWidth: 980 }}>{title}</div>
          <div style={{ width: 90, height: 2, background: "#c9a078", marginTop: 36 }} />
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Cormorant", data: f500, weight: 500 }, { name: "Cormorant", data: f600, weight: 600 }] },
  );
}
