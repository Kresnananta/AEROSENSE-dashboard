import { readFile } from "node:fs/promises";
import path from "node:path";

function arg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length).trim() : "";
}

async function loadEnv() {
  for (const candidate of [
    path.resolve("server/.env"),
    path.resolve(".env"),
    path.resolve(".env.local"),
  ]) {
    try {
      const raw = await readFile(candidate, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const clean = line.trim();
        if (!clean || clean.startsWith("#")) continue;
        const eq = clean.indexOf("=");
        if (eq <= 0) continue;
        const k = clean.slice(0, eq).trim();
        const v = clean.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!(k in process.env)) process.env[k] = v;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

await loadEnv();

const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const email = (arg("email") || process.env.ROBOT_ACCOUNT_EMAIL || "").toLowerCase();
const password = arg("password") || process.env.ROBOT_ACCOUNT_PASSWORD || "";
const locationId = arg("location") || process.env.ROBOT_LOCATION_ID || "";
const fullName = arg("name") || process.env.ROBOT_ACCOUNT_NAME || "AERO-BOT Fisik";

if (!supabaseUrl || !serviceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}
if (!email || !password || password.length < 8) {
  console.error("Provide --email=... and --password=... (min 8 chars) or ROBOT_ACCOUNT_EMAIL/ROBOT_ACCOUNT_PASSWORD.");
  process.exit(1);
}
if (!/^[a-zA-Z0-9_-]{2,40}$/.test(locationId)) {
  console.error("Provide --location=... (2-40 chars [a-zA-Z0-9_-]) or ROBOT_LOCATION_ID.");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function api(p, options = {}) {
  const res = await fetch(supabaseUrl + p, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${res.status} ${p}: ${text}`);
  return body;
}

const list = await api(`/auth/v1/admin/users?page=1&per_page=200`);
let user = (list?.users || []).find((u) => String(u.email || "").toLowerCase() === email);

if (!user) {
  user = await api(`/auth/v1/admin/users`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: fullName, account_type: "robot" },
    }),
  });
} else {
  user = await api(`/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
    method: "PUT",
    body: JSON.stringify({
      password,
      email_confirm: true,
      user_metadata: { ...(user.user_metadata || {}), name: fullName, account_type: "robot" },
    }),
  });
}

await api(`/rest/v1/ae_profiles?on_conflict=user_id`, {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify({
    user_id: user.id,
    email,
    full_name: fullName,
    organization: "AERO-BOT Fisik",
  }),
});

await api(`/rest/v1/ae_members?on_conflict=user_id,location_id`, {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify({
    user_id: user.id,
    location_id: locationId,
    role: "robot",
  }),
});

console.log(JSON.stringify({ ok: true, user_id: user.id, email, location_id: locationId, role: "robot" }));
