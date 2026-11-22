"""
Mode hub: monitor dada mengikuti keputusan bangun/tidur dari robot-display (start.mjs).

start.mjs (AEROBOT_PRESENCE=camera) menerima deteksi kamera lewat POST /presence dan
menyiarkan status di GET /presence/events:
  robot_state {awake}   saat tersambung
  robot_wake            robot bangun   -> monitor dada NYALA
  robot_sleep           robot tidur    -> monitor MATI setelah animasi tidur (display_off_delay_s)
"""
import json
import threading
import time
import urllib.request


class HubFollower:
    def __init__(self, events_url: str, display, display_off_delay_s: float = 6.0,
                 startup_grace_s: float = 300.0, retry_s: float = 2.0):
        self.url = events_url
        self.display = display
        self.delay = display_off_delay_s
        self.grace = startup_grace_s
        self.retry_s = retry_s
        self.awake = None
        self._first = True
        self._timer = None
        self._lock = threading.Lock()
        self._connected = None

    def start(self):
        threading.Thread(target=self._loop, daemon=True).start()
        print(f"[info] Monitor dada mengikuti hub: {self.url}", flush=True)
        return self

    # ---- reaksi terhadap event dari hub ----
    def handle(self, kind: str, data: dict) -> None:
        with self._lock:
            if kind == "robot_state":
                awake = bool(data.get("awake"))
            elif kind == "robot_wake":
                awake = True
            elif kind == "robot_sleep":
                awake = False
            else:
                return
            first, self._first = self._first, False
            if awake == self.awake:
                return
            self.awake = awake
            self._cancel()
            if awake:
                print("[robot] BANGUN (dari hub)", flush=True)
                self.display.on()
                return
            if not getattr(self.display, "controls_power", True):
                print("[robot] TIDUR (dari hub) -> animasi tidur, layar tetap menyala", flush=True)
                return
            # Saat program baru mulai, beri waktu menyiapkan robot sebelum layar mati.
            delay = self.grace if first else self.delay
            print(f"[robot] TIDUR (dari hub) -> monitor mati dalam {delay:.0f} detik", flush=True)
            self._timer = threading.Timer(delay, self._off)
            self._timer.daemon = True
            self._timer.start()

    def _off(self):
        with self._lock:
            if self.awake is False:
                self.display.off()

    def _cancel(self):
        if self._timer:
            self._timer.cancel()
            self._timer = None

    # ---- koneksi SSE ----
    def _loop(self):
        while True:
            try:
                req = urllib.request.Request(self.url, headers={"Accept": "text/event-stream"})
                with urllib.request.urlopen(req, timeout=40) as res:
                    self._status(True)
                    self._read(res)
            except Exception as e:  # noqa: BLE001
                self._status(False, str(getattr(e, "reason", e)))
            time.sleep(self.retry_s)

    def _read(self, res):
        kind, data = "message", []
        for raw in res:
            line = raw.decode("utf-8", "replace").rstrip("\r\n")
            if not line:
                if data:
                    try:
                        self.handle(kind, json.loads("\n".join(data)))
                    except json.JSONDecodeError:
                        pass
                kind, data = "message", []
            elif line.startswith("event:"):
                kind = line[6:].strip()
            elif line.startswith("data:"):
                data.append(line[5:].strip())

    def _status(self, ok: bool, reason: str = ""):
        if ok == self._connected:
            return
        self._connected = ok
        if ok:
            print("[info] Tersambung ke hub robot-display", flush=True)
        else:
            print(f"[warn] Hub robot-display belum bisa dihubungi ({reason}). "
                  "Jalankan `npm start` di robot-display dengan AEROBOT_PRESENCE=camera.", flush=True)
