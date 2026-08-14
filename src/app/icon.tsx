import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default async function Icon() {
  const data = await readFile(join(process.cwd(), "public/brand/hero/fimy-transparent-v2.png"), "base64");

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 56,
          background: "#fff7ed",
        }}
      >
        <img
          src={`data:image/png;base64,${data}`}
          alt=""
          style={{
            position: "absolute",
            width: 235,
            height: 418,
            right: -22,
            top: -68,
            objectFit: "contain",
          }}
        />
      </div>
    ),
    size,
  );
}
