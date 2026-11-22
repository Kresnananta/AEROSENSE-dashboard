Taruh file model di sini (tidak disimpan di git).
- `yolov8n.pt` (model bawaan COCO) otomatis terunduh saat program pertama kali dijalankan.
- Alternatif tanpa PyTorch: export ONNX dengan
  `python -c "from ultralytics import YOLO; YOLO('yolov8n.pt').export(format='onnx', opset=12)"`
  lalu set `model: models/yolov8n.onnx` di `config.yaml`.
- Setelah fine-tune, salin `best.pt` / `best.onnx` ke folder ini dan ubah `model:` di `config.yaml`.
