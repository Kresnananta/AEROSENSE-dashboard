"""
Deteksi orang dengan model YOLOv8 ONNX menggunakan OpenCV DNN.
TIDAK membutuhkan PyTorch / Ultralytics saat runtime -> ringan dan aman dari
masalah DLL yang diblokir (Windows Application Control / Smart App Control).

Model ONNX dibuat dengan:  YOLO("best.pt").export(format="onnx", opset=12)
"""
from typing import List, Tuple

import cv2
import numpy as np

Box = Tuple[float, float, float, float]


class OnnxPersonDetector:
    def __init__(self, model_path: str, imgsz: int = 640, conf: float = 0.5,
                 iou: float = 0.45, person_class: int = 0):
        self.net = cv2.dnn.readNetFromONNX(model_path)
        self.imgsz = imgsz
        self.conf = conf
        self.iou = iou
        self.person_class = person_class

    def _letterbox(self, frame):
        h, w = frame.shape[:2]
        r = min(self.imgsz / h, self.imgsz / w)
        nw, nh = int(round(w * r)), int(round(h * r))
        px, py = (self.imgsz - nw) // 2, (self.imgsz - nh) // 2
        canvas = np.full((self.imgsz, self.imgsz, 3), 114, dtype=np.uint8)
        canvas[py:py + nh, px:px + nw] = cv2.resize(frame, (nw, nh))
        return canvas, r, px, py

    def detect(self, frame) -> List[Box]:
        """Kembalikan daftar kotak orang (x1, y1, x2, y2) dalam koordinat frame asli."""
        img, r, px, py = self._letterbox(frame)
        blob = cv2.dnn.blobFromImage(img, 1 / 255.0, (self.imgsz, self.imgsz), swapRB=True)
        self.net.setInput(blob)
        out = self.net.forward()            # (1, 4 + nc, N)
        preds = out[0].T                    # (N, 4 + nc)
        scores = preds[:, 4 + self.person_class]
        keep = scores >= self.conf
        if not np.any(keep):
            return []
        preds, scores = preds[keep], scores[keep]
        cx, cy, bw, bh = preds[:, 0], preds[:, 1], preds[:, 2], preds[:, 3]
        x1 = (cx - bw / 2 - px) / r
        y1 = (cy - bh / 2 - py) / r
        boxes_xywh = np.stack([x1, y1, bw / r, bh / r], axis=1)
        idx = cv2.dnn.NMSBoxes(boxes_xywh.tolist(), scores.tolist(), self.conf, self.iou)
        fh, fw = frame.shape[:2]
        result = []
        for i in np.array(idx).flatten():
            x, y, w, h = boxes_xywh[i]
            result.append((max(0.0, float(x)), max(0.0, float(y)),
                           min(float(fw), float(x + w)), min(float(fh), float(y + h))))
        return result
