import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleAlert, CircleCheck, LoaderCircle, Mail } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { apiRequest } from "@/services/api";
import { getSupabase } from "@/services/supabase";
import { AuthStory } from "./AuthStory";

type Status = "checking" | "confirmed" | "missing" | "failed";
const content = {
  checking: { icon: LoaderCircle, title: "Memeriksa tautan…", text: "" },
  confirmed: { icon: CircleCheck, title: "Email terkonfirmasi", text: "Selamat datang di AEROSENSE." },
  missing: { icon: Mail, title: "Buka tautan dari email", text: "Gunakan tautan konfirmasi yang dikirim saat Anda mendaftar." },
  failed: { icon: CircleAlert, title: "Tautan tidak bisa digunakan", text: "Tautannya mungkin kedaluwarsa atau sudah dipakai. Coba masuk jika akun Anda sudah aktif." },
};

async function checkLink(query: URLSearchParams, hash: URLSearchParams): Promise<Status> {
  const errors = ["error", "error_code", "error_description"];
  if (errors.some((key) => query.has(key) || hash.has(key))) return "failed";
  const code = query.get("code");
  const token = query.get("token_hash");
  const accessToken = hash.get("access_token");
  const type = query.get("type");
  if (!code && !token && !accessToken) return "missing";
  const client = await getSupabase();
  if (token && (type === "signup" || type === "email")) {
    const { error } = await client.auth.verifyOtp({ token_hash: token, type });
    return error ? "failed" : "confirmed";
  }
  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    return !error && data.session ? "confirmed" : "failed";
  }
  const { data } = await client.auth.getSession();
  return accessToken && data.session?.access_token === accessToken ? "confirmed" : "failed";
}

export function AuthConfirmPage() {
  const [state, setState] = useState<Status>("checking");
  const [pendingRole, setPendingRole] = useState(false);
  const callback = useRef<Promise<Status> | null>(null);
  useEffect(() => {
    let active = true;
    callback.current ??= checkLink(new URLSearchParams(location.search), new URLSearchParams(location.hash.slice(1))).catch(() => "failed");
    void callback.current.then((status) => {
      if (!active) return;
      if (status !== "missing") history.replaceState(history.state, "", "/auth/confirm");
      setState(status);
      if (status === "confirmed") {
        void apiRequest<{ role_request?: { status: string } | null }>("/v1/me")
          .then(({ role_request }) => { if (active) setPendingRole(role_request?.status === "pending"); })
          .catch(() => {});
      }
    });
    return () => { active = false; };
  }, []);

  const { icon: Icon, title, text } = content[state];
  return (
    <div className="login-page">
      <AuthStory confirmed={state === "confirmed"} />
      <section className="login-form-panel" aria-labelledby="confirm-heading">
        <div className="login-form-inner auth-result" data-result={state} aria-live="polite">
          <span className="auth-status-icon"><Icon size={26} aria-hidden="true" /></span>
          <h1 id="confirm-heading">{title}</h1>
          {text && <p>{text}</p>}
          {pendingRole && <p>Permintaan peran Anda sedang ditinjau. Untuk sementara, akun Anda aktif sebagai warga.</p>}
          {state !== "checking" && (
            <div className="auth-result-actions">
              <Link to={state === "confirmed" ? ROUTES.DASHBOARD : ROUTES.LOGIN} className="login-submit">
                {state === "confirmed" ? "Lihat kondisi udara" : "Masuk"}<ArrowRight size={18} aria-hidden="true" />
              </Link>
              {state === "failed" && <Link className="login-back" to={ROUTES.REGISTER}>Daftar ulang</Link>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
