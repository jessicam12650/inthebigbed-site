import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "inthebigbed — Liverpool's dog platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#1C1C1A",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#F2EDE6",
            letterSpacing: -1,
          }}
        >
          inthebigbed
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#F2EDE6",
              letterSpacing: -2,
            }}
          >
            Everything for dogs.
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#D4845A",
              letterSpacing: -2,
              marginTop: 4,
            }}
          >
            And the people they allow in the bed.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#F2EDE6",
            opacity: 0.55,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          <span>Liverpool's dog platform</span>
          <span>10% to Carla Lane Animals in Need 🐾</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
