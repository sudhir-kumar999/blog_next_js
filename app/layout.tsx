// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { SITE_BASE_URL } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: "StudyMitra",
    template: "%s | StudyMitra",
  },
  description: "सरकारी योजनाएं, परीक्षा की तैयारी, और शिक्षा से जुड़ी जानकारी हिंदी में — StudyMitra पर पढ़ें।",
  robots: { index: true, follow: true },
  other: {
    "google-adsense-account": "ca-pub-8512064525174724",
  },
  verification: {
    google: "C5p3Z0zxSQIohmRRIADX9u0Sn-8YlWcZ_JV0N3ftvvA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8512064525174724"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W2MN41PJ83"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W2MN41PJ83');
          `}
        </Script>

        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}