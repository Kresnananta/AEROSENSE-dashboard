import { useEffect, useState } from "react";
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
  Wind,
  CloudRain,
  Activity,
  Sparkles,
} from "lucide-react";
import { AeroMascot } from "@/components/environment/AeroMascot";
import { ConditionScene } from "@/components/environment/ConditionScene";
import { useAuth } from "@/hooks/useAuth";
import { useDayPeriod } from "@/hooks/useDayPeriod";
import { useIllustrationMotion } from "@/hooks/useIllustrationMotion";
import { weatherSceneForPeriod } from "@/lib/time-of-day";
import type { Scene } from "@/lib/environment-presentation";
import { LandingTrend } from "./LandingTrend";
import "@/styles/landing.css";

type MascotPose = "welcome" | "guide" | "watch" | "talk" | "success" | "calm" | "alert";

const mascotShowcase: {
  pose: MascotPose;
  label: string;
  badge: string;
  speech: string;
  detail: string;
}[] = [
  {
    pose: "welcome",
    label: "Sapa",
    badge: "Udara Hari Ini",
    speech: "Halo! Kualitas udara di sekitar titik pantau pagi ini terpantau baik.",
    detail: "Menyambut warga dengan ringkasan kondisi udara terkini.",
  },
  {
    pose: "guide",
    label: "Pandu",
    badge: "Prakiraan Cuaca",
    speech: "Peluang hujan sore nanti 75%. Siapkan payung sebelum beraktivitas di luar.",
    detail: "Memandu persiapan harian berdasarkan prakiraan cuaca per jam.",
  },
  {
    pose: "watch",
    label: "Pantau",
    badge: "Inspeksi Sensor",
    speech: "Memeriksa tren debu optik, PM2.5, suhu, dan kelembapan setiap 5 menit.",
    detail: "Memantau konsistensi pembacaan sensor fisik di lokasi.",
  },
  {
    pose: "talk",
    label: "Jawab",
    badge: "Dialog Suara & Teks",
    speech: "Tanyakan arti angka udara atau risiko cuaca dalam bahasa sehari-hari.",
    detail: "Menjawab pertanyaan warga secara jelas beserta langkah mitigasi.",
  },
  {
    pose: "success",
    label: "Siaga",
    badge: "6 Lapisan Aktif",
    speech: "Sensor lokal, prakiraan cuaca, titik panas, sungai, dan gempa aktif dipantau.",
    detail: "Menyatukan pemantauan lapangan dan sumber resmi publik.",
  },
];

const features = [
  {
    title: "Sensor udara per lokasi",
    icon: Radio,
    heading: "Pembacaan sensor langsung dari lapangan",
    description:
      "Pilih titik sensor di peta untuk melihat kondisi udara, suhu, kelembapan, serta waktu pembacaan terakhir secara akurat.",
    path: "/dashboard",
    action: "Lihat pemantauan",
    scene: "sensor" as const,
    pose: "watch" as MascotPose,
    metricLabel: "Interval baca",
    metricValue: "5 mnt",
    metricNote: "Pembaruan telemetri node",
  },
  {
    title: "Cuaca, prakiraan, dan peringatan",
    icon: CloudSun,
    heading: "Enam lapisan lingkungan dalam satu hub",
    description:
      "Lihat perkiraan hujan per jam, kualitas udara wilayah, kelembapan tanah, titik panas, sungai, hingga episenter gempa BMKG.",
    path: "/environment",
    action: "Buka Hub Lingkungan",
    scene: "air" as const,
    pose: "guide" as MascotPose,
    metricLabel: "Cakupan wilayah",
    metricValue: "6 lapisan",
    metricNote: "Cuaca, udara, tanah, api, sungai, gempa",
  },
  {
    title: "Tanya AERO-BOT",
    icon: MessageCircle,
    heading: "Penjelasan ramah dengan suara maupun teks",
    description:
      "Tanyakan kapan hujan diperkirakan turun atau apa arti angka kualitas udara bagi anak-anak, lansia, dan aktivitas luar ruang.",
    path: "/aerobot",
    action: "Tanya AERO-BOT",
    scene: null,
    pose: "talk" as MascotPose,
    metricLabel: "Mode interaksi",
    metricValue: "Suara & Teks",
    metricNote: "Bahasa Indonesia sehari-hari",
  },
  {
    title: "Riwayat, grafik, dan laporan",
    icon: ChartNoAxesCombined,
    heading: "Grafik tren, ambang peringatan, dan ekspor CSV",
    description:
      "Bandingkan pembacaan asli dan estimasi model dari waktu ke waktu. Pengelola dapat mengunduh laporan PDF serta data CSV.",
    path: "/analytics",
    action: "Lihat riwayat udara",
    scene: "sensor" as const,
    pose: "success" as MascotPose,
    metricLabel: "Format ekspor",
    metricValue: "CSV & PDF",
    metricNote: "Siap untuk evaluasi kawasan",
  },
];

