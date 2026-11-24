import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";
import { DataState } from "@/components/shared/DataState";
import { AccountPreferences } from "@/components/account/AccountPreferences";
import { WhatsAppSettings } from "@/components/live/WhatsAppSettings";
export function SystemPage() {
  const auth = useAuth(),
    navigate = useNavigate();
  const { canManage, canUseRobotScreen, role } = useAccess();
  const [notice, setNotice] = useState("");
  return (
    <div className="app-section-stack settings-page">
      <header className="live-heading">
        <div>
          <h1>Pengaturan</h1>
        </div>
      </header>
      {!auth.user ? (
        <DataState
          title="Masuk untuk membuka pengaturan"
          error={auth.error || "Akun diperlukan untuk mengatur notifikasi dan perangkat."}
        />
      ) : (
        <>
          <section className="live-panel settings-list" aria-label="Akun">
            <div className="settings-row">
              <div>
                <h2>Akun</h2>
                <p>{auth.user.email}</p>
              </div>
              <button
                className="live-button secondary"
                onClick={async () => {
                  try {
                    await auth.logout();
                    navigate("/login");
                  } catch (e) {
                    setNotice(e instanceof Error ? e.message : "Gagal keluar.");
                  }
                }}
              >
                Keluar akun
              </button>
            </div>
            {canUseRobotScreen && (
              <div className="settings-row">
                <div>
                  <h2>Layar AERO-BOT</h2>
                  <p>
                    {role === "robot"
                      ? "Tampilan wajah fisik dan Hub Lingkungan untuk unit AERO-BOT."
                      : "Hubungkan layar wajah AERO-BOT fisik ke akun ini."}
                  </p>
                </div>
                <Link className="live-button secondary" to="/robot-screen">
                  Buka layar robot
                </Link>
              </div>
            )}
            {canManage && (
              <div className="settings-row">
                <div>
                  <h2>Ambang kawasan</h2>
                  <p>Batas waspada, bahaya, dan notifikasi perangkat di lokasi yang Anda kelola.</p>
                </div>
                <Link className="live-button secondary" to="/management">
                  Kelola ambang
                </Link>
              </div>
            )}
          </section>
          <AccountPreferences />
          <WhatsAppSettings />
        </>
      )}
      {notice && (
        <p className="live-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
