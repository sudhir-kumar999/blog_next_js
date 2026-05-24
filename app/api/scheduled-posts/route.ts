import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { supabaseServer } from "@/lib/supabase/server";
import { countWords, MIN_POST_WORDS } from "@/lib/wordCount";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from("scheduled_posts")
    .select(
      "id, title, slug, excerpt, seo_title, seo_description, sort_order, is_published, created_at"
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const auth = await requireAdminApi(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const {
    title,
    slug,
    excerpt,
    content,
    seo_title,
    seo_description,
    featured_image,
    category_id,
    sort_order,
  } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "title, slug, and content are required" },
      { status: 400 }
    );
  }

  const contentStr = String(content).trim();
  const words = countWords(contentStr);
  if (words < MIN_POST_WORDS) {
    return NextResponse.json(
      { error: `Post must be at least ${MIN_POST_WORDS} words. Current: ${words} words.` },
      { status: 400 }
    );
  }

  const safeSlug = String(slug)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 120);

  if (!safeSlug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("scheduled_posts")
    .insert({
      title: String(title).trim().slice(0, 300),
      slug: safeSlug,
      excerpt: excerpt ? String(excerpt).trim().slice(0, 500) : null,
      content: contentStr,
      seo_title: seo_title ? String(seo_title).trim().slice(0, 70) : null,
      seo_description: seo_description ? String(seo_description).trim().slice(0, 160) : null,
      featured_image: featured_image || null,
      category_id: category_id || null,
      sort_order: typeof sort_order === "number" ? sort_order : 0,
    })
    .select("id, title, slug, sort_order, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
