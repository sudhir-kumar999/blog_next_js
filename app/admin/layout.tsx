"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn) {
      router.replace("/auth/login");
      return;
    }

    if (role !== "admin") {
      router.replace("/");
      return;
    }
  }, [isLoggedIn, role, loading, router]);

  if (loading || role !== "admin") return null;

  return <>{children}</>;
}
