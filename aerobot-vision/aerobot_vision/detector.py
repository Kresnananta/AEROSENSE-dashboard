"""
Jalankan deteksi + tracking orang dari kamera dan kirim event sapaan.

    python -m aerobot_vision.detector --config config.yaml --show
"""
import argparse
import time

import cv2
import yaml

from .behavior import BehaviorConfig, Detection, GreetingBehavior
from .events import EventEmitter
from .robot_display import RobotDisplayPresence
from .hub_follower import HubFollower
from .robot_power import PowerConfig, RobotPower, make_display_control
from .simple_tracker import SimpleTracker


def bytetrack_available() -> bool:
    """ByteTrack butuh library `lap` (DLL); di sebagian Windows DLL ini diblokir."""
    try:
        import ultralytics.trackers  # noqa: F401  (memicu import lap)
        return True
    except Exception as e:  # noqa: BLE001
        print(f"[info] ByteTrack tidak bisa dimuat ({type(e).__name__}: {e}).")
        return False


def load_config(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def open_source(src):
    src = int(src) if str(src).isdigit() else src
    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        raise SystemExit(f"Kamera/video tidak bisa dibuka: {src}")
    return cap


def main():
    p = argparse.ArgumentParser(description="AEROBOT person detector")
    p.add_argument("--config", default="config.yaml")
    p.add_argument("--source", help="override source di config")
    p.add_argument("--model", help="override model di config")
    p.add_argument("--show", action="store_true", help="tampilkan preview (debug)")
    args = p.parse_args()

    cfg = load_config(args.config)
    model_path = args.model or cfg["model"]
    source = args.source if args.source is not None else cfg["source"]
    beh_cfg = cfg.get("behavior", {})
    if "center_zone" in beh_cfg:
        beh_cfg["center_zone"] = tuple(beh_cfg["center_zone"])
    behavior = GreetingBehavior(BehaviorConfig(**beh_cfg))
    emitter = EventEmitter(**cfg.get("events", {}))
    pw_cfg = PowerConfig(**(cfg.get("robot") or {}))
    display = make_display_control(pw_cfg.display_control)
    rd_cfg = cfg.get("robot_display") or {}
    robot_display = RobotDisplayPresence(**rd_cfg) if rd_cfg.get("url") else None
    power = None
    if pw_cfg.mode == "hub" and robot_display:
        # start.mjs memutuskan bangun/tidur; kamera hanya sensor + pengatur daya monitor.
        hub_events = rd_cfg["url"].rsplit("/presence", 1)[0] + "/presence/events"
        HubFollower(hub_events, display, pw_cfg.display_off_delay_s, pw_cfg.idle_sleep_s).start()
    else:
        power = RobotPower(pw_cfg, display, time.time())
        emitter.emit(power.state_event())

    backend = cfg.get("backend", "auto")
    if backend == "auto":
        backend = "opencv" if str(model_path).lower().endswith(".onnx") else "ultralytics"
    print(f"[info] Backend: {backend}  |  model: {model_path}", flush=True)

    tracker = cfg.get("tracker", "auto")
    simple = None
    onnx_det = model = person_cls = None
    if backend == "opencv":
        # Tanpa PyTorch: OpenCV DNN + SimpleTracker
        from .onnx_detector import OnnxPersonDetector
        onnx_det = OnnxPersonDetector(model_path, imgsz=cfg.get("imgsz", 640),
                                      conf=cfg.get("conf", 0.5))
        simple = SimpleTracker()
    else:
        from ultralytics import YOLO
        model = YOLO(model_path)
        # COCO: class 0 = person. Model custom 1 kelas: class 0 juga person.
        person_cls = [k for k, v in model.names.items() if str(v).lower() == "person"] or [0]

    if simple is not None:
        pass
    elif tracker == "simple" or (tracker in ("auto", "bytetrack.yaml") and not bytetrack_available()):
        print("[info] Memakai SimpleTracker (tanpa DLL).", flush=True)
        simple = SimpleTracker()
    elif tracker == "auto":
        tracker = "bytetrack.yaml"

    cap = open_source(source)
    is_file = not str(source).isdigit() and not str(source).startswith(("rtsp", "http"))
    emitter.emit({"type": "vision_started", "model": model_path, "ts": time.time()})

    fps_t, fps_n, fps = time.time(), 0, 0.0
    # File video diputar dengan kecepatan aslinya agar timer (mis. tidur setelah 5 menit) realistis.
    frame_dt = 1.0 / (cap.get(cv2.CAP_PROP_FPS) or 30) if is_file else 0.0
    next_frame_at = time.time()
    while True:
        if frame_dt:
            delay = next_frame_at - time.time()
            if delay > 0:
                time.sleep(delay)
            next_frame_at = max(next_frame_at + frame_dt, time.time() - 1.0)
        ok, frame = cap.read()
        if not ok:
            if is_file:
                break
            time.sleep(0.1)  # kamera tersendat: coba lagi
            continue
        now = time.time()
        fh, fw = frame.shape[:2]

        common = dict(classes=person_cls, conf=cfg.get("conf", 0.5),
                      imgsz=cfg.get("imgsz", 640), verbose=False)
        dets = []
        if onnx_det is not None:
            for tid, (x1, y1, x2, y2) in simple.update(onnx_det.detect(frame)):
                dets.append(Detection(tid, x1, y1, x2, y2))
        elif simple is not None:
            res = model.predict(frame, **common)[0]
            for tid, (x1, y1, x2, y2) in simple.update(res.boxes.xyxy.tolist()):
                dets.append(Detection(tid, x1, y1, x2, y2))
        else:
            res = model.track(frame, persist=True, tracker=tracker, **common)[0]
        if simple is None and res.boxes is not None and res.boxes.id is not None:
            for (x1, y1, x2, y2), tid in zip(res.boxes.xyxy.tolist(), res.boxes.id.int().tolist()):
                dets.append(Detection(tid, x1, y1, x2, y2))

        for ev in behavior.update(dets, fw, fh, now):
            emitter.emit(ev)
        if robot_display:
            robot_display.update(behavior.present)
        if power:
            for ev in power.update(behavior.present, now):
                emitter.emit(ev)

        if args.show:
            fps_n += 1
            if now - fps_t >= 1:
                fps, fps_n, fps_t = fps_n / (now - fps_t), 0, now
            for d in dets:
                near, ratio = behavior.is_near(d, fw, fh)
                color = (0, 255, 0) if near else (200, 200, 200)
                cv2.rectangle(frame, (int(d.x1), int(d.y1)), (int(d.x2), int(d.y2)), color, 2)
                cv2.putText(frame, f"#{d.track_id} {ratio:.2f}", (int(d.x1), int(d.y1) - 6),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            lo, hi = behavior.cfg.center_zone
            cv2.line(frame, (int(lo * fw), 0), (int(lo * fw), fh), (255, 200, 0), 1)
            cv2.line(frame, (int(hi * fw), 0), (int(hi * fw), fh), (255, 200, 0), 1)
            cv2.putText(frame, f"FPS {fps:.1f}", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            cv2.imshow("AEROBOT vision (q = keluar)", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
