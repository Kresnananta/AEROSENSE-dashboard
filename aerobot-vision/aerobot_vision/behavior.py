"""Logika kapan robot menyapa. Terpisah dari kamera/model agar mudah diuji."""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


@dataclass
class BehaviorConfig:
    near_ratio: float = 0.45
    center_zone: Tuple[float, float] = (0.25, 0.75)
    dwell_greet: float = 0.8
    dwell_engage: float = 4.0
    global_cooldown: float = 15.0
    track_timeout: float = 2.0
    presence_interval: float = 10.0
    present_hold: float = 1.5     # detik status "ada orang" ditahan (redam kedip saat track hilang sesaat)


@dataclass
class _Track:
    last_seen: float
    near_since: Optional[float] = None
    greeted: bool = False
    greeted_at: float = 0.0
    engaged: bool = False


@dataclass
class Detection:
    track_id: int
    x1: float
    y1: float
    x2: float
    y2: float


class GreetingBehavior:
    """Terima deteksi per frame, kembalikan daftar event yang harus dikirim."""

    def __init__(self, cfg: BehaviorConfig):
        self.cfg = cfg
        self.tracks: Dict[int, _Track] = {}
        self.last_greet = float("-inf")
        self.last_presence = float("-inf")
        # True selama ada orang dekat & di depan robot >= dwell_greet detik.
        # Dipakai sebagai sinyal "presence" untuk robot-display (pengganti/pendamping sensor IR).
        self.present = False
        self._present_until = float("-inf")

    def is_near(self, d: Detection, fw: int, fh: int) -> Tuple[bool, float]:
        h_ratio = (d.y2 - d.y1) / fh
        cx = ((d.x1 + d.x2) / 2) / fw
        lo, hi = self.cfg.center_zone
        return h_ratio >= self.cfg.near_ratio and lo <= cx <= hi, h_ratio

    def update(self, dets: List[Detection], fw: int, fh: int, now: float) -> List[dict]:
        events: List[dict] = []
        present = False
        for d in dets:
            t = self.tracks.setdefault(d.track_id, _Track(last_seen=now))
            t.last_seen = now
            near, h_ratio = self.is_near(d, fw, fh)
            if not near:
                t.near_since = None
                continue
            if t.near_since is None:
                t.near_since = now
            dwell = now - t.near_since
            if dwell >= self.cfg.dwell_greet:
                present = True
            if (not t.greeted and dwell >= self.cfg.dwell_greet
                    and now - self.last_greet >= self.cfg.global_cooldown):
                t.greeted = True
                t.greeted_at = now
                self.last_greet = now
                events.append({"type": "person_greet", "track_id": d.track_id, "ts": now,
                               "people_visible": len(dets), "proximity": round(h_ratio, 2)})
            # Tawaran info dihitung sejak disapa (bukan sejak datang), agar tidak
            # langsung bertubi-tubi jika sapaan tertunda oleh cooldown.
            if (t.greeted and not t.engaged and dwell >= self.cfg.dwell_engage
                    and now - t.greeted_at >= self.cfg.dwell_engage - self.cfg.dwell_greet):
                t.engaged = True
                events.append({"type": "person_engaged", "track_id": d.track_id, "ts": now})

        if present:
            self._present_until = now + self.cfg.present_hold
        self.present = present or now < self._present_until

        # Lupakan orang yang sudah pergi -> kalau kembali nanti boleh disapa lagi
        for tid in [k for k, v in self.tracks.items() if now - v.last_seen > self.cfg.track_timeout]:
            del self.tracks[tid]

        if now - self.last_presence >= self.cfg.presence_interval:
            self.last_presence = now
            events.append({"type": "presence", "people_visible": len(dets), "ts": now})
        return events
