"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import AuthForm from "@/components/AuthForm";
import GoogleButton from "@/components/GoogleButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  async function login(email: string, password: string) {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      alert(error?.message || "Login failed");
      return;
    }

    const { data: profile } = await supabaseBrowser
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    router.replace(profile?.role === "admin" ? "/admin" : "/");
  }

  return (
    // <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2xl border border-zinc-200 bg-white px-6 py-10 shadow-md sm:px-10">

      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white px-6 py-10 shadow-md sm:px-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🔐</span>
          </div>

          <h1 className="text-2xl font-bold text-black sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Login to continue to your account
          </p>
        </div>

        {/* Form */}
        <AuthForm type="login" onSubmit={login} />

        {/* Forgot password */}
        {/* <div className="mt-4 text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div> */}

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px w-full bg-zinc-200" />
          <span className="text-xs font-medium text-zinc-400">
            OR CONTINUE WITH
          </span>
          <div className="h-px w-full bg-zinc-200" />
        </div>

        {/* Google */}
        {/* <GoogleButton /> */}

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-600">
          Don’t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
