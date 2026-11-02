/** Same-origin, opt-in companion window. No credentials or saved recordings are sent. */
let channel: BroadcastChannel | undefined;
export function publishRobotFace(userId: string | undefined, event: {
  action: 'speak' | 'stop' | 'thinking' | 'expression'; text?: string; audio?: Blob; emotion?: string;
}) {
  if (!userId || typeof BroadcastChannel === 'undefined') return;
  try {
    channel ??= new BroadcastChannel('aerosense-robot-face-v1');
    channel.postMessage({ ...event, userId, at: Date.now(), kind: 'aerosense-face', monitorOnly: true });
  } catch { /* An unavailable companion window must never interrupt chat or speech. */ }
}
