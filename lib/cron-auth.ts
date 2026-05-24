import { timingSafeEqual } from "crypto";

function safeEqualSecret(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Validates Vercel cron / manual cron calls using Authorization: Bearer CRON_SECRET */
export function verifyCronRequest(req: Request): { ok: true } | { ok: false; status: number; message: string } {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return {
      ok: false,
      status: 500,
      message: "CRON_SECRET is missing or too short (use at least 16 random characters in Vercel env).",
    };
  }

  const authHeader = req.headers.get("authorization");
  const provided = authHeader?.replace(/^Bearer\s+/i, "").trim() ?? "";

  if (!provided || !safeEqualSecret(provided, secret)) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  return { ok: true };
}
