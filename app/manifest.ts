import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StudyMitra — Exam Preparation Hindi",
    short_name: "StudyMitra",
    description:
      "Free Hindi study material: online mock test, notes, MCQ practice, and sarkari vacancy details for SSC, Railway, NEET, UPSC.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    orientation: "any",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    lang: "hi-IN",
    categories: ["education", "exam preparation", "study"],
  };
}
