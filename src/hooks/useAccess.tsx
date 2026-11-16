import { createContext, useContext } from "react";

export type AccessRole = "guest" | "robot" | "viewer" | "operator" | "auditor" | "admin";

export const AccessContext = createContext({
  role: "guest" as AccessRole,
  canAudit: false,
  canViewModel: false,
  canManage: false,
  canUseRobotScreen: false,
  loading: true,
  signedIn: false,
  error: "",
});
export const useAccess = () => useContext(AccessContext);

export const ROLE_LABELS: Record<AccessRole, string> = {
  guest: "Tamu",
  robot: "Robot AERO-BOT",
  viewer: "Warga",
  operator: "Pengelola kawasan",
  auditor: "Auditor",
  admin: "Admin",
};
