export type NodeStatus = "online" | "offline" | "warning" | "critical";

export type AirQualityLevel = "good" | "moderate" | "unhealthy" | "hazardous";

export interface AIEstimation {
  rawValue?: number;
  estimatedValue: number;
  correction: number;
  confidence: number;
}

export interface NodeReading {
  id: string;
  nodeId: string;
  pm25: number;
  tvoc: number;
  eco2: number;
  temperature: number;
  humidity: number;
  aqi: number;
  quality: AirQualityLevel;
  timestamp: string;

  estimations?: {
    eco2?: AIEstimation;
    tvoc?: AIEstimation;
  };
}

export interface Node {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: NodeStatus;
  lastReading?: NodeReading;
  batteryLevel?: number;
  uptime: number;
  latency: number;
  createdAt: string;
  updatedAt: string;
}

export interface NodeQueryParams {
  page?: number;
  limit?: number;
  status?: NodeStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function getAqiCategory(aqi: number): {
  level: "good" | "moderate" | "warning" | "critical";
  label: string;
  color: string;
  bg: string;
} {
  if (aqi <= 50) {
    return { level: "good", label: "Baik", color: "#19A679", bg: "#E6FAEF" };
  }
  if (aqi <= 100) {
    return { level: "moderate", label: "Sedang", color: "#BB8823", bg: "#FFF2DC" };
  }
  if (aqi <= 150) {
    return { level: "warning", label: "Perlu perhatian", color: "#EF7454", bg: "#FFF0E9" };
  }
  return { level: "critical", label: "Kritis", color: "#E34C26", bg: "#FFEBE5" };
}
