"""
Server-Sent Events (SSE) kecil untuk menyiarkan event kamera ke web app AERO-BOT.

Browser cukup:  new EventSource("http://127.0.0.1:8765/events")
Tanpa library tambahan (hanya modul bawaan Python).
"""
import json
import queue
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class SSEBroadcaster:
    def __init__(self, host: str = "127.0.0.1", port: int = 8765, allow_origin: str = "*"):
        self.host, self.port, self.allow_origin = host, port, allow_origin
        self._clients = set()
        self._lock = threading.Lock()
        self._sticky = {}   # event terakhir per jenis yang dikirim ulang ke klien baru

    # ---- dipanggil dari loop kamera ----
    def publish(self, event: dict) -> None:
        kind = event.get("type")
        if kind in ("presence", "robot_state"):
            self._sticky[kind] = event
        elif kind in ("robot_wake", "robot_sleep"):
            self._sticky["robot_state"] = {"type": "robot_state", "awake": kind == "robot_wake"}
        data = f"event: {event.get('type', 'message')}\ndata: {json.dumps(event)}\n\n".encode()
        with self._lock:
            for q in list(self._clients):
                try:
                    q.put_nowait(data)
                except queue.Full:
                    pass  # klien lambat: lewati

    def client_count(self) -> int:
        with self._lock:
            return len(self._clients)

    def start(self) -> None:
        broadcaster = self

        class Handler(BaseHTTPRequestHandler):
            def _cors(self):
                self.send_header("Access-Control-Allow-Origin", broadcaster.allow_origin)
                # Chrome "Private/Local Network Access": izinkan halaman dari server lab
                self.send_header("Access-Control-Allow-Private-Network", "true")

            def do_OPTIONS(self):  # noqa: N802
                self.send_response(204)
                self._cors()
                self.send_header("Access-Control-Allow-Methods", "GET")
                self.end_headers()

            def do_GET(self):  # noqa: N802
                if self.path.startswith("/health"):
                    body = json.dumps({"ok": True, "clients": broadcaster.client_count()}).encode()
                    self.send_response(200)
                    self._cors()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(body)
                    return
                if not self.path.startswith("/events"):
                    self.send_response(404)
                    self.end_headers()
                    return
                self.send_response(200)
                self._cors()
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Connection", "keep-alive")
                self.end_headers()
                q = queue.Queue(maxsize=50)
                with broadcaster._lock:
                    broadcaster._clients.add(q)
                try:
                    self.wfile.write(b"retry: 2000\n: connected\n\n")
                    for ev in list(broadcaster._sticky.values()):
                        self.wfile.write(f"event: {ev['type']}\ndata: {json.dumps(ev)}\n\n".encode())
                    self.wfile.flush()
                    while True:
                        try:
                            self.wfile.write(q.get(timeout=15))
                        except queue.Empty:
                            self.wfile.write(b": keepalive\n\n")
                        self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError, OSError):
                    pass
                finally:
                    with broadcaster._lock:
                        broadcaster._clients.discard(q)

            def log_message(self, *a):
                pass

        server = ThreadingHTTPServer((self.host, self.port), Handler)
        server.daemon_threads = True
        threading.Thread(target=server.serve_forever, daemon=True).start()
        print(f"[info] Stream event untuk web app: http://{self.host}:{self.port}/events", flush=True)
