export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeName: string;
  sensor: string;
  severity: AlertSeverity;
  description: string;
  status: AlertStatus;
  value?: number;
  threshold?: number;
  aiExplanation?: string;
}
