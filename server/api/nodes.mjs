import { canManage } from "./access.mjs";

const idPattern = /^[a-zA-Z0-9_-]{1,40}$/;
const fail = (message, status = 400) => Object.assign(new Error(message), { status });

export function nodeRoutes({ db, user, send, filter, rawBody, rate, devices }) {
  return async (req, res, url) => {
    const options = url.pathname === "/v1/nodes/registration";
    const create = url.pathname === "/v1/nodes" && req.method === "POST";
    const edit = req.method === "PATCH" && url.pathname.match(/^\/v1\/nodes\/([a-zA-Z0-9_-]{1,40})$/);
    if (!options && !create && !edit) return false;
    if (options && req.method !== "GET") throw fail("Metode tidak diizinkan.", 405);
    const account = await user(req);
    const memberships = (await db("ae_members", "user_id=eq." + filter(account.id))).filter((m) =>
      canManage(m.role),
    );
    if (!memberships.length) throw fail("Hanya pengelola lokasi yang dapat menambah node.", 403);
    const gateways = Object.entries(devices)
      .filter(([, d]) => d.type === "gateway")
      .map(([id]) => id);
    if (options) {
      const nodes = await db(
        "ae_nodes",
        "select=id,name,location_id,latitude,longitude,public_read&order=name&location_id=in.(" +
          memberships.map((m) => filter(m.location_id)).join(",") +
          ")",
      );
      send(res, 200, {
        locations: memberships.map((m) => ({
          id: m.location_id,
          name: nodes.find((n) => n.location_id === m.location_id)?.name || m.location_id,
          can_publish: m.role === "admin",
        })),
        gateways,
        nodes,
      });
      return true;
    }
    if (edit) {
      rate("node-edit:" + account.id, 30);
      const query = "id=eq." + filter(edit[1]);
      const [node] = await db("ae_nodes", query + "&select=location_id,public_read&limit=1");
      const membership = memberships.find((m) => m.location_id === node?.location_id);
      if (!membership) throw fail("Anda tidak dapat mengubah node ini.", 403);
      const p = JSON.parse(await rawBody(req, 4000));
      const name = typeof p?.name === "string" ? p.name.trim() : "";
      if (!name || name.length > 100 ||
          !Number.isFinite(p.latitude) || Math.abs(p.latitude) > 90 ||
          !Number.isFinite(p.longitude) || Math.abs(p.longitude) > 180 ||
          (p.public_read !== undefined && typeof p.public_read !== "boolean"))
        throw fail("Periksa nama dan koordinat sensor.");
      if (p.public_read !== undefined && membership.role !== "admin")
        throw fail("Publikasi lokasi hanya dapat diubah admin.", 403);
      const [updated] = await db("ae_nodes", query + "&location_id=eq." + filter(node.location_id), "PATCH", {
        name,
        latitude: p.latitude,
        longitude: p.longitude,
        ...(p.public_read === undefined ? {} : { public_read: p.public_read }),
      });
      if (!updated) throw fail("Sensor berubah. Muat ulang sebelum menyimpan.", 409);
      send(res, 200, { node: updated });
      return true;
    }
    rate("node-create:" + account.id, 12);
    const p = JSON.parse((await rawBody(req, 4000)).toString());
    const membership = memberships.find((m) => m.location_id === p?.location_id);
    if (!membership) throw fail("Anda tidak dapat menambah node pada lokasi ini.", 403);
    if (
      typeof p.id !== "string" ||
      !idPattern.test(p.id) ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      p.name.trim().length > 100 ||
      !gateways.includes(p.gateway_id) ||
      !Number.isFinite(p.latitude) ||
      p.latitude < -90 ||
      p.latitude > 90 ||
      !Number.isFinite(p.longitude) ||
      p.longitude < -180 ||
      p.longitude > 180 ||
      typeof p.public_read !== "boolean"
    )
      throw fail("Periksa identitas, gateway, dan koordinat node.");
    if (p.public_read && membership.role !== "admin")
      throw fail("Publikasi lokasi hanya dapat dilakukan admin.", 403);
    let rows;
    try {
      rows = await db("ae_nodes", "", "POST", {
        id: p.id,
        name: p.name.trim(),
        location_id: membership.location_id,
        gateway_id: p.gateway_id,
        latitude: p.latitude,
        longitude: p.longitude,
        enabled: true,
        public_read: p.public_read,
        pm25_validated: false,
      });
    } catch (error) {
      if (error.status === 409) throw fail("ID node sudah digunakan. Pilih ID lain.", 409);
      throw error;
    }
    send(res, 201, { node: rows[0] });
    return true;
  };
}
