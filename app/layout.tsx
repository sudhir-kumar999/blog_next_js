// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}
