"""
Langkah 1 - Ambil frame dari video kamera robot + pre-label otomatis (person).

Hasil: folder berisi .jpg + label YOLO .txt + data.yaml, siap di-upload ke Roboflow.
Di Roboflow Anda cukup MEREVIEW / MENGOREKSI kotak, bukan menggambar dari nol.

Contoh:
    python scripts/extract_and_prelabel.py --videos "rekaman/train/*.mp4" --out dataset_train
    python scripts/extract_and_prelabel.py --videos "rekaman/test/*.mp4"  --out dataset_test

Catatan:
  * Frame tanpa orang (negative/background) dibatasi oleh --neg-ratio (default 10% dataset).
  * Frame yang hampir sama dengan frame sebelumnya dibuang (--diff).
  * Pisahkan video train dan test (beda hari/sesi), JANGAN acak per frame.
"""
import argparse
import glob
import os
import random

import cv2
import numpy as np


def frame_signature(frame):
    return cv2.cvtColor(cv2.resize(frame, (160, 90)), cv2.COLOR_BGR2GRAY)


def is_duplicate(sig, prev_sig, thresh):
    """True jika frame hampir sama dengan frame terakhir yang disimpan (scene diam)."""
    return prev_sig is not None and float(np.mean(cv2.absdiff(sig, prev_sig))) < thresh


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--videos", nargs="+", required=True, help="path/glob video, mis. 'rekaman/*.mp4'")
    p.add_argument("--out", default="dataset_raw")
    p.add_argument("--every", type=float, default=1.0, help="ambil 1 frame tiap N detik (default 1)")
    p.add_argument("--diff", type=float, default=4.0,
                   help="ambang beda piksel rata-rata (0-255) untuk membuang duplikat; 0 = matikan")
    p.add_argument("--model", default="yolov8x.pt", help="model untuk pre-label (besar = lebih akurat)")
    p.add_argument("--conf", type=float, default=0.35, help="confidence pre-label")
    p.add_argument("--neg-ratio", type=float, default=0.10,
                   help="porsi maksimal frame tanpa orang di dataset akhir (0-0.9). -1 = simpan semua")
    p.add_argument("--no-label", action="store_true", help="hanya ekstrak frame, tanpa pre-label")
    p.add_argument("--seed", type=int, default=0)
    args = p.parse_args()

    files = sorted({f for pat in args.videos for f in glob.glob(pat)})
    if not files:
        raise SystemExit(f"Tidak ada video yang cocok: {args.videos}")
    os.makedirs(args.out, exist_ok=True)

    model = None
    if not args.no_label:
        from ultralytics import YOLO
        model = YOLO(args.model)
        person_cls = [k for k, v in model.names.items() if str(v).lower() == "person"] or [0]

    positives, negatives = [], []
    for vid in files:
        cap = cv2.VideoCapture(vid)
        if not cap.isOpened():
            print(f"[skip] tidak bisa dibuka: {vid}")
            continue
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        step = max(1, int(round(fps * args.every)))
        base = os.path.splitext(os.path.basename(vid))[0]
        idx, prev_sig, n_vid = 0, None, 0

        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if idx % step == 0:
                sig = frame_signature(frame)
                if not is_duplicate(sig, prev_sig, args.diff):
                    prev_sig = sig
                    name = f"{base}_{idx:06d}"
                    cv2.imwrite(os.path.join(args.out, name + ".jpg"), frame)
                    n_vid += 1
                    if model is None:
                        positives.append(name)
                    else:
                        r = model.predict(frame, classes=person_cls, conf=args.conf, verbose=False)[0]
                        lines = [f"0 {x:.6f} {y:.6f} {w:.6f} {h:.6f}"
                                 for x, y, w, h in r.boxes.xywhn.tolist()]
                        # .txt kosong = gambar background (tanpa orang) dalam format YOLO
                        with open(os.path.join(args.out, name + ".txt"), "w") as f:
                            f.write("\n".join(lines))
                        (positives if lines else negatives).append(name)
            idx += 1
        cap.release()
        print(f"{vid}: {n_vid} frame disimpan")

    # Batasi jumlah frame tanpa orang
    removed = 0
    if model is not None and 0 <= args.neg_ratio < 1:
        max_neg = int(round(args.neg_ratio / (1 - args.neg_ratio) * len(positives)))
        if len(negatives) > max_neg:
            random.Random(args.seed).shuffle(negatives)
            for name in negatives[max_neg:]:
                for ext in (".jpg", ".txt"):
                    os.remove(os.path.join(args.out, name + ext))
            removed = len(negatives) - max_neg
            negatives = negatives[:max_neg]

    with open(os.path.join(args.out, "data.yaml"), "w") as f:
        f.write("names:\n  0: person\nnc: 1\n")

    total = len(positives) + len(negatives)
    print("-" * 50)
    print(f"Folder          : {args.out}/")
    print(f"Frame dgn orang : {len(positives)}")
    print(f"Frame tanpa orang (background): {len(negatives)}"
          + (f"  ({removed} dibuang karena --neg-ratio {args.neg_ratio})" if removed else ""))
    if total:
        print(f"Porsi background: {len(negatives) / total:.0%}")
    print("Selanjutnya: upload folder ini ke Roboflow, review semua kotak,")
    print("dan cek frame background (bisa saja ada orang kecil/gelap yang terlewat).")


if __name__ == "__main__":
    main()
