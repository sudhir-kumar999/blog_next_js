import { requireSupabaseBrowser } from "@/lib/supabase/browser";

export async function uploadPostImage(file: File) {
  const db = requireSupabaseBrowser();
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `posts/${fileName}`;

  const { error } = await db.storage
    .from("blog-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = db.storage
    .from("blog-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
