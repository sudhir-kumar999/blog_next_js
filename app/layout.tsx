import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import SchemaMarkup from "@/components/SchemaMarkup";
import AdSenseScript from "@/components/AdSenseScript";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { SITE_BASE_URL, SITE_DESCRIPTION } from "@/lib/site-config";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: "StudyMitra",
    template: "%s | StudyMitra",
  },
  description: SITE_DESCRIPTION,
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  manifest: "/manifest",
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
    <html lang="hi" className="light">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://*.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      </head>
      <body
        className={`${roboto.variable} flex min-h-screen flex-col antialiased bg-white text-zinc-900`}
      >
        <SchemaMarkup
          type="WebPage"
          data={{
            name: "StudyMitra",
            description: SITE_DESCRIPTION,
            url: SITE_BASE_URL,
            inLanguage: "hi-IN",
            isPartOf: {
              "@type": "WebSite",
              name: "StudyMitra",
              url: SITE_BASE_URL,
            },
          }}
        />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>

        <AdSenseScript />
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
          <div id="main-content" className="flex min-w-0 flex-1 flex-col">
            {children}
          </div>
          <Footer />
          <CookieConsent />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}