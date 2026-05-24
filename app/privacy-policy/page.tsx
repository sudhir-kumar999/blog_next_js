export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-zinc-700">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>

      <p className="mt-6 text-zinc-600">
        Effective date: {new Date().getFullYear()}-01-01
      </p>

      <div className="mt-8 space-y-6 text-zinc-600">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">What we collect</h2>
          <p>
            We do not ask for personal information for reading content. If you contact us, we may receive the information you share
            (for example: name, email, and message content) so we can respond.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Cookies</h2>
          <p>
            We may use cookies or similar technologies to improve user experience, measure traffic, and show ads. You can control
            cookies from your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Third‑party services</h2>
          <p>
            We may use third‑party services such as Google Analytics and Google AdSense. These services may collect information like
            your IP address, device details, and browsing behavior to provide analytics and relevant ads.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Google AdSense</h2>
          <p>
            Google and its partners may use cookies to serve ads based on your visits to this and/or other sites. Learn more about
            how Google uses data by visiting Google’s advertising policies. You can opt out of personalized ads from your Google Ads
            settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
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
