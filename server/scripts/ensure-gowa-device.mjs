const e = process.env;
try {
  if (!e.GOWA_BASIC_AUTH || !/^[A-Za-z0-9_-]{1,64}$/.test(e.GOWA_DEVICE_ID || ""))
    throw new Error("GOWA configuration incomplete");
  const headers = {
    Authorization: "Basic " + Buffer.from(e.GOWA_BASIC_AUTH).toString("base64"),
    "Content-Type": "application/json",
  };
  async function request(method, body) {
    const r = await fetch(new URL("/devices", e.GOWA_BASE_URL), {
      method, headers, redirect: "error", signal: AbortSignal.timeout(15000),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error("GOWA /devices HTTP " + r.status);
    const data = await r.json();
    if (data.code !== "SUCCESS") throw new Error("GOWA device request rejected");
    return data.results;
  }

  const result = await request("GET");
  const devices = result === null ? [] : result;
  if (!Array.isArray(devices)) throw new Error("Invalid GOWA device list");
  const exists = devices.some(d => d?.id === e.GOWA_DEVICE_ID);
  if (!exists) {
    const created = await request("POST", { device_id: e.GOWA_DEVICE_ID });
    if (created?.id !== e.GOWA_DEVICE_ID) throw new Error("GOWA device creation not confirmed");
  }
  console.log("GOWA device slot ready: " + e.GOWA_DEVICE_ID + (exists ? " (existing)" : " (created)"));
} catch (error) {

  console.error(error instanceof SyntaxError ? "Invalid JSON from GOWA" : error.message);
  process.exitCode = 1;
}
