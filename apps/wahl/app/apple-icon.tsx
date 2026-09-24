import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** Share / home-screen icon — big ’26, same size, horizontal. */
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
          background: "#F3F5F7",
          borderRadius: 40,
          overflow: "hidden",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: -3,
          color: "#F55A1F",
          lineHeight: 1,
        }}
      >
        ’26
      </div>
    ),
    { ...size }
  )
}
