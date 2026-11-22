"""
Tracker sederhana berbasis IoU, murni Python/NumPy (tanpa DLL tambahan).
Dipakai otomatis jika ByteTrack (butuh library `lap`) tidak bisa dimuat,
mis. karena diblokir Windows Smart App Control / Application Control policy.
"""
from typing import Dict, List, Tuple

import numpy as np

Box = Tuple[float, float, float, float]


def iou_matrix(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    if len(a) == 0 or len(b) == 0:
        return np.zeros((len(a), len(b)))
    x1 = np.maximum(a[:, None, 0], b[None, :, 0])
    y1 = np.maximum(a[:, None, 1], b[None, :, 1])
    x2 = np.minimum(a[:, None, 2], b[None, :, 2])
    y2 = np.minimum(a[:, None, 3], b[None, :, 3])
    inter = np.clip(x2 - x1, 0, None) * np.clip(y2 - y1, 0, None)
    area_a = (a[:, 2] - a[:, 0]) * (a[:, 3] - a[:, 1])
    area_b = (b[:, 2] - b[:, 0]) * (b[:, 3] - b[:, 1])
    return inter / (area_a[:, None] + area_b[None, :] - inter + 1e-9)


class SimpleTracker:
    def __init__(self, iou_thresh: float = 0.25, max_missed: int = 15):
        self.iou_thresh = iou_thresh
        self.max_missed = max_missed      # frame boleh hilang sebelum ID dilupakan
        self.tracks: Dict[int, Box] = {}
        self.missed: Dict[int, int] = {}
        self.next_id = 1

    def update(self, boxes: List[Box]) -> List[Tuple[int, Box]]:
        ids = list(self.tracks)
        ious = iou_matrix(np.array([self.tracks[i] for i in ids], dtype=float).reshape(-1, 4),
                          np.array(boxes, dtype=float).reshape(-1, 4))
        matched_t, matched_d, out = set(), set(), []
        # pencocokan greedy: pasangan IoU tertinggi lebih dulu
        for flat in np.argsort(-ious, axis=None):
            ti, di = divmod(int(flat), ious.shape[1])
            if ious[ti, di] < self.iou_thresh:
                break
            if ti in matched_t or di in matched_d:
                continue
            matched_t.add(ti)
            matched_d.add(di)
            tid = ids[ti]
            self.tracks[tid], self.missed[tid] = tuple(boxes[di]), 0
            out.append((tid, tuple(boxes[di])))
        for di, box in enumerate(boxes):
            if di not in matched_d:
                tid, self.next_id = self.next_id, self.next_id + 1
                self.tracks[tid], self.missed[tid] = tuple(box), 0
                out.append((tid, tuple(box)))
        for ti, tid in enumerate(ids):
            if ti not in matched_t:
                self.missed[tid] += 1
                if self.missed[tid] > self.max_missed:
                    del self.tracks[tid], self.missed[tid]
        return out
