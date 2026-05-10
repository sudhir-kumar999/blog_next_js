export const metadata = {
  title: "Contact",
  description: "Contact us for any queries",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-6 text-zinc-600">
        For any query, correction request, or feedback, you can reach us at:
      </p>

      <p className="mt-4 font-medium">
        📧 contact@studymitra.in
      </p>

      <p className="mt-6 text-sm text-zinc-500">
        We usually reply within 24–72 hours (working days).
      </p>
    </main>
  );
}
