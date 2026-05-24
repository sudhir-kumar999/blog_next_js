import Link from "next/link";

type EditorialNoticeProps = {
  variant?: "article" | "compact";
};

/** Trust / policy transparency for readers and AdSense review. */
export default function EditorialNotice({ variant = "article" }: EditorialNoticeProps) {
  if (variant === "compact") {
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        StudyMitra provides educational study material. Verify exam dates and vacancies on official
        websites.{" "}
        <Link href="/editorial-policy" className="text-blue-600 hover:underline">
          Editorial policy
        </Link>
        .
      </p>
    );
  }

  return (
    <aside
      className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-600"
      aria-label="Editorial notice"
    >
      <p className="font-semibold text-zinc-800">Editorial notice</p>
      <p className="mt-2">
        StudyMitra publishes Hindi study material for competitive and board exams: notes, practice
        questions, mock tests, and vacancy summaries. Content may be drafted with AI assistance and
        is reviewed for clarity and exam relevance before publishing.
      </p>
      <p className="mt-2">
        We do not guarantee selection, ranks, or official notification details. Always confirm
        dates, eligibility, and fees on the recruiting body&apos;s official website.
      </p>
      <p className="mt-3">
        <Link href="/editorial-policy" className="font-medium text-blue-600 hover:underline">
          Read our editorial policy
        </Link>
        {" · "}
        <Link href="/contact" className="font-medium text-blue-600 hover:underline">
          Report a correction
        </Link>
      </p>
    </aside>
  );
}