const workflowSteps: {
  step: string;
  title: string;
  description: string;
  pose: MascotPose;
  tag: string;
  pills: string[];
}[] = [
  {
    step: "01",
    title: "Ukur di titik lokasi",
    description:
      "Perangkat sensor mengirim pembacaan partikel debu, suhu, kelembapan, dan TVOC langsung dari lokasi pemasangan.",
    pose: "calm",
    tag: "Telemetri Lapangan",
    pills: ["PM2.5 & Debu", "Suhu & Lembap", "Validasi Waktu"],
  },
  {
    step: "02",
    title: "Pahami kondisi sekitar",
    description:
      "Dashboard memadukan pembacaan sensor lokal dengan prakiraan cuaca, indeks udara wilayah, dan peta kejadian publik.",
    pose: "guide",
    tag: "Hub Lingkungan",
    pills: ["Prakiraan Jam", "ISPU & AQI", "Peta Interaktif"],
  },
  {
    step: "03",
    title: "Tinjau peringatan & saran",
    description:
      "Warga memperoleh langkah praktis dari AERO-BOT, sementara pengelola meninjau ambang waspada dan laporan kawasan.",
    pose: "alert",
    tag: "Tindak Lanjut",
    pills: ["Saran AERO-BOT", "Notifikasi WA", "Laporan Kawasan"],
  },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [poseIndex, setPoseIndex] = useState(0);
  const [posePaused, setPosePaused] = useState(false);
  const { user } = useAuth();
  const dayPeriod = useDayPeriod();
  const { ref: stageRef, playing: stagePlaying } = useIllustrationMotion<HTMLDivElement>();

  useEffect(() => {
    if (!stagePlaying || posePaused) return;
    const timer = window.setInterval(() => {
      setPoseIndex((prev) => (prev + 1) % mascotShowcase.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [stagePlaying, posePaused]);

  const currentMascot = mascotShowcase[poseIndex];
  const feature = features[active];
  const weatherScene = weatherSceneForPeriod({ icon: "partly", period: dayPeriod }) as Scene;
  const activeScene = feature.path === "/environment" ? weatherScene : feature.scene;

  return (
    <div className="landing-page">
      <a className="landing-skip" href="#konten">
        Lewati navigasi
      </a>

      {/* Full-Bleed Atmospheric Sky Hero Stage */}
      <div className="landing-hero-stage" data-day-period={dayPeriod}>
        <header className="landing-header">
          <Link to="/" className="landing-brand" aria-label="AEROSENSE — Halaman utama">
            <img src="/assets/brand/aerosense-mark.png" alt="" width="38" height="38" />
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
            <a href="#tentang">Tentang</a>
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#pengelola">Pengelola</a>
            <Link to={user ? "/dashboard" : "/login"} className="landing-nav-login">
              {user ? "Buka dashboard" : "Masuk"}
              <ArrowUpRight size={16} />
            </Link>
          </nav>
        </header>

        <section className="landing-hero landing-container" data-day-period={dayPeriod}>
          <div className="landing-hero-copy">
            <span className="landing-hero-badge">
              <Sparkles size={14} aria-hidden="true" />
              Observatorium Udara & Cuaca Publik
            </span>
            <h1>Kenali udara dan cuaca di sekitar Anda.</h1>
            <p>
              Cek kualitas udara, prakiraan hujan, dan peringatan lingkungan di sekitar Anda dengan
              penjelasan yang jernih.
            </p>
            <div className="landing-actions">
              <Link className="landing-button" to="/dashboard">
                Lihat pemantauan
                <ArrowRight size={18} />
              </Link>
              <Link className="landing-button-secondary" to="/aerobot">
                Tanya AERO-BOT
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div
            ref={stageRef}
            className="landing-hero-showcase"
            onMouseEnter={() => setPosePaused(true)}
            onMouseLeave={() => setPosePaused(false)}
          >
            {/* Left Floating Card */}
            <aside className="landing-stage-card card-left" aria-label="Ringkasan sensor lokal">
              <div className="stage-card-head">
                <strong>Kondisi Titik Sensor</strong>
                <span className="stage-pill-good">Terpantau baik</span>
              </div>
              <div className="stage-metric-list">
                <div className="stage-metric-item">
                  <div className="stage-metric-row">
                    <span>
                      <Wind size={15} aria-hidden="true" /> Debu optik & PM2.5
                    </span>
                    <strong>14,2 µg/m³</strong>
                  </div>
                  <div className="stage-progress" aria-hidden="true">
                    <span style={{ width: "32%" }} />
                  </div>
                  <small>Di bawah ambang waspada · Udara nyaman</small>
                </div>
                <div className="stage-metric-item">
                  <div className="stage-metric-row">
                    <span>
                      <CloudSun size={15} aria-hidden="true" /> Suhu & kelembapan
                    </span>
                    <strong>28,6 °C · 66%</strong>
                  </div>
                  <div className="stage-progress" aria-hidden="true">
                    <span style={{ width: "66%" }} />
                  </div>
                  <small>Hangat berawan · Nyaman di luar ruang</small>
                </div>
              </div>
            </aside>

            {/* Center Animated Multi-Pose Mascot Stage */}
            <div
              className="landing-mascot-stage"
              role="region"
              aria-label="Animasi karakter AERO-BOT"
            >
              <div className="landing-mascot-window">
                <div className="landing-mascot-speech" aria-live="polite">
                  <span className="speech-tag">{currentMascot.badge}</span>
                  <p>{currentMascot.speech}</p>
                </div>

                <div
                  className="landing-hero-art"
                  role="img"
                  aria-label={`Maskot AERO-BOT — pose ${currentMascot.label}`}
                >
                  <div className="landing-mascot-halo" aria-hidden="true" />
                  {mascotShowcase.map((item, idx) => (
                    <div
                      key={item.pose}
                      className={`landing-pose-layer ${idx === poseIndex ? "is-active" : ""}`}
                      aria-hidden={idx !== poseIndex}
                    >
                      <AeroMascot pose={item.pose} className="landing-hero-mascot" />
                    </div>
                  ))}
                </div>

                <div
                  className="landing-pose-switcher"
                  role="tablist"
                  aria-label="Pilih ekspresi AERO-BOT"
                >
                  {mascotShowcase.map((item, idx) => (
                    <button
                      key={item.pose}
                      type="button"
                      role="tab"
                      aria-selected={idx === poseIndex}
                      className={idx === poseIndex ? "is-active" : ""}
                      onClick={() => setPoseIndex(idx)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Floating Card */}
            <aside className="landing-stage-card card-right" aria-label="Pantauan wilayah publik">
              <div className="stage-card-head">
                <strong>Pantauan Wilayah</strong>
                <Link to="/environment" className="stage-head-link">
                  Hub Lingkungan <ArrowUpRight size={14} />
                </Link>
              </div>
              <ul className="stage-feed-list">
                <li>
                  <span className="stage-feed-icon">
                    <CloudRain size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Prakiraan Hujan</strong>
                    <small>Open-Meteo · Per jam & 7 hari</small>
                  </div>
                  <span className="stage-feed-val">Sore 75%</span>
                </li>
                <li>
                  <span className="stage-feed-icon">
                    <Wind size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Indeks Kualitas Udara</strong>
                    <small>ISPU 24 jam & AQI wilayah</small>
                  </div>
                  <span className="stage-feed-val">52 · Sedang</span>
                </li>
                <li>
                  <span className="stage-feed-icon">
                    <Activity size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Kejadian Publik</strong>
                    <small>Titik panas & gempa BMKG M5+</small>
                  </div>
                  <span className="stage-feed-val">Terpantau</span>
                </li>
              </ul>
            </aside>
          </div>
        </section>
      </div>

      <main id="konten">
        {/* Editorial Narrative & 3-Card Bento Grid (Inspired by Reference Section 2) */}
        <section id="tentang" className="landing-editorial landing-container">
          <div className="landing-editorial-meta">
            <span>Tentang AEROSENSE</span>
            <span>Pemantauan Udara Ambien & Informasi Wilayah</span>
          </div>

          <p className="landing-editorial-statement">
            <strong>
              AEROSENSE{" "}
              <span className="editorial-inline-badge" aria-hidden="true">
                <img src="/assets/aerobot/falcon/welcome.webp" alt="" width="28" height="28" />
              </span>{" "}
              menyatukan pembacaan sensor udara di lapangan dengan prakiraan cuaca dan peringatan
              publik dalam satu layar yang mudah dipahami.
            </strong>{" "}
            <span>
              Dari warga yang merencanakan aktivitas luar ruang hingga pengelola kawasan yang
              menjaga ambang keselamatan, setiap angka disajikan terpisah, transparan, dan disertai
              artinya.
            </span>
          </p>

          <div className="landing-bento-grid">
            <article className="bento-card bento-sky" data-day-period={dayPeriod}>
              <div className="bento-sky-art">
                <ConditionScene scene={weatherScene} />
              </div>
              <div className="bento-sky-caption">
                <strong>6 Lapisan Lingkungan</strong>
                <p>
                  Cuaca, kualitas udara, kelembapan tanah, titik panas satelit, debit sungai, dan
                  episenter gempa BMKG dalam satu tampilan wilayah.
                </p>
              </div>
            </article>

            <article className="bento-card bento-poses">
              <div className="bento-poses-top">
                <span>Asisten Lingkungan</span>
                <strong>AERO-BOT Interaktif</strong>
              </div>
              <div className="bento-pose-avatars" aria-hidden="true">
                {(["welcome", "guide", "watch", "talk", "success"] as MascotPose[]).map((p, idx) => (
                  <button
                    key={p}
                    type="button"
                    className={`bento-avatar ${poseIndex === idx ? "is-selected" : ""}`}
                    onClick={() => setPoseIndex(idx)}
                    tabIndex={-1}
                  >
                    <img src={`/assets/aerobot/falcon/${p}.webp`} alt="" width="44" height="44" />
                  </button>
                ))}
              </div>
              <p className="bento-quote-text">
                “Tidak perlu menghafal istilah teknis—tanyakan kondisi udara atau cuaca dengan suara
                maupun teks, lalu dapatkan arti dan langkah praktisnya.”
              </p>
            </article>

            <article className="bento-card bento-summary">
              <div className="bento-summary-head">
                <strong>Data Terpisah & Jelas</strong>
                <Link to="/dashboard" aria-label="Buka dashboard pemantauan">
                  <ArrowUpRight size={18} />
                </Link>
              </div>
              <div className="bento-summary-body">
                <span>Sumber Berlapis</span>
                <strong>Sensor + API Publik</strong>
                <p>
                  Pembacaan sensor fisik di titik lokasi tidak pernah dicampur dengan estimasi model
                  cuaca wilayah.
                </p>
              </div>
              <div className="bento-summary-bar">
                <span>Siap dipantau</span>
                <Link to="/environment" className="bento-bar-cta">
                  Buka Hub <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Core Features Split Section (Inspired by Reference Section 3) */}
        <section id="fitur" className="landing-features landing-container">
          <div className="landing-feature-layout">
            <div className="landing-feature-left">
              <div className="landing-section-heading">
                <h2>Jelajahi pemantauan untuk warga dan pengelola</h2>
                <p>
                  Pilih layanan untuk melihat bagaimana AEROSENSE menyajikan data sensor, cuaca
                  wilayah, percakapan AERO-BOT, dan grafik riwayat.
                </p>
              </div>
              <div className="landing-feature-options" aria-label="Pilih fitur AEROSENSE">
                {features.map((item, index) => (
                  <button
                    key={item.title}
                    aria-pressed={active === index}
                    onClick={() => setActive(index)}
                  >
                    <span className="feature-option-icon">
                      <item.icon size={19} />
                    </span>
                    <span className="feature-option-text">
                      <strong>{item.title}</strong>
                      {active === index && <small>{item.description}</small>}
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
              <div className="landing-feature-cta">
                <Link className="landing-button" to={feature.path}>
                  {feature.action}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            <article
              className="landing-feature-detail"
              data-feature={feature.path}
              aria-live="polite"
            >
              <div className="landing-feature-frame">
                <div className="landing-feature-frame-head">
                  <div>
                    <span>Pratinjau Layanan</span>
                    <h3>{feature.heading}</h3>
                  </div>
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
                    <AeroMascot pose={feature.pose} />
                  )}
                </div>
              </div>

              <div className="landing-feature-callout">
                <img
                  src={`/assets/aerobot/falcon/${feature.pose}.webp`}
                  alt=""
                  width="52"
                  height="52"
                />
                <div>
                  <span>{feature.metricLabel}</span>
                  <strong>{feature.metricValue}</strong>
                  <small>{feature.metricNote}</small>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* 3-Step Visual Workflow Cards (Inspired by Reference "Simple Steps") */}
        <section id="cara-kerja" className="landing-workflow landing-container">
          <div className="landing-workflow-header">
            <h2>Cara kerja pemantauan</h2>
            <p>Dari pembacaan sensor di lapangan hingga saran praktis dan tindak lanjut di lokasi.</p>
          </div>

          <ol className="landing-workflow-cards">
            {workflowSteps.map((item) => (
              <li key={item.step} className="landing-step-card">
                <div className="step-card-frame">
                  <div className="step-card-top">
                    <span className="landing-step-number" aria-hidden="true">
                      {item.step}
                    </span>
                    <span className="step-card-tag">{item.tag}</span>
                  </div>
                  <div className="step-card-mascot">
                    <AeroMascot pose={item.pose} />
                  </div>
                  <div className="step-card-pills">
                    {item.pills.map((pill) => (
                      <span key={pill}>{pill}</span>
                    ))}
                  </div>
                </div>
                <div className="step-card-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Management Section */}
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

        <aside id="tentang-data" className="landing-data-note landing-container">
          <strong>Tentang data</strong>
          <p>
            Pembacaan sensor dan estimasi wilayah ditampilkan terpisah. Ambang pengelola digunakan
            untuk pemantauan operasional.
          </p>
        </aside>
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
