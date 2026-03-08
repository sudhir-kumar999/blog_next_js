// app/api/posts/route.ts
import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { countWords, MIN_POST_WORDS } from "@/lib/wordCount";

// ✅ CREATE POST
export async function POST(req: Request) {
  const data = await req.formData();
  const content = data.get("content");
  const contentStr = typeof content === "string" ? content : "";

  const words = countWords(contentStr);
  if (words < MIN_POST_WORDS) {
    return NextResponse.json(
      { message: `Post must be at least ${MIN_POST_WORDS} words. Current: ${words} words.` },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer.from("posts").insert({
    title: data.get("title"),
    slug: data.get("slug"),
    excerpt: data.get("excerpt"),
    content: data.get("content"),

    // 🔥 FEATURED IMAGE (TITLE KE NICHE)
    featured_image: data.get("featured_image") || null,

    // 🔥 CATEGORY
    category_id: data.get("category_id") || null,

    published: data.get("published") === "on",
    published_at:
      data.get("published") === "on" ? new Date() : null,
  });

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// ✅ UPDATE POST
export async function PUT(req: Request) {
  const data = await req.formData();
  const content = data.get("content");
  const contentStr = typeof content === "string" ? content : "";

  const words = countWords(contentStr);
  if (words < MIN_POST_WORDS) {
    return NextResponse.json(
      { message: `Post must be at least ${MIN_POST_WORDS} words. Current: ${words} words.` },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("posts")
    .update({
      title: data.get("title"),
      slug: data.get("slug"),
      excerpt: data.get("excerpt"),
      content: data.get("content"),

      // 🔥 FEATURED IMAGE UPDATE
      featured_image: data.get("featured_image") || null,

      // 🔥 CATEGORY UPDATE
      category_id: data.get("category_id") || null,

      published: data.get("published") === "on",
      published_at:
        data.get("published") === "on" ? new Date() : null,
    })
    .eq("id", data.get("id"));

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
