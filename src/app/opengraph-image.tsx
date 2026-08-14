import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "MiniFimy, ropa para bebés con Fimy la jirafa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [bannerData, fimyData] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/hero/home-banner-1.jpeg"), "base64"),
    readFile(join(process.cwd(), "public/brand/hero/fimy-transparent-v2.png"), "base64"),
  ]);
  const banner = `data:image/jpeg;base64,${bannerData}`;
  const fimy = `data:image/png;base64,${fimyData}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#f8f1e8",
          color: "#50683d",
        }}
      >
        <img
          src={banner}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "left center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(250,246,240,0.02) 34%, rgba(250,246,240,0.7) 64%, rgba(250,246,240,0.96) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 255,
            top: 142,
            display: "flex",
            width: 390,
            padding: "34px 38px",
            flexDirection: "column",
            border: "2px solid rgba(255,255,255,0.92)",
            borderRadius: 34,
            background: "rgba(255,250,244,0.94)",
            boxShadow: "0 22px 60px rgba(92,72,50,0.16)",
          }}
        >
          <div style={{ display: "flex", fontSize: 39, fontWeight: 800, letterSpacing: "-1.5px" }}>
            Hola, soy Fimy
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 23, lineHeight: 1.35, color: "#6f6256" }}>
            Descubrí prendas suaves y cómodas para tu bebé.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 19, fontWeight: 700, color: "#d95f55" }}>
            MINIFIMY.COM
          </div>
        </div>
        <img
          src={fimy}
          alt=""
          style={{
            position: "absolute",
            right: -65,
            bottom: -360,
            width: 390,
            height: 694,
            objectFit: "contain",
          }}
        />
      </div>
    ),
    size,
  );
}
