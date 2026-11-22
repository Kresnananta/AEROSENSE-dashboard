"""
Langkah 2 - Fine-tune YOLOv8 dengan dataset dari Roboflow.

Jalankan di mesin ber-GPU (Google Colab / PC NVIDIA), atau pakai notebooks/train_colab.ipynb:
    pip install -r requirements.txt
    export ROBOFLOW_API_KEY=xxxx         # Roboflow > Settings > API Keys
    python scripts/train_roboflow.py --workspace NAMA_WS --project NAMA_PROJECT --version 1

Atau dengan dataset lokal (sudah di-export format YOLOv8):
    python scripts/train_roboflow.py --data path/ke/data.yaml
"""
import argparse
import os
from pathlib import Path

from ultralytics import YOLO


def download_dataset(workspace: str, project: str, version: int) -> str:
    from roboflow import Roboflow
    key = os.environ.get("ROBOFLOW_API_KEY")
    if not key:
        raise SystemExit("Set environment variable ROBOFLOW_API_KEY dulu.")
    ds = Roboflow(api_key=key).workspace(workspace).project(project).version(version).download("yolov8")
    return os.path.join(ds.location, "data.yaml")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--workspace")
    p.add_argument("--project")
    p.add_argument("--version", type=int, default=1)
    p.add_argument("--data", help="pakai data.yaml lokal (lewati download Roboflow)")
    p.add_argument("--model", default="yolov8n.pt", help="yolov8n.pt (ringan) / yolov8s.pt (lebih akurat)")
    p.add_argument("--epochs", type=int, default=100)
    p.add_argument("--imgsz", type=int, default=640)
    p.add_argument("--batch", type=int, default=16)
    p.add_argument("--name", default="aerobot_person")
    p.add_argument("--export", default="onnx",
                   help="onnx (umum) / openvino (mini PC Intel) / engine (Jetson TensorRT) / none")
    args = p.parse_args()

    if args.data:
        data_yaml = args.data
    elif args.workspace and args.project:
        data_yaml = download_dataset(args.workspace, args.project, args.version)
    else:
        raise SystemExit("Berikan --data ATAU --workspace dan --project.")

    # Fine-tune dari bobot COCO (sudah kenal "person"), bukan dari nol
    model = YOLO(args.model)
    results = model.train(data=data_yaml, epochs=args.epochs, imgsz=args.imgsz,
                          batch=args.batch, patience=20, name=args.name, exist_ok=True)
    best_path = Path(results.save_dir) / "weights" / "best.pt"
    best = YOLO(str(best_path))

    # Evaluasi di split test (jika ada) -> ini angka yang paling jujur
    split = "test"
    try:
        metrics = best.val(data=data_yaml, split=split)
    except Exception:  # noqa: BLE001 - dataset tanpa split test
        split = "val"
        metrics = best.val(data=data_yaml, split=split)
    print(f"[{split}] mAP50={metrics.box.map50:.3f}  mAP50-95={metrics.box.map:.3f}  "
          f"precision={metrics.box.mp:.3f}  recall={metrics.box.mr:.3f}")

    if args.export != "none":
        kw = {"opset": 12} if args.export == "onnx" else {}  # opset 12 agar bisa dibaca OpenCV DNN
        out = best.export(format=args.export, imgsz=args.imgsz, **kw)
        print(f"Model hasil export: {out}")
    print(f"Bobot terbaik: {best_path}  -> salin ke folder models/ lalu set di config.yaml")


if __name__ == "__main__":
    main()
