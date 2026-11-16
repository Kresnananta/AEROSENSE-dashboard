import { SensorWorkspace } from "@/components/live/SensorWorkspace";
import { useAccess } from "@/hooks/useAccess";
import { DataState } from "@/components/shared/DataState";
import { ROUTES } from "@/lib/constants";
import { Link, Navigate } from "react-router-dom";
export function ESGReportsPage() {
  const access = useAccess();
  if (access.loading) return <DataState loading />;
  if (!access.signedIn) return <Navigate to="/login" replace />;
  if (access.role === "robot") return <Navigate to={ROUTES.ENVIRONMENT} replace />;
  if (!access.canAudit)
    return (
      <section className="app-section-stack">
        <DataState
          error={
            access.error || "Laporan lingkungan hanya tersedia untuk admin dan auditor lokasi."
          }
        />
        <div>
          <Link to="/dashboard" className="live-button secondary">
            Kembali ke beranda
          </Link>
        </div>
      </section>
    );
  return <SensorWorkspace mode="report" />;
}
