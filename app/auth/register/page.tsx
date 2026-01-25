"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import AuthForm from "@/components/AuthForm";
import GoogleButton from "@/components/GoogleButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  async function signup(
    email: string,
    password: string,
    displayName?: string
  ) {
    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Insert into profiles table
    await supabaseBrowser.from("profiles").insert({
      id: data.user?.id,
      display_name: displayName,
    });

    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h2 className="text-2xl font-bold tracking-tight text-black">
              MyBlog
            </h2>
          </Link>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div className="p-8 sm:p-10">
            {/* Heading */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Join our community and start sharing your stories
              </p>
            </div>

            {/* Signup form */}
            <AuthForm type="signup" onSubmit={signup} />

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs font-medium text-zinc-500">OR CONTINUE WITH</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            {/* Google auth */}
            {/* <GoogleButton /> */}
          </div>

          {/* Footer - Different background */}
          <div className="border-t border-zinc-100 bg-zinc-50 px-8 py-6 sm:px-10">
            <p className="text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-zinc-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline hover:text-zinc-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}