import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { getGeminiKeyFingerprint, testGeminiConnection } from "@/lib/gemini";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function projectSuspendedMessage(projectId?: string): string {
  const id = projectId ? ` (project ${projectId})` : "";
  return (
    `Google Cloud project${id} is suspended. Create key via "Create API key in new project" at ` +
    `https://aistudio.google.com/apikey — not in the old project.`
  );
}

export async function GET(req: Request) {
  const cronAuth = verifyCronRequest(req);
  if (!cronAuth.ok) {
    return NextResponse.json({ error: cronAuth.message }, { status: cronAuth.status });
  }

  const ip = getClientIp(req);
  const limit = checkRateLimit(`cron-health:${ip}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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
