import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Radio,
  CloudSun,
  MessageCircle,
  Bell,
  Menu,
  X,
  Settings2,
  LockKeyhole,
  FileSpreadsheet,
} from "lucide-react";
import { AeroMascot } from "@/components/environment/AeroMascot";
import { useAuth } from "@/hooks/useAuth";
import { useDayPeriod } from "@/hooks/useDayPeriod";
import "@/styles/landing.css";

const features = [
  {
    title: "Cek udara di titik sensor",
    icon: Radio,
    description: "Lihat pembacaan kualitas udara, suhu, dan kelembapan menurut lokasi sensor.",
    path: "/dashboard",
  },
  {
    title: "Lihat prakiraan cuaca",
    icon: CloudSun,
    description: "Cek perkiraan hujan per jam dan kondisi lingkungan di sekitar Anda.",
    path: "/environment",
  },
  {
    title: "Baca peringatan sensor",
    icon: Bell,
    description: "Lihat titik pemantauan yang perlu diperhatikan dan cara menerima kabar lewat WhatsApp.",
    path: "/alerts",
  },
  {
    title: "Tanya AERO-BOT",
    icon: MessageCircle,
    description: "Tanyakan arti pembacaan udara atau kapan hujan diperkirakan turun.",
    path: "/aerobot",
  },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const dayPeriod = useDayPeriod();

  return (
    <div className="landing-page">
      <a className="landing-skip" href="#konten">
        Lewati navigasi
      </a>
      <div className="landing-hero-stage" data-day-period={dayPeriod}>
        <span className="landing-hero-fade" aria-hidden="true" />
        <header
          className="landing-header landing-container"
          onKeyDown={(event) => {
            if (event.key === "Escape" && menuOpen) {
              setMenuOpen(false);
              menuButton.current?.focus();
            }
          }}
        >
          <Link to="/" className="landing-brand" aria-label="AEROSENSE — Halaman utama">
            <img src="/assets/brand/aerosense-mark.png" alt="" width="40" height="40" />
            <span>
              AERO<strong>SENSE</strong>
            </span>
          </Link>
          <button
            type="button"
            ref={menuButton}
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
              Lihat pembacaan dari titik sensor, prakiraan hujan, dan peringatan lingkungan.
            </p>
            <div className="landing-actions">
              <Link className="landing-button" to="/dashboard">
                Cek kondisi sekitar
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="landing-hero-art">
            <AeroMascot pose="welcome" className="landing-hero-mascot" />
          </div>
        </section>
      </div>

      <main id="konten">
        <section id="fitur" className="landing-features landing-container" aria-labelledby="landing-features-heading">
          <div className="landing-section-heading">
            <h2 id="landing-features-heading">Yang bisa Anda cek</h2>
          </div>
          <ul className="landing-feature-list">
            {features.map(({ title, icon: Icon, description, path }) => (
              <li key={path}>
                <Link to={path} className="landing-feature-link" data-destination={path}
                  aria-labelledby={`fitur-${path.slice(1)}`} aria-describedby={`info-${path.slice(1)}`}>
                  <span className="landing-feature-icon"><Icon size={24} aria-hidden="true" /></span>
                  <span className="landing-feature-copy">
                    <strong id={`fitur-${path.slice(1)}`}>{title}</strong>
                    <span id={`info-${path.slice(1)}`}>{description}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
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
