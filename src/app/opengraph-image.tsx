import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, rgba(198,118,215,0.35), transparent 35%), linear-gradient(180deg, #09090b, #050505)",
          color: "white",
          padding: "64px"
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "0.2em" }}>{SITE_NAME}</div>
        <div style={{ maxWidth: 840, marginTop: 24, fontSize: 28, color: "#f4bfff" }}>{SITE_DESCRIPTION}</div>
      </div>
    ),
    size
  );
}
