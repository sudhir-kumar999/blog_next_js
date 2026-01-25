export const metadata = {
  title: "About Us",
  description: "Learn more about our blog and mission",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-6 text-zinc-600">
        This blog shares high-quality tutorials and guides related to
        web development, Next.js, and modern technologies.
      </p>
    </main>
  );
}
