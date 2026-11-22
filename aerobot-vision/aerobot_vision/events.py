"""Pengirim event ke sistem AEROBOT: SSE (untuk web app), HTTP POST, dan/atau stdout."""
import json
import queue
import threading
import urllib.request


class EventEmitter:
    """Kirim event secara non-blocking agar loop kamera tidak tersendat."""

    def __init__(self, url: str = "", timeout: float = 2.0, sse_port: int = 0,
                 sse_host: str = "127.0.0.1", sse_allow_origin: str = "*", print_events: bool = True):
        self.url = url or ""
        self.timeout = timeout
        self.print_events = print_events
        self._q: "queue.Queue[dict]" = queue.Queue(maxsize=100)
        self.sse = None
        if sse_port:
            from .sse_server import SSEBroadcaster
            self.sse = SSEBroadcaster(sse_host, int(sse_port), sse_allow_origin)
            self.sse.start()
        if self.url:
            threading.Thread(target=self._worker, daemon=True).start()

    def emit(self, event: dict) -> None:
        if self.print_events:
            print(json.dumps(event), flush=True)
        if self.sse:
            self.sse.publish(event)
        if self.url:
            try:
                self._q.put_nowait(event)
            except queue.Full:
                pass  # buang event jika penerima macet, jangan blok kamera

    def _worker(self) -> None:
        while True:
            event = self._q.get()
            try:
                req = urllib.request.Request(
                    self.url, data=json.dumps(event).encode(),
                    headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=self.timeout).close()
            except Exception as e:  # noqa: BLE001
                print(f"[warn] gagal kirim event ke {self.url}: {e}", flush=True)
