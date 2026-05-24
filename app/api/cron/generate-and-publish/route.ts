import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { canRunCronPublish } from "@/lib/cron-guard";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { getCategoryIdForMaterialType } from "@/lib/category-for-material";
import { generateBlogPost, parsePostSlot, type PostSlot } from "@/lib/gemini";
import { slotLabel } from "@/lib/study-material";
import { supabaseServer } from "@/lib/supabase/server";

function projectSuspendedMessage(projectId?: string): string {
  const id = projectId ? ` (project ${projectId})` : "";
  return (
    `Google Cloud project${id} is suspended by Google — a new API key in the same project will NOT work. ` +
    `In AI Studio (https://aistudio.google.com/apikey) choose "Create API key in new project" (not existing project), ` +
    `or use a different Google account. Then update GEMINI_API_KEY in Vercel and redeploy.`
  );
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Long Hindi posts need >60s. Requires Vercel Pro for 300s (Hobby max is 60s).
export const maxDuration = 300;

export async function GET(req: Request) {
  const cronAuth = verifyCronRequest(req);
  if (!cronAuth.ok) {
    console.error("[generate-and-publish] unauthorized:", cronAuth.message);
    return NextResponse.json({ error: cronAuth.message }, { status: cronAuth.status });
  }

  const ip = getClientIp(req);
  const limit = checkRateLimit(`cron-gen:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not set. Add it in Vercel Environment Variables." },
      { status: 500 }
    );
  }

  try {
    const slot: PostSlot = parsePostSlot(req);

    const guard = await canRunCronPublish(slot);
    if (!guard.ok) {
      console.warn("[generate-and-publish] skipped:", guard.reason);
      return NextResponse.json(
        { ok: false, skipped: true, message: guard.reason, published: null },
        { status: 200 }
      );
    }

    const res = await generateBlogPost({ slot });
    const post = res.ok ? res : null;
    const lastFailure = res.ok ? null : res.failure;

    if (!post) {
      if (lastFailure) {
        console.error("[generate-and-publish] gemini generation failed", lastFailure);
      }
      const failure = lastFailure as { kind?: string; projectId?: string } | null;

      if (failure?.kind === "project_suspended") {
        return NextResponse.json(
          {
            ok: false,
            error: projectSuspendedMessage(failure.projectId),
            reason: "CONSUMER_SUSPENDED",
            published: null,
          },
          { status: 403 }
        );
      }

      if (failure?.kind === "quota_exceeded") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Gemini API quota/rate limit reached. Wait a few hours — do not retry rapidly or Google may suspend your project.",
            reason: "QUOTA_EXCEEDED",
            published: null,
          },
          { status: 429 }
        );
      }

      if (failure?.kind === "content_blocked") {
        return NextResponse.json(
          {
            ok: false,
            error: "Generated content failed safety check. Try again at next cron slot.",
            reason: failure,
            published: null,
          },
          { status: 422 }
        );
      }

      if (failure?.kind === "api_error") {
        const msg = (failure as { message?: string }).message ?? "Gemini API error";
        return NextResponse.json(
          { ok: false, error: msg, reason: failure, published: null },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          message: "Gemini could not generate a valid post (JSON parse failed or word count too low).",
          error: "Gemini could not generate a valid post (JSON parse failed or word count too low).",
          reason: lastFailure ?? null,
          published: null,
        },
        { status: 503 }
      );
    }

    const generated = post.post;
    let slug = generated.slug;
    const { data: existing } = await supabaseServer
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      slug = `${generated.slug}-${Date.now().toString(36)}`;
    }

    const categoryId = await getCategoryIdForMaterialType(post.materialType);

    const { error: insertError } = await supabaseServer.from("posts").insert({
      title: generated.title,
      slug,
      excerpt: generated.excerpt,
      content: generated.content,
      seo_title: generated.seo_title,
      seo_description: generated.seo_description,
      featured_image: null,
      category_id: categoryId,
      published: true,
      published_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("[generate-and-publish] insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save post", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Study material post (${post.materialType}) generated and published.`,
      slot: slotLabel(slot),
      materialType: post.materialType,
      categoryAssigned: Boolean(categoryId),
      published: { title: generated.title, slug },
    });
  } catch (err) {
    console.error("[generate-and-publish] error:", err);
    const message = err instanceof Error ? err.message : String(err);
    if (/CONSUMER_SUSPENDED|has been suspended/i.test(message)) {
      const projectMatch = message.match(/projects\/(\d+)/);
      return NextResponse.json(
        { error: projectSuspendedMessage(projectMatch?.[1]) },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
