import hmac
import json
import os
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path


def serve():
    key = os.environ.get("AEROBOT_LOCAL_TTS_KEY", "")
    if not key:
        raise RuntimeError("Set AEROBOT_LOCAL_TTS_KEY before starting the local service")
    cache = Path(os.environ.get("LOCALAPPDATA", str(Path.home() / ".cache"))) / "Aerosense" / "wibowo"
    cache.mkdir(parents=True, exist_ok=True)
    os.chdir(cache)
    from g2p_id.scripts.tts import g2p, text_normalization, model_file, config_file, download_model_if_not_exists
    from TTS.utils.synthesizer import Synthesizer
    download_model_if_not_exists()
    voice = Synthesizer(tts_checkpoint=model_file, tts_config_path=config_file, use_cuda=False)

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != "/speak" or self.headers.get("Origin"):
                self.send_error(403)
                return
            if not hmac.compare_digest(self.headers.get("X-Local-TTS-Key", ""), key):
                self.send_error(401)
                return
            try:
                size = int(self.headers.get("Content-Length", "0"))
                if size < 1 or size > 16000:
                    raise ValueError("Invalid size")
                text = json.loads(self.rfile.read(size)).get("text")
                if not isinstance(text, str) or not text.strip() or len(text) > 2000:
                    raise ValueError("Invalid text")
                samples = voice.tts(g2p(text_normalization(text)), speaker_name="wibowo")
                with tempfile.TemporaryDirectory() as folder:
                    output = Path(folder) / "speech.wav"
                    voice.save_wav(samples, str(output))
                    audio = output.read_bytes()
            except (ValueError, TypeError, json.JSONDecodeError):
                self.send_error(400)
                return
            except Exception:
                self.send_error(503, "Local speech unavailable")
                return
            self.send_response(200)
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(audio)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(audio)

        def log_message(self, *_args):
            pass

    HTTPServer(("127.0.0.1", 4220), Handler).serve_forever()


if __name__ == "__main__":
    serve()
