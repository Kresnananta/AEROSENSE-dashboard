"""
Kirim status "ada orang di depan robot" ke robot-display (start.mjs) di mini PC.

robot-display memperlakukan kamera seperti sensor IR: saat robot tidur dan ada orang,
wajah bangun dan event `presence` dikirim ke AEROSENSE API -> n8n -> sapaan suara.
Logika bangun/tidur dan jeda sapaan tetap di robot-display dan n8n.
"""
import json
import threading
import time
import urllib.error
import urllib.request


class RobotDisplayPresence:
    def __init__(self, url: str = "http://127.0.0.1:4210/presence", interval: float = 0.5,
                 timeout: float = 1.0):
        self.url = url
        self.interval = interval
        self.timeout = timeout
        self._detected = False
        self._changed = threading.Event()
        self._last_error = None
        threading.Thread(target=self._loop, daemon=True).start()
        print(f"[info] Presence ke robot-display: {url}", flush=True)

    def update(self, detected: bool) -> None:
        detected = bool(detected)
        if detected != self._detected:
            self._detected = detected
            self._changed.set()  # kirim segera saat berubah

    def _send(self, detected: bool) -> None:
        req = urllib.request.Request(self.url, data=json.dumps({"detected": detected}).encode(),
                                     headers={"Content-Type": "application/json"}, method="POST")
        try:
            urllib.request.urlopen(req, timeout=self.timeout).close()
            if self._last_error:
                print("[info] robot-display terhubung kembali", flush=True)
            self._last_error = None
        except (urllib.error.URLError, OSError) as e:
            msg = str(getattr(e, "reason", e))
            if msg != self._last_error:  # jangan banjiri terminal dengan error yang sama
                print(f"[warn] robot-display tidak bisa dihubungi ({msg}). "
                      "Pastikan `npm start` di robot-display berjalan.", flush=True)
            self._last_error = msg

    def _loop(self) -> None:
        while True:
            self._changed.wait(self.interval)
            self._changed.clear()
            self._send(self._detected)
