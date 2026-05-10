export const metadata = {
  title: "About Us",
  description: "Learn more about our blog and mission",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-6 text-zinc-600">
        StudyMitra ek Hindi education blog hai jahan hum students ke liye exam preparation, government schemes, career guidance, aur
        study resources ko simple language me publish karte hain.
      </p>

      <div className="mt-8 space-y-4 text-zinc-600">
        <p>
          Humara goal hai ki aapko accurate, easy-to-understand information mile—chahe aap board exams, competitive exams, ya general
          learning ke liye prepare kar rahe ho.
        </p>
        <p>
          Agar aapko kisi post me correction chahiye ya aap koi suggestion dena chahte ho, please{" "}
          <a className="font-medium text-blue-600 hover:underline" href="/contact">
            contact page
          </a>{" "}
          par message karein.
        </p>
      </div>
    </main>
  );
}
