import { SensorWorkspace } from "@/components/live/SensorWorkspace";
import { EnvironmentPage } from "@/pages/environment/EnvironmentPage";
export function DashboardPage() {
  return (
    <div className="space-y-8">
      <EnvironmentPage compact />
      <SensorWorkspace />
    </div>
  );
}
