"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  useEffect(() => {
    // 🔹 Initial session (refresh / first load)
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const session = data.session ?? null;
      const user = session?.user ?? null;

      setSession(session);
      setUser(user);

      if (user) {
        const { data: profile } = await supabaseBrowser
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(profile?.role ?? "user");
      }

      setLoading(false);
    });

    // 🔹 Listen to auth changes (login / logout)
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;

        setSession(session);
        setUser(user);

        if (!user) {
          setRole(null);
          router.replace("/");
          return;
        }

        const { data: profile } = await supabaseBrowser
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role ?? "user";
        setRole(role);

        // 🔥 Redirect after login
        if (event === "SIGNED_IN") {
          if (role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/");
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 🔹 Clean logout (NO API CALL)
  async function logout() {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    router.replace("/");
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

// ✅ Safe custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
