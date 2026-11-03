import { canManage } from "./access.mjs";

export function robotFaceRelay({ user, db, filter, rawBody, send, rate }) {
  const screens = new Map();
  const fail = (message, status) => Object.assign(new Error(message), { status });
  async function authorize(req) {
    const account = await user(req);
    const roles = await db("ae_members", "user_id=eq." + filter(account.id));
    if (!roles.some((row) => canManage(row.role)))
      throw fail("Layar robot hanya tersedia untuk pengelola kawasan dan admin.", 403);
    return account;
  }
  return async (req, res, url) => {
    if (!["/v1/robot-face/events", "/v1/robot-face/status"].includes(url.pathname)) return false;
    const account = await authorize(req);
    const clients = screens.get(account.id) || new Set();
    rate("face:" + account.id, 180);
    if (req.method === "GET" && url.pathname.endsWith("/status")) {
      send(res, 200, { connected: clients.size > 0 });
      return true;
    }
    if (url.pathname.endsWith("/status")) throw fail("Metode tidak didukung.", 405);
    if (req.method === "POST") {
      const body = JSON.parse(await rawBody(req, 1600000));
      if (body.owner_id !== account.id) throw fail("Akun pengirim tidak sesuai.", 403);
      if (!["thinking", "expression", "speak", "stop"].includes(body.action))
        throw fail("Event wajah tidak valid.", 400);
      if (
        typeof body.text !== "undefined" &&
        (typeof body.text !== "string" || body.text.length > 4000)
      )
        throw fail("Teks wajah tidak valid.", 400);
      const event = { action: body.action, text: body.text || "", monitorOnly: true };
      if (
        ["neutral", "happy", "concerned", "warning", "danger", "surprised"].includes(body.emotion)
      )
        event.emotion = body.emotion;
      if (body.audioBase64 !== undefined) {
        if (
          body.action !== "speak" ||
          typeof body.audioBase64 !== "string" ||
          body.audioBase64.length > 1400000 ||
          !/^[A-Za-z0-9+/]+={0,2}$/.test(body.audioBase64)
        )
          throw fail("Audio wajah tidak valid.", 400);
        const audio = Buffer.from(body.audioBase64, "base64");
        if (audio.toString("ascii", 0, 4) !== "RIFF" || audio.toString("ascii", 8, 12) !== "WAVE")
          throw fail("Audio wajah harus berupa WAV.", 400);
        event.audioBase64 = body.audioBase64;
        event.mime = "audio/wav";
      }
      const packet = `data: ${JSON.stringify(event)}\n\n`;
      for (const screen of clients) {
        if (screen.writableLength > 2000000) screen.end();
        else screen.write(packet);
      }
      send(res, 202, { screens: clients.size });
      return true;
    }
    if (req.method !== "GET") throw fail("Metode tidak didukung.", 405);
    if (clients.size >= 2 || [...screens.values()].reduce((n, group) => n + group.size, 0) >= 16)
      throw fail("Batas layar aktif tercapai.", 429);
    screens.set(account.id, clients);
    clients.add(res);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    });
    res.write(": connected\n\n");
    const heartbeat = setInterval(() => res.write(": keepalive\n\n"), 15000);
    const permission = setInterval(() => {
      void authorize(req).catch(() => res.end());
    }, 60000);
    res.on("close", () => {
      clearInterval(heartbeat);
      clearInterval(permission);
      clients.delete(res);
      if (!clients.size) screens.delete(account.id);
    });
    return true;
  };
}
