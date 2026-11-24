import test from "node:test";
import assert from "node:assert/strict";
import { accountRoutes } from "../api/accounts.mjs";

test("location admins can manage members only in their own area", async () => {
  const admin = "11111111-1111-1111-1111-111111111111";
  const member = "22222222-2222-2222-2222-222222222222";
  const changes = [];
  let actorIsAdmin = true;
  let role = "viewer";
  let response;
  let payload = { user_id: member, location_id: "its", current_role: "viewer", role: "operator" };
  const route = accountRoutes({
    user: async () => ({ id: admin }),
    one: async () => null,
    db: async (table, q, method, data) => {
      if (table === "ae_nodes") {
        assert.match(q, /location_id=in\.\(its\)/);
        return [{ location_id: "its", name: "Node ITS" }];
      }
      if (table === "ae_profiles") return [{ user_id: member, full_name: "Anggota ITS" }];
      if (q.includes("role=eq.admin")) return actorIsAdmin ? [{ location_id: "its" }] : [];
      if (!method) return [{ user_id: member, role }];
      if (!q.endsWith("&role=eq." + role)) return [];
      changes.push({ method, data });
      role = data?.role;
      return [{ user_id: member }];
    },
    send: (_res, _status, body) => { response = body; },
    rawBody: async () => Buffer.from(JSON.stringify(payload)),
    filter: encodeURIComponent, rate: () => {},
  });
  const run = (method, location = "its") =>
    route({ method }, {}, new URL("http://test/v1/staff/members?location=" + location));
  await run("GET");
  assert.deepEqual(response.locations, [{ id: "its", name: "Node ITS" }]);
  assert.equal(response.members[0].name, "Anggota ITS");
  await assert.rejects(run("GET", "private"), { status: 403 });
  await run("PATCH");
  await assert.rejects(run("PATCH"), { status: 409 });
  payload = { ...payload, location_id: "other" };
  await assert.rejects(run("DELETE"), { status: 403 });
  payload = { ...payload, location_id: "its", current_role: "admin" };
  await assert.rejects(run("DELETE"), { status: 400 });
  payload = { ...payload, current_role: "operator" };
  await run("DELETE");
  actorIsAdmin = false;
  await assert.rejects(run("GET"), { status: 403 });
  assert.deepEqual(changes, [{ method: "PATCH", data: { role: "operator" } }, { method: "DELETE", data: undefined }]);
});
