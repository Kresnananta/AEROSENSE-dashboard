import { getSupabase } from "./supabase";
export const authService = {
  async login(email: string, password: string) {
    const { error } = await (
      await getSupabase()
    ).auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async register(name: string, email: string, password: string) {
    const { data, error } = await (
      await getSupabase()
    ).auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    return !!data.session;
  },
  async logout() {
    const { error } = await (await getSupabase()).auth.signOut();
    if (error) throw error;
  },
};
