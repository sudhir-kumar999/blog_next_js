import type { Metadata } from "next";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
