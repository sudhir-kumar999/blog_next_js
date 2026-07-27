import { ImageResponse } from "@vercel/og";
import { SITE_NAME, SITE_BASE_URL } from "@/lib/site-config";

export const runtime = "edge";

const FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-devanagari@latest/files/noto-sans-devanagari-latin-400-normal.woff";

const CATEGORY_MAP: Record<string, string> = {
  "study-notes": "Notes",
  "practice-questions": "Practice",
  "mock-tests": "Mock Test",
  "vacancy-details": "Vacancy",
  notes: "Notes",
  questions: "Practice",
  "mock-test": "Mock Test",
  vacancy: "Vacancy",
};

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(FONT_URL);
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";
  const type = searchParams.get("type") || "";
  const label = CATEGORY_MAP[type] || "Study";

  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1a365d 100%)",
          fontFamily: fontData ? "NotoSansDevanagari" : "system-ui",
          padding: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px 64px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                padding: "8px 20px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.15)",
                color: "#93c5fd",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.5px",
                backdropFilter: "blur(4px)",
              }}
            >
              {label}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxWidth: "85%",
            }}
          >
            <h1
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.3,
                margin: 0,
                textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              }}
            >
              {title.slice(0, 80)}
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#60a5fa" strokeWidth="2" />
                <path d="M7 12l3 3 7-7" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                style={{
                  color: "#93c5fd",
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                {SITE_NAME}
              </span>
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 18,
                fontWeight: 400,
              }}
            >
              {SITE_BASE_URL?.replace("https://", "")}
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: -60,
            bottom: -60,
            width: 320,
            height: 320,
            borderRadius: "100%",
            background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -80,
            top: -80,
            width: 250,
            height: 250,
            borderRadius: "100%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: "NotoSansDevanagari", data: fontData, weight: 400 }]
        : [],
    }
  );
}
