import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** Share / home-screen icon — Berlin (orange) + 2026 (black), header style. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 40,
          border: "6px solid #E5E8EB",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: -1.2,
            color: "#F55A1F",
            lineHeight: 1,
          }}
        >
          Berlin
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: -1,
            color: "#171E25",
            lineHeight: 1,
          }}
        >
          2026
        </div>
      </div>
    ),
    { ...size }
  )
}
