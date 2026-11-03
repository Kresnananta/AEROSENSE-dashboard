import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLiveData } from "@/hooks/useLiveData";
import { getSupabase } from "@/services/supabase";
import { API_CONFIG } from "@/lib/constants";
import { robotFaceDocument } from "@/lib/robot-face-document";

interface FaceWindow extends Window {
  aerobotDisplay?: {
    receive: (event: unknown) => void;
    unlockAudio: () => Promise<void>;
  };
}
const document = robotFaceDocument();

export function RobotScreenPage() {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const access = useLiveData<{ can_manage: boolean }>(user ? "/v1/access" : null, 60000);
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!active || !userId || !access.data?.can_manage) return;
    const controller = new AbortController();
    const screen = () => (frame.current?.contentWindow as FaceWindow | null)?.aerobotDisplay;
    let reconnect: ReturnType<typeof setTimeout>;
    async function connect() {
      try {
        const { data, error } = await (await getSupabase()).auth.getSession();
        if (error || !data.session) throw new Error("Masuk kembali untuk menyambungkan layar.");
        const response = await fetch(`${API_CONFIG.baseUrl}/v1/robot-face/events`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          if ([401, 403].includes(response.status)) {
            setNotice("Akses layar tidak tersedia untuk akun ini.");
            return;
          }
          throw new Error("Layar belum tersambung.");
        }
        setNotice("");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let end;
          while ((end = buffer.indexOf("\n\n")) >= 0) {
            const packet = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            if (packet.startsWith("data: ")) screen()?.receive(JSON.parse(packet.slice(6)));
          }
          if (buffer.length > 1600000) throw new Error("Paket layar terlalu besar.");
        }
      } catch {
        if (controller.signal.aborted) return;
      }
      if (!controller.signal.aborted) {
        screen()?.receive({ action: "stop" });
        setNotice("Menyambungkan kembali…");
        reconnect = setTimeout(() => void connect(), 1500);
      }
    }
    void connect();
    return () => {
      controller.abort();
      clearTimeout(reconnect);
      screen()?.receive({ action: "stop" });
    };
  }, [active, userId, access.data?.can_manage]);

  if (isLoading || (user && access.loading)) return <p role="status">Menyiapkan layar…</p>;
  if (!user) return <Navigate to="/login?next=/robot-screen" replace />;
  if (access.error || !access.data?.can_manage)
    return <p role="alert">Layar robot hanya tersedia untuk pengelola kawasan dan admin.</p>;

  return (
    <main style={{ position: "fixed", inset: 0, background: "#edf0ff" }}>
      <iframe
        ref={frame}
        title="Wajah AERO-BOT"
        srcDoc={document}
        allow="autoplay; fullscreen"
        onLoad={() => setReady(true)}
        style={{ border: 0, width: "100%", height: "100%" }}
      />
      {!active && (
        <button
          disabled={!ready}
          onClick={() => {
            const screen = (frame.current?.contentWindow as FaceWindow | null)?.aerobotDisplay;
            if (!screen) return;
            void screen
              .unlockAudio()
              .then(() => setActive(true))
              .catch(() => setNotice("Ketuk kembali untuk mengaktifkan wajah."));
          }}
          style={{
            position: "absolute",
            bottom: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "14px 24px",
            border: 0,
            borderRadius: 24,
            color: "white",
            background: "#0758d3",
            font: "600 16px Inter, sans-serif",
          }}
        >
          Aktifkan wajah
        </button>
      )}
      {notice && (
        <p
          role="status"
          style={{
            position: "absolute",
            bottom: 12,
            left: 16,
            right: 16,
            textAlign: "center",
            color: "#234763",
          }}
        >
          {notice}
        </p>
      )}
    </main>
  );
}
