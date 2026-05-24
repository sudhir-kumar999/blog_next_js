export const metadata = {
  title: "Disclaimer",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-zinc-700">
      <h1 className="text-3xl font-bold">Disclaimer</h1>

      <div className="mt-8 space-y-6 text-zinc-600">
        <p>
          StudyMitra par publish ki gayi information sirf educational aur informational purpose ke liye hai. Hum official notifications
          ko summarize/interpret kar sakte hain, lekin final authority hamesha official website/department hi hota hai.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">No professional advice</h2>
          <p>
            Yahan diye gaye content ko legal, financial, medical, ya professional advice na samjhein. Aap apni situation ke hisaab se
            qualified professionals se advice lein.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Accuracy</h2>
          <p>
            Hum accuracy maintain karne ki koshish karte hain, par errors possible hain. Agar aapko koi mistake mile, please hume
            contact karein taaki hum update kar saken.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Ads & affiliate</h2>
          <p>
            Site par third‑party ads (jaise Google AdSense) dikh sakte hain. In ads par click karne se aapko koi extra charge nahi hota.
          </p>
        </section>

        <p>
          Contact:{" "}
          <a className="font-medium text-blue-600 hover:underline" href="/contact">
            contact@studymitra.in
          </a>
        </p>
      </div>
    </main>
  );
}
