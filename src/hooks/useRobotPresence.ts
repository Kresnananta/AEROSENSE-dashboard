import { useEffect, useRef, useState } from "react";
import { presenceCommand, type PresenceCommand } from "@/lib/robot-presence";

export type PresenceLink = "off" | "connecting" | "connected" | "disconnected";

/** Listen to the presence camera on this machine; EventSource reconnects on its own. */
export function useRobotPresence(options: {
  enabled: boolean;
  url: string;
  onCommand: (command: PresenceCommand) => void;
}) {
  const { enabled, url } = options;
  const [link, setLink] = useState<PresenceLink>("off");
  const onCommand = useRef(options.onCommand);
  onCommand.current = options.onCommand;

  useEffect(() => {
    if (!enabled || typeof EventSource === "undefined") {
      setLink("off");
      return;
    }
    setLink("connecting");
    const source = new EventSource(url);
    source.onopen = () => setLink("connected");
    source.onerror = () => setLink("disconnected");
    const handle = (event: MessageEvent<string>) => {
      const command = presenceCommand(event.type, event.data);
      if (command) onCommand.current(command);
    };
    for (const type of ["robot_wake", "robot_sleep", "robot_state"])
      source.addEventListener(type, handle);
    return () => source.close();
  }, [enabled, url]);

  return link;
}
