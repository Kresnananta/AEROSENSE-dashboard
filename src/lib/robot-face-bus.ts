import { apiRequest } from "@/services/api";

let channel: BroadcastChannel | undefined;
let cloudOwner: string | undefined;
let cloudConnected = false;
let checkedAt = 0;
let queue = Promise.resolve();

export function configureRobotFace(userId: string | undefined, enabled: boolean) {
  cloudOwner = enabled ? userId : undefined;
  cloudConnected = false;
  checkedAt = 0;
}
export function publishRobotFace(
  userId: string | undefined,
  event: {
    action: "speak" | "stop" | "thinking" | "expression";
    text?: string;
    audio?: Blob;
    emotion?: string;
  },
) {
  if (!userId) return;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel ??= new BroadcastChannel("aerosense-robot-face-v1");
      channel.postMessage({
        ...event,
        userId,
        at: Date.now(),
        kind: "aerosense-face",
        monitorOnly: true,
      });
    }
  } catch {
    /* An unavailable companion window must never interrupt chat or speech. */
  }
  if (cloudOwner !== userId) return;
  queue = queue
    .then(async () => {
      if (cloudOwner !== userId) return;
      if (Date.now() - checkedAt > 5000) {
        const status = await apiRequest<{ connected: boolean }>("/v1/robot-face/status");
        cloudConnected = status.connected;
        checkedAt = Date.now();
      }
      if (!cloudConnected || cloudOwner !== userId) return;
      let audioBase64: string | undefined;
      if (event.audio) {
        if (event.audio.size > 1048576) return;
        audioBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(event.audio!);
        });
      }
      if (cloudOwner !== userId) return;
      await apiRequest("/v1/robot-face/events", {
        method: "POST",
        body: JSON.stringify({
          owner_id: userId,
          action: event.action,
          text: event.text,
          emotion: event.emotion,
          audioBase64,
        }),
      });
    })
    .catch(() => {});
}
