// app/api/posts/route.ts
import { supabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// ✅ CREATE POST
export async function POST(req: Request) {
  const data = await req.formData();

  await supabaseServer.from("posts").insert({
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

  return NextResponse.json({ success: true });
}

// ✅ UPDATE POST
export async function PUT(req: Request) {
  const data = await req.formData();

  await supabaseServer
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

  return NextResponse.json({ success: true });
}
