export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  published_at: string | null;
  category_id: string | null;
  categories?: Category; // join ke liye
}
