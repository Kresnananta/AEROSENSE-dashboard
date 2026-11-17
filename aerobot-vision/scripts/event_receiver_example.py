"""
Contoh penerima event (pengganti sementara sistem utama AEROBOT) untuk uji integrasi.

    python scripts/event_receiver_example.py --port 5000
    # lalu di config.yaml: events.url: http://localhost:5000/vision-event

Di sistem asli, ganti bagian handle_event() dengan pemanggilan TTS / animasi wajah / layar.
"""
import argparse
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

GREETINGS = {
    "person_greet": "Halo! Saya AEROBOT. Mau tahu kondisi udara di sekitar sini?",
    "person_engaged": "Silakan sentuh layar atau tanya saya langsung soal kualitas udara hari ini.",
}


def handle_event(ev: dict) -> None:
    if ev.get("type") in GREETINGS:
        print(f"[ROBOT BICARA] {GREETINGS[ev['type']]}  (track #{ev.get('track_id')})")
    elif ev.get("type") == "presence":
        print(f"[info] orang terlihat: {ev.get('people_visible')}")
    else:
        print(f"[event] {ev}")


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802
        n = int(self.headers.get("Content-Length", 0))
        try:
            handle_event(json.loads(self.rfile.read(n)))
            self.send_response(200)
        except json.JSONDecodeError:
            self.send_response(400)
        self.end_headers()

    def log_message(self, *a):  # matikan log akses bawaan
        pass


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=5000)
    a = p.parse_args()
    print(f"Menunggu event di http://localhost:{a.port}/vision-event ...")
    HTTPServer(("0.0.0.0", a.port), Handler).serve_forever()
