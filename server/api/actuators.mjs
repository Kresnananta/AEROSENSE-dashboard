import { canManage } from "./access.mjs";
const idPattern = /^[a-z0-9-]{1,40}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (message, status = 400) => {
  throw Object.assign(Error(message), { status });
};
export function actuatorView(a, commands = [], now = Date.now()) {
  const online =
    a.status?.state === "online" &&
    Number.isFinite(Date.parse(a.last_seen_at)) &&
    now - Date.parse(a.last_seen_at) < 45000;
  return {
    ...a,
    online,
    commands: commands.map((c) => ({
      ...c,
      state:
        ["queued", "dispatching", "published", "accepted"].includes(c.state) &&
        Date.parse(c.expires_at) < now
          ? "expired"
          : c.state,
    })),
    can_run: !!(
      a.enabled &&
      online &&
      a.status?.clock_synced === true &&
      a.status?.battery_ok === true &&
      a.status?.water_ok === true &&
      !a.status?.manual_off &&
      a.status?.output !== "on" &&
      a.status?.session_active !== true &&
      (!a.next_run_at || Date.parse(a.next_run_at) <= now)
    ),
  };
}
export function actuatorRoutes({
  db,
  one,
  rpc,
  user,
  member,
  send,
  filter,
  rawBody,
  rate,
  env,
  equal,
}) {
  return async (req, res, url) => {
    const path = url.pathname;
    if (path.startsWith("/internal/actuators/")) {
      if (req.method !== "POST") fail("Metode tidak diizinkan", 405);
      if (!equal(req.headers["x-aerosense-internal-key"], env.INTERNAL_API_KEY))
        fail("Unauthorized", 401);
      const p = JSON.parse((await rawBody(req, 6000)).toString() || "{}");
      if (path === "/internal/actuators/claim") {
        send(res, 200, { commands: await rpc("actuator_claim") });
        return true;
      }
      if (path === "/internal/actuators/published") {
        if (!uuid.test(p.id) || !uuid.test(p.token)) fail("Identitas dispatch tidak valid");
        send(res, 200, {
          updated: await rpc("actuator_published", { p_id: p.id, p_token: p.token }),
        });
        return true;
      }
      if (path === "/internal/actuators/event") {
        const match = /^aerosense\/actuators\/([a-z0-9-]{1,40})\/(ack|status)$/.exec(p.topic || "");
        const body = typeof p.message === "string" ? JSON.parse(p.message) : p.message;
        if (
          !match ||
          !body ||
          typeof body !== "object" ||
          Array.isArray(body) ||
          body.actuator_id !== match[1]
        )
          fail("Topik dan perangkat tidak cocok");
        if (!(await one("ae_actuators", "id=eq." + filter(match[1]))))
          fail("Sprinkler belum terdaftar", 404);
        if (match[2] === "ack") {
          if (!uuid.test(body.command_id)) {
            send(res, 200, { ignored: "non_web_command" });
            return true;
          }
          if (!["accepted", "completed", "rejected", "fault"].includes(body.state))
            fail("Status ACK tidak valid");
          send(res, 200, {
            updated: await rpc("actuator_ack", {
              p_actuator: match[1],
              p_id: body.command_id,
              p_state: body.state,
              p_reason: String(body.reason || "").slice(0, 100),
            }),
          });
          return true;
        }
        if (!["online", "offline"].includes(body.state)) fail("Status perangkat tidak valid");
        const now = Date.now(),
          at = Date.parse(body.at);
        if (
          body.state === "online" &&
          (!Number.isFinite(at) || now - at > 45000 || at > now + 5000)
        ) {
          send(res, 200, { ignored: "stale_status" });
          return true;
        }
        const status = {
          state: body.state,
          output: body.output === "on" ? "on" : "off",
          clock_synced: body.clock_synced === true,
          battery_ok: body.battery_ok === true,
          water_ok: body.water_ok === true,
          manual_off: body.manual_off === true,
          max_session_duration_ms: body.max_session_duration_ms === 3600000 ? 3600000 : null,
          session_pause_ms: Number.isInteger(body.session_pause_ms) &&
            body.session_pause_ms >= 1000 && body.session_pause_ms <= 60000
            ? body.session_pause_ms : null,
          session_active: body.session_active === true,
          active_command_id:
            typeof body.active_command_id === "string" ? body.active_command_id.slice(0, 96) : null,
          battery_v: Number.isFinite(body.battery_v) ? body.battery_v : null,
        };
        await db("ae_actuators", "id=eq." + filter(match[1]), "PATCH", {
          status,
          last_seen_at: new Date(now).toISOString(),
        });
        send(res, 200, { updated: true });
        return true;
      }
      fail("Not found", 404);
    }
    if (!["/v1/actuators", "/v1/actuators/commands", "/v1/actuators/map"].includes(path))
      return false;
    const account = await user(req);
    if (path === "/v1/actuators/map" && req.method === "GET") {
      const memberships = await db("ae_members", "select=location_id&user_id=eq." + filter(account.id));
      const locations = new Set(memberships.map((m) => m.location_id));
      const nodes = locations.size ? await db("ae_nodes", "select=id,location_id") : [];
      const ids = nodes.filter((n) => locations.has(n.location_id)).map((n) => filter(n.id));
      const rows = ids.length ? await db(
        "ae_actuators",
        "node_id=in.(" + ids.join(",") + ")&latitude=not.is.null&select=id,name,node_id,latitude,longitude,last_seen_at,status",
      ) : [];
      send(res, 200, { actuators: rows.map((a) => ({
        id: a.id, name: a.name, node_id: a.node_id, latitude: a.latitude,
        longitude: a.longitude, online: actuatorView(a).online,
      })) });
      return true;
    }
    if (path === "/v1/actuators" && req.method === "GET") {
      const nodeId = url.searchParams.get("node_id");
      if (!nodeId || !/^[a-zA-Z0-9_-]{1,40}$/.test(nodeId)) fail("Pilih lokasi sensor");
      const node = await member(account, nodeId);
      const rows = await db("ae_actuators", "node_id=eq." + filter(nodeId) + "&order=name.asc");
      const actuators = [];
      for (const a of rows) {
        const commands = await db(
          "ae_actuator_commands",
          "actuator_id=eq." + filter(a.id) + "&order=issued_at.desc&limit=5",
        );
        actuators.push(actuatorView(a, commands));
      }
      send(res, 200, {
        actuators, can_manage: canManage(node.member_role), can_register: node.member_role === "admin",
        pm25_validated: node.pm25_validated === true,
      });
      return true;
    }
    if (path === "/v1/actuators" && ["POST", "PATCH"].includes(req.method)) {
      const p = JSON.parse(await rawBody(req, 4000));
      const name = typeof p.name === "string" ? p.name.trim() : "";
      if (typeof p.id !== "string" || !idPattern.test(p.id) || p.id === "n8n-aerosense" || !name || name.length > 80)
        fail("Nama atau ID WATERSENSE tidak valid.");
      if (!Number.isFinite(p.latitude) || Math.abs(p.latitude) > 85 ||
          !Number.isFinite(p.longitude) || Math.abs(p.longitude) > 180)
        fail("Masukkan koordinat pemasangan yang valid.");
      const creating = req.method === "POST";
      const existing = creating ? null : await one("ae_actuators", "id=eq." + filter(p.id));
      if (!creating && !existing) fail("Sprinkler tidak ditemukan", 404);
      const nodeId = existing?.node_id ?? p.node_id;
      if (typeof nodeId !== "string" || !/^[a-zA-Z0-9_-]{1,40}$/.test(nodeId))
        fail("Pilih sensor acuan.");
      const node = await member(account, nodeId, true);
      if (node.member_role !== "admin") fail("Pendaftaran WATERSENSE memerlukan admin lokasi.", 403);
      rate("sprinkler-config:" + account.id, 30);
      const autoMetric = creating ? null : p.auto_metric;
      if (autoMetric !== null && !["dust_ug_m3", "pm25_ug_m3"].includes(autoMetric))
        fail("Pilih parameter partikulat untuk aktivasi otomatis.");
      if (autoMetric === "pm25_ug_m3" && !node.pm25_validated)
        fail("PM2.5 belum divalidasi pada sensor acuan.");
      if (!creating && typeof p.enabled !== "boolean") fail("Pilih status kendali perangkat.");
      const values = { name, latitude: p.latitude, longitude: p.longitude,
        enabled: !creating && p.enabled, auto_metric: autoMetric };
      let rows;
      try {
        rows = creating
          ? await db("ae_actuators", "", "POST", { id: p.id, node_id: nodeId, ...values })
          : await db("ae_actuators", "id=eq." + filter(p.id), "PATCH", values);
      } catch (error) {
        if (creating && error.status === 409) fail("ID WATERSENSE sudah terdaftar.", 409);
        throw error;
      }
      send(res, creating ? 201 : 200, { actuator: actuatorView(rows[0]) });
      return true;
    }
    if (path === "/v1/actuators/commands" && req.method === "POST") {
      const p = JSON.parse(await rawBody(req, 4000));
      if (
        !idPattern.test(p.actuator_id) ||
        !uuid.test(p.request_id) ||
        !["pulse", "session", "stop"].includes(p.action)
      )
        fail("Perintah sprinkler tidak valid");
      const a = await one("ae_actuators", "id=eq." + filter(p.actuator_id));
      if (!a) fail("Sprinkler tidak ditemukan", 404);
      await member(account, a.node_id, true);
      rate("sprinkler:" + account.id, p.action === "stop" ? 60 : 12);
      const duration = p.action === "stop" ? 0 : p.duration_ms;
      if (p.action === "session") {
        if (![1800000, 2700000, 3600000].includes(duration)) fail("Pilih durasi sesi 30, 45, atau 60 menit.");
        if (a.status?.max_session_duration_ms !== 3600000) fail("WATERSENSE belum mendukung sesi.", 409);
      } else if (
        !Number.isInteger(duration) ||
        duration < 0 ||
        duration > Math.min(a.max_duration_ms, 10000) ||
        (p.action === "pulse" && duration < 1000)
      )
        fail("Durasi harus 1–10 detik dan sesuai batas perangkat");
      let command;
      try {
        command = await rpc("actuator_enqueue", {
          p_user: account.id,
          p_actuator: a.id,
          p_action: p.action,
          p_duration: duration,
          p_request: p.request_id,
        });
      } catch (err) {
        if (err.status === 400)
          fail("Perintah ditolak. Periksa kesiapan perangkat, jeda operasi, dan izin lokasi.", 409);
        throw err;
      }
      send(res, 202, { command });
      return true;
    }
    fail("Metode tidak diizinkan", 405);
  };
}
