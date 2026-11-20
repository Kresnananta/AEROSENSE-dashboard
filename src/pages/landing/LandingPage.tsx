import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Radio,
  CloudSun,
  MessageCircle,
  ChartNoAxesCombined,
  Menu,
  X,
  Settings2,
  LockKeyhole,
  FileSpreadsheet,
} from "lucide-react";
import { AeroMascot } from "@/components/environment/AeroMascot";
import { ConditionScene } from "@/components/environment/ConditionScene";
import { useAuth } from "@/hooks/useAuth";
import { useDayPeriod } from "@/hooks/useDayPeriod";
import { weatherSceneForPeriod } from "@/lib/time-of-day";
import type { Scene } from "@/lib/environment-presentation";
import { LandingTrend } from "./LandingTrend";
import "@/styles/landing.css";

const features = [
  {
    title: "Sensor udara",
    icon: Radio,
    heading: "Pembacaan sensor per lokasi",
    description:
      "Pilih titik sensor di peta untuk melihat kondisi udara dan waktu pembacaan terakhir.",
    path: "/dashboard",
    action: "Lihat pemantauan",
    scene: "sensor" as const,
  },
  {
    title: "Cuaca dan lingkungan",
    icon: CloudSun,
    heading: "Cuaca, prakiraan, dan peringatan",
    description:
      "Lihat perkiraan hujan per jam, kualitas udara wilayah, dan kejadian di sekitar titik sensor.",
    path: "/environment",
    action: "Buka Hub Lingkungan",
    scene: "air" as const,
  },
  {
    title: "Tanya AERO-BOT",
    icon: MessageCircle,
    heading: "Tanya AERO-BOT",
    description:
      "Tanya kapan hujan diperkirakan turun atau apa arti angka kualitas udara di sekitar Anda.",
    path: "/aerobot",
    action: "Tanya AERO-BOT",
    scene: null,
  },
  {
    title: "Riwayat dan laporan",
    icon: ChartNoAxesCombined,
    heading: "Grafik, laporan, dan ekspor data",
    description:
      "Bandingkan pembacaan dari waktu ke waktu. Pengelola dapat mengunduh laporan dan data CSV.",
    path: "/analytics",
    action: "Lihat riwayat udara",
    scene: "sensor" as const,
  },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const { user } = useAuth();
  const dayPeriod = useDayPeriod();

  const feature = features[active];
  const weatherScene = weatherSceneForPeriod({ icon: "partly", period: dayPeriod }) as Scene;
  const activeScene = feature.path === "/environment" ? weatherScene : feature.scene;
  return (
    <div className="landing-page">
      <a className="landing-skip" href="#konten">
        Lewati navigasi
      </a>
      <div className="landing-hero-stage" data-day-period={dayPeriod}>
        <span className="landing-hero-fade" aria-hidden="true" />
        <header className="landing-header">
          <Link to="/" className="landing-brand" aria-label="AEROSENSE — Halaman utama">
            <img src="/assets/brand/aerosense-mark.png" alt="" width="40" height="40" />
            <span>
              AERO<strong>SENSE</strong>
            </span>
          </Link>
          <button
            className="landing-menu-button"
            aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={menuOpen}
            aria-controls="landing-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav
            id="landing-navigation"
            className={menuOpen ? "is-open" : ""}
            aria-label="Navigasi halaman utama"
            onClick={() => setMenuOpen(false)}
          >
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#pengelola">Untuk pengelola</a>
            <Link to={user ? "/dashboard" : "/login"} className="landing-nav-login">
              {user ? "Buka dashboard" : "Masuk"}
              <ArrowUpRight size={16} />
            </Link>
          </nav>
        </header>
        <section className="landing-hero landing-container" data-day-period={dayPeriod}>
          <div className="landing-hero-copy">
            <h1>Kenali udara dan cuaca di sekitar Anda.</h1>
            <p>
              Cek kualitas udara, prakiraan hujan, dan peringatan di sekitar Anda.
            </p>
            <div className="landing-actions">
              <Link className="landing-button" to="/dashboard">
                Lihat pemantauan
                <ArrowRight size={18} />
              </Link>
              <Link className="landing-text-link" to="/aerobot">
                Tanya AERO-BOT
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <div className="landing-hero-art">
            <AeroMascot pose="welcome" className="landing-hero-mascot" />
          </div>
        </section>
      </div>

      <main id="konten">
        <section id="fitur" className="landing-features landing-container">
          <div className="landing-section-heading">
            <h2>Jelajahi pemantauan</h2>
          </div>
          <div className="landing-feature-layout">
            <div className="landing-feature-options" aria-label="Pilih fitur AEROSENSE">
              {features.map((item, index) => (
                <button
                  key={item.title}
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                >
                  <item.icon size={20} />
                  <span>{item.title}</span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
            <article className="landing-feature-detail" data-feature={feature.path} aria-live="polite">
              <div>
                <h3>{feature.heading}</h3>
                <p>{feature.description}</p>
                <Link className="landing-text-link" to={feature.path}>
                  {feature.action}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="landing-feature-illustration">
                {feature.path === "/analytics" ? (
                  <LandingTrend />
                ) : activeScene ? (
                  <ConditionScene scene={activeScene} />
                ) : (
                  <AeroMascot pose="watch" />
                )}
              </div>
            </article>
          </div>
        </section>

        <section id="cara-kerja" className="landing-workflow landing-container">
          <div className="landing-workflow-intro">
            <h2>Cara kerja</h2>
            <p>Dari pembacaan sensor hingga tindak lanjut di lokasi.</p>
          </div>
          <ol className="landing-workflow-steps">
            <li>
              <span className="landing-step-number" aria-hidden="true">
                01
              </span>
              <div>
                <h3>Ukur di lokasi</h3>
                <p>Sensor mengirim pembacaan udara dan cuaca mikro dari titik pemasangan.</p>
              </div>
            </li>
            <li>
              <span className="landing-step-number" aria-hidden="true">
                02
              </span>
              <div>
                <h3>Cek kondisi sekitar</h3>
                <p>Lihat pembacaan sensor, riwayat, dan estimasi wilayah di dashboard.</p>
              </div>
            </li>
            <li>
              <span className="landing-step-number" aria-hidden="true">
                03
              </span>
              <div>
                <h3>Tinjau peringatan</h3>
                <p>Pengelola meninjau peringatan dan mengatur tindak lanjut.</p>
              </div>
            </li>
          </ol>
        </section>

        <section id="pengelola" className="landing-management landing-container">
          <div>
            <h2>Kelola kawasan</h2>
            <p>Atur ambang peringatan pada lokasi yang ditugaskan dan unduh data untuk evaluasi.</p>
            <div className="landing-actions">
              <Link className="landing-button" to={user ? "/management" : "/login"}>
                Kelola kawasan
                <ArrowRight size={18} />
              </Link>
              <Link className="landing-management-link" to="/analytics">
                <FileSpreadsheet size={18} />
                Telusuri riwayat
              </Link>
            </div>
          </div>
          <div className="landing-management-details">
            <p>
              <Settings2 size={21} />
              <span>
                <strong>Ambang peringatan</strong>Waspada, bahaya, batas pulih, dan jeda notifikasi.
              </span>
            </p>
            <p>
              <FileSpreadsheet size={21} />
              <span>
                <strong>Ekspor CSV</strong>Buka di Excel atau Google Sheets.
              </span>
            </p>
            <p>
              <LockKeyhole size={21} />
              <span>
                <strong>Akses per lokasi</strong>Admin menetapkan pengelola untuk setiap lokasi.
              </span>
            </p>
          </div>
        </section>
      </main>
      <footer className="landing-footer landing-container">
        <Link to="/" className="landing-brand">
          <img src="/assets/brand/aerosense-mark.png" alt="" width="30" height="30" />
          <span>
            AERO<strong>SENSE</strong>
          </span>
        </Link>
        <Link to="/dashboard">
          Buka pemantauan
          <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  );
}
