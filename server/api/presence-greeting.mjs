import { cleanText } from "./core.mjs";

// Sent by the robot's chest screen when the presence camera wakes the robot. The text is fixed
// here on the server so a browser can trigger the greeting but never choose its instruction.
// Gemini (n8n "Jawaban website") answers it with the latest sensor and weather context, and the
// chest screen speaks the answer with the same /aerobot voice.
export const PRESENCE_GREETING_PROMPT =
  "Sapa pengunjung yang baru datang ke AERO-BOT dengan ramah. Sampaikan singkat kondisi lingkungan sekitar hari ini, yaitu kualitas udara dan cuaca terbaru, lalu tawarkan bantuan. Paling banyak tiga kalimat pendek.";

/** Text and job fields for a chat request; `presence: true` asks for the greeting. */
export function chatRequest(p, fallback) {
  if (p.presence === true) return { text: PRESENCE_GREETING_PROMPT, presence: true, voice: true };
  return { text: cleanText(p.text || fallback), voice: p.voice === true };
}
