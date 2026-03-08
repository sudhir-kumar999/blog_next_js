import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { countWords, MIN_POST_WORDS } from "@/lib/wordCount";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("scheduled_posts")
    .select("id, title, slug, excerpt, seo_title, seo_description, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
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

  const { data, error } = await supabaseServer
    .from("scheduled_posts")
    .insert({
      title: String(title).trim(),
      slug: String(slug).trim().toLowerCase().replace(/\s+/g, "-"),
      excerpt: excerpt ? String(excerpt).trim() : null,
      content: contentStr,
      seo_title: seo_title ? String(seo_title).trim() : null,
      seo_description: seo_description ? String(seo_description).trim() : null,
      featured_image: featured_image || null,
      category_id: category_id || null,
      sort_order: typeof sort_order === "number" ? sort_order : 0,
    })
    .select("id, title, slug, sort_order, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
