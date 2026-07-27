"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/browser";
import { usePathname } from "next/navigation";

type Role = "admin" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseBrowser) {
      setLoading(false);
      return;
    }

    const client = supabaseBrowser;

    // 🔹 Initial session (refresh / first load)
    client.auth.getSession().then(async ({ data }) => {
      const session = data.session ?? null;
      const user = session?.user ?? null;

      setSession(session);
      setUser(user);

      if (user) {
        const { data: profile } = await client
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(profile?.role ?? "user");
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    // 🔹 Auth state listener
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;

        setSession(session);
        setUser(user);

        // 🔓 USER LOGOUT
        if (!user) {
          setRole(null);

          // ❗ ONLY redirect if user was on admin route
          if (pathname?.startsWith("/admin")) {
            window.location.href = "/auth/login";
          }
          return;
        }

        // 🔹 Fetch role
        const { data: profile } = await client
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role ?? "user";
        setRole(role);

        // 🔐 Redirect ONLY after login — use full navigation so middleware picks up cookies
        if (event === "SIGNED_IN") {
          const dest = role === "admin" ? "/admin" : "/";
          if (window.location.pathname !== dest) {
            window.location.href = dest;
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  async function logout() {
    if (supabaseBrowser) await supabaseBrowser.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);

    window.location.href = "/";
  }

  const value: AuthContextType = {
    user,
    session,
    role,
    isLoggedIn: !!user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Safe hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
