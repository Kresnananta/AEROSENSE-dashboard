import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/services/supabase";
import { authService } from "@/services/auth.service";
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    getSupabase()
      .then(async (client) => {
        if (!active) return;
        const { data } = client.auth.onAuthStateChange((_event, session) => {
          if (active) {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });
        unsubscribe = () => data.subscription.unsubscribe();
        const session = await client.auth.getSession();
        if (active) {
          setUser(session.data.session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return { user, isLoading, error, isAuthenticated: !!user, ...authService };
}
