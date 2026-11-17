import test from "node:test";
import assert from "node:assert/strict";
import { ROBOT_GREETING as SERVER_GREETING } from "../api/voice-templates.mjs";
import {
  DEFAULT_PRESENCE_URL,
  presenceCommand,
  presenceUrl,
  ROBOT_GREETING,
} from "../../src/lib/robot-presence.ts";

test("camera presence events map to wake (with or without greeting) and sleep", () => {
  assert.deepEqual(presenceCommand("robot_wake", '{"greet":true}'), { kind: "wake", greet: true });
  assert.deepEqual(presenceCommand("robot_wake", "{}"), { kind: "wake", greet: true });
  assert.deepEqual(presenceCommand("robot_sleep", "{}"), { kind: "sleep" });
  // A reloaded page resyncs without greeting the visitor a second time.
  assert.deepEqual(presenceCommand("robot_state", '{"awake":true}'), {
    kind: "wake",
    greet: false,
  });
  assert.deepEqual(presenceCommand("robot_state", '{"awake":false}'), { kind: "sleep" });
  assert.equal(presenceCommand("robot_state", "{}"), null);
  assert.equal(presenceCommand("person_greet", "{}"), null);
  assert.equal(presenceCommand("robot_wake", "not json"), null);
});

test("presence stream must stay on this machine", () => {
  assert.equal(presenceUrl(null), DEFAULT_PRESENCE_URL);
  assert.equal(presenceUrl("http://127.0.0.1:9000/events"), "http://127.0.0.1:9000/events");
  assert.equal(DEFAULT_PRESENCE_URL, "http://127.0.0.1:4210/presence/events");
  assert.equal(presenceUrl("http://localhost:8765/events"), "http://localhost:8765/events");
  assert.equal(presenceUrl("https://evil.example/events"), DEFAULT_PRESENCE_URL);
  assert.equal(presenceUrl("http://192.168.1.5:8765/events"), DEFAULT_PRESENCE_URL);
  assert.equal(presenceUrl("javascript:alert(1)"), DEFAULT_PRESENCE_URL);
});

test("the greeting the browser speaks is the one the voice service allows", () => {
  assert.equal(ROBOT_GREETING, SERVER_GREETING);
});
