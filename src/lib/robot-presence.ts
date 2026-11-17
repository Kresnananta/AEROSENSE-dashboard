/**
 * Presence from the robot's local hub (robot-display/start.mjs, AEROBOT_PRESENCE=camera) on the
 * mini PC, fed by the camera program (aerobot_vision). The hub serves Server-Sent Events:
 *   robot_wake   {greet: true}  someone stopped in front of the sleeping robot
 *   robot_sleep                 nobody seen for the idle timeout (default 5 minutes)
 *   robot_state  {awake}        sent on (re)connect so a reloaded page resyncs without greeting
 */
export const ROBOT_GREETING = "Halo, saya AERO-BOT. Ada yang bisa saya bantu?";
export const DEFAULT_PRESENCE_URL = "http://127.0.0.1:4210/presence/events";

export type PresenceCommand = { kind: "wake"; greet: boolean } | { kind: "sleep" };

export function presenceCommand(type: string, raw: string): PresenceCommand | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const event = data as { greet?: unknown; awake?: unknown };
  if (type === "robot_wake") return { kind: "wake", greet: event.greet !== false };
  if (type === "robot_sleep") return { kind: "sleep" };
  if (type === "robot_state" && typeof event.awake === "boolean")
    return event.awake ? { kind: "wake", greet: false } : { kind: "sleep" };
  return null;
}

/** Only a local http address on this machine is accepted, never a remote host. */
export function presenceUrl(value: string | null | undefined) {
  if (!value) return DEFAULT_PRESENCE_URL;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname))
      return url.href;
  } catch {
    // fall through to the default
  }
  return DEFAULT_PRESENCE_URL;
}
