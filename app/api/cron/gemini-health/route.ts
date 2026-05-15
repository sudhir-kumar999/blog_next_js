import { NextResponse } from "next/server";
import { getGeminiKeyFingerprint, testGeminiConnection } from "@/lib/gemini";

const CRON_SECRET = process.env.CRON_SECRET;

export const dynamic = "force-dynamic";

function projectSuspendedMessage(projectId?: string): string {
  const id = projectId ? ` (project ${projectId})` : "";
  return (
    `Google Cloud project${id} is suspended. Create key via "Create API key in new project" at ` +
    `https://aistudio.google.com/apikey — not in the old project.`
  );
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = authHeader?.replace("Bearer ", "").trim();

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keySuffix = getGeminiKeyFingerprint();
  if (!keySuffix) {
    return NextResponse.json(
      { ok: false, error: "GEMINI_API_KEY not set in environment" },
      { status: 500 }
    );
  }

  const result = await testGeminiConnection();
  if (result.ok) {
    return NextResponse.json({
      ok: true,
      message: "Gemini API is working",
      keySuffix: result.keySuffix,
      model: result.model,
    });
  }

  if (result.failure.kind === "project_suspended") {
    return NextResponse.json(
      {
        ok: false,
        error: projectSuspendedMessage(result.failure.projectId),
        keySuffix,
        reason: "CONSUMER_SUSPENDED",
        hint: "Your new key is still tied to suspended project 439620126713. Use a NEW Google Cloud project.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      keySuffix,
      error: result.failure.kind === "api_error" ? result.failure.message : result.failure.kind,
    },
    { status: 502 }
  );
}
