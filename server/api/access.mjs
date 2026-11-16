export const ROLE_RANK = { robot: 1, viewer: 2, auditor: 3, operator: 4, admin: 5 };

export const canViewModel = (role) => ["operator", "admin", "auditor"].includes(role);
export const canAuditEsg = (role) => ["admin", "auditor"].includes(role);
export const canManage = (role) => ["operator", "admin"].includes(role);
export const canUseRobotScreen = (role) => ["robot", "operator", "admin"].includes(role);

export function highestRole(memberships = []) {
  return memberships.reduce(
    (best, m) => ((ROLE_RANK[m.role] || 0) > (ROLE_RANK[best] || 0) ? m.role : best),
    null,
  );
}

export const simpleReading = (r) => ({
  id: r.id,
  node_id: r.node_id,
  observed_at: r.observed_at,
  metrics: r.metrics ?? {},
  quality: { invalid: r.quality?.invalid === true },
});

const denied = () => Object.assign(new Error("Akses lokasi tidak diizinkan"), { status: 403 });

export async function nodeAccess(
  { one, filter },
  userId,
  nodeId,
  { write = false, allowPublic = false } = {},
) {
  const n = await one("ae_nodes", "id=eq." + filter(nodeId));
  const m =
    n &&
    (await one("ae_members", "user_id=eq." + userId + "&location_id=eq." + filter(n.location_id)));
  if (m && (!write || canManage(m.role))) return Object.assign(n, { member_role: m.role });
  if (!m && !write && allowPublic && n?.public_read === true && n.enabled === true)
    return Object.assign(n, { member_role: "viewer", public_access: true });
  throw denied();
}

export const PUBLIC_NODE_FIELDS = ["id", "name", "latitude", "longitude", "pm25_validated"];
