import { AeroMascot } from "@/components/environment/AeroMascot";
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
        <AeroMascot pose={error ? "guide" : "calm"} className="live-state-art" animated={false} />
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
