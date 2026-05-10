export const metadata = {
  title: "Terms and Conditions",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold">Terms & Conditions</h1>

      <div className="mt-8 space-y-6 text-zinc-600">
        <p>
          By accessing and using StudyMitra, you agree to these Terms & Conditions. If you do not agree, please do not use the site.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Content</h2>
          <p>
            All content is provided for informational and educational purposes only. While we try to keep information updated and
            accurate, we do not guarantee completeness or correctness for every situation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Copyright</h2>
          <p>
            Unless stated otherwise, content on this site (text, design, and branding) is owned by StudyMitra. You may not copy,
            republish, or redistribute our content without permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">External links</h2>
          <p>
            The site may contain links to third‑party websites. We are not responsible for the content, policies, or practices of
            third‑party sites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Ads</h2>
          <p>
            We may display ads served by third‑party networks (for example, Google AdSense). These networks may use cookies or similar
            technologies as described in our Privacy Policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Contact</h2>
          <p>
            For questions related to these terms, contact us at{" "}
            <a className="font-medium text-blue-600 hover:underline" href="/contact">
              contact@studymitra.in
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
