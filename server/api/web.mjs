// Browser routes share the ae_ tables and the existing authorization checks.
export function webRoutes({ db, one, user, member, send, filter, env }) {
  return async (req, res, url) => {
    const path = url.pathname;
    if (req.method !== "GET") return false;
    if (path === "/v1/config") {
      send(res, 200, {
        supabase_url: env.SUPABASE_URL,
        supabase_publishable_key: env.SUPABASE_ANON_KEY,
        environment_area_id: env.ENVIRONMENT_AREA_ID || "surabaya",
        robot_id: env.WEB_ROBOT_ID || null,
      });
      return true;
    }
    if (path === "/v1/environment") {
      const id =
        url.searchParams.get("area_id") ||
        env.ENVIRONMENT_AREA_ID ||
        "surabaya";
      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id))
        throw Object.assign(new Error("Invalid area"), { status: 400 });
      const area = await one(
        "ae_environment_areas",
        "id=eq." + filter(id) + "&enabled=eq.true",
      );
      if (!area) {
        send(res, 404, { error: "Area lingkungan belum tersedia" });
        return true;
      }
      const rows = await db(
        "ae_environment_area_cache",
        "area_id=eq." + filter(id),
      );
      const now = Date.now();
      const providers = rows.map((c) => ({
        provider: c.provider,
        last_attempt_at: c.last_attempt_at,
        refresh_after: c.refresh_after,
        last_error: c.last_error ? "Pembaruan sumber belum berhasil" : null,
        request_latitude: c.request_latitude,
        request_longitude: c.request_longitude,
        facts:
          c.request_latitude === area.latitude &&
          c.request_longitude === area.longitude
            ? (Array.isArray(c.payload?.facts) ? c.payload.facts : [])
                .filter(
                  (f) =>
                    f.area_id === area.id &&
                    f.reference?.latitude === area.latitude &&
                    f.reference?.longitude === area.longitude,
                )
                .map((f) => ({
                  ...f,
                  stale:
                    !Number.isFinite(Date.parse(f.fresh_until)) ||
                    Date.parse(f.fresh_until) < now,
                }))
            : [],
      }));
      send(res, 200, {
        area,
        providers,
        fetched_at: new Date(now).toISOString(),
      });
      return true;
    }
    if (
      ![
        "/v1/dashboard",
        "/v1/rules",
        "/v1/subscriptions",
        "/v1/robots",
      ].includes(path)
    )
      return false;
    const u = await user(req),
      memberships = await db("ae_members", "user_id=eq." + filter(u.id)),
      nodes = [];
    for (const m of memberships) {
      const found = await db(
        "ae_nodes",
        "location_id=eq." + filter(m.location_id) + "&enabled=eq.true",
      );
      nodes.push(...found.map((n) => ({ ...n, role: m.role })));
    }
    if (path === "/v1/dashboard") {
      const data = await Promise.all(
        nodes.map(async (n) => ({
          ...n,
          latest:
            (await one("ae_sensor_context", "node_id=eq." + filter(n.id))) ??
            null,
        })),
      );
      send(res, 200, { nodes: data, refreshed_at: new Date().toISOString() });
      return true;
    }
    if (path === "/v1/robots") {
      const robots = [];
      for (const n of nodes)
        robots.push(
          ...(await db(
            "ae_robots",
            "node_id=eq." + filter(n.id) + "&enabled=eq.true",
          )),
        );
      send(res, 200, { robots });
      return true;
    }
    if (path === "/v1/subscriptions") {
      const rows = await db(
          "ae_subscriptions",
          "user_id=eq." + filter(u.id) + "&active=eq.true",
        ),
        ids = new Set(nodes.map((n) => n.id));
      send(res, 200, {
        subscriptions: rows
          .filter((r) => ids.has(r.node_id))
          .map((r) => ({
            node_id: r.node_id,
            phone: r.phone,
            opted_in_at: r.opted_in_at,
          })),
      });
      return true;
    }
    const nodeId = url.searchParams.get("node_id");
    await member(u, nodeId);
    send(res, 200, {
      rules: await db("ae_rules", "node_id=eq." + filter(nodeId)),
    });
    return true;
  };
}
