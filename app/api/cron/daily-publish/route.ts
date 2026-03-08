import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { countWords, MIN_POST_WORDS } from "@/lib/wordCount";

const CRON_SECRET = process.env.CRON_SECRET;

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = authHeader?.replace("Bearer ", "").trim();

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: scheduled, error: fetchError } = await supabaseServer
      .from("scheduled_posts")
      .select("id, title, slug, excerpt, content, seo_title, seo_description, featured_image, category_id")
      .eq("is_published", false)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[daily-publish] fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch scheduled post", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!scheduled) {
      return NextResponse.json({
        ok: true,
        message: "No posts to publish",
        published: null,
      });
    }

    const words = countWords(scheduled.content ?? "");
    if (words < MIN_POST_WORDS) {
      return NextResponse.json({
        ok: true,
        message: `Skipped: post has ${words} words (min ${MIN_POST_WORDS}). Add more content and it will publish next run.`,
        published: null,
      });
    }

    const insertPayload: Record<string, unknown> = {
      title: scheduled.title,
      slug: scheduled.slug,
      excerpt: scheduled.excerpt ?? "",
      content: scheduled.content,
      seo_title: scheduled.seo_title ?? scheduled.title,
      seo_description: scheduled.seo_description ?? scheduled.excerpt ?? null,
      featured_image: scheduled.featured_image ?? null,
      category_id: scheduled.category_id ?? null,
      published: true,
      published_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabaseServer.from("posts").insert(insertPayload);

    if (insertError) {
      console.error("[daily-publish] insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to publish post", details: insertError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseServer
      .from("scheduled_posts")
      .update({ is_published: true })
      .eq("id", scheduled.id);

    if (updateError) {
      console.error("[daily-publish] update scheduled_posts error:", updateError);
    }

    return NextResponse.json({
      ok: true,
      message: "Post published",
      published: { title: scheduled.title, slug: scheduled.slug },
    });
  } catch (err) {
    console.error("[daily-publish] error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
