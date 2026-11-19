import { Link } from "react-router-dom";
export function DataState({
  loading,
  error,
  empty,
  retry,
  title,
}: {
  title?: string;
  loading?: boolean;
  error?: string;
  empty?: string;
  retry?: () => void;
}) {
  return (
    <div className="live-state" role={error ? "alert" : "status"}>
      {!loading && (
        <img
          className="live-state-art"
          src={error ? "/assets/aerobot/falcon/guide.webp" : "/assets/aerobot/falcon/calm.webp"}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          decoding="async"
        />
      )}
      <strong>
        {loading
          ? "Memuat data…"
          : title || (error ? "Data belum dapat dimuat" : empty || "Belum ada data")}
      </strong>
      {error && <p>{error}</p>}
      {error && (
        <div className="live-actions">
          {retry && (
            <button className="live-button secondary" onClick={retry}>
              Coba lagi
            </button>
          )}
          <Link className="live-button" to="/login">
            Masuk
          </Link>
        </div>
      )}
    </div>
  );
}
