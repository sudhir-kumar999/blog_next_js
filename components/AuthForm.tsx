"use client";

import { useState } from "react";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (
    email: string,
    password: string,
    displayName?: string
  ) => void;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(email, password, displayName);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "signup" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="Your name"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        {type === "signup" ? "Create account" : "Login"}
      </button>
    </form>
  );
}
