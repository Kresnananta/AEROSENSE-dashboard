"""
Status bangun/tidur robot + kontrol daya monitor dada (mini PC Windows).

- Ada orang di depan robot (behavior.present) saat robot tidur  -> monitor nyala, event `robot_wake`
  (web dada menyalakan mode suara + menyapa; wajah tablet memutar animasi bangun).
- Tidak ada orang selama `idle_sleep_s` (default 5 menit)       -> event `robot_sleep`
  (wajah memutar animasi tidur, mode suara mati), lalu setelah `display_off_delay_s` monitor mati.

Monitor dimatikan dengan sinyal standby Windows (DPMS); monitor menyala lagi saat robot bangun
atau saat layar disentuh / mouse digerakkan.
"""
import sys
from dataclasses import dataclass


@dataclass
class PowerConfig:
    idle_sleep_s: float = 300.0          # tanpa orang selama ini -> tidur
    display_off_delay_s: float = 6.0     # tunggu animasi tidur selesai sebelum monitor mati
    display_control: str = "auto"        # auto (hanya Windows) | off
    mode: str = "hub"                    # hub: ikuti start.mjs | standalone: putuskan sendiri


class NoDisplayControl:
    """Dipakai di luar Windows atau jika display_control: off. Hanya mencatat."""

    def __init__(self, reason: str = ""):
        self.reason = reason

    def on(self) -> None:
        print(f"[layar] (simulasi) monitor NYALA{self.reason}", flush=True)

    def off(self) -> None:
        print(f"[layar] (simulasi) monitor MATI{self.reason}", flush=True)



class WindowsDisplayControl:
    HWND_BROADCAST = 0xFFFF
    WM_SYSCOMMAND = 0x0112
    SC_MONITORPOWER = 0xF170
    ES_CONTINUOUS = 0x80000000
    ES_SYSTEM_REQUIRED = 0x00000001
    ES_DISPLAY_REQUIRED = 0x00000002
    MOUSEEVENTF_MOVE = 0x0001

    def __init__(self):
        import ctypes  # bawaan Python; memakai user32/kernel32 milik Windows

        self.user32 = ctypes.windll.user32
        self.kernel32 = ctypes.windll.kernel32
        self.hold_system_awake()

    def hold_system_awake(self) -> None:
        """Laptop/mini PC tidak boleh tidur (sleep): kamera harus tetap jalan agar robot bisa
        bangun sendiri saat ada orang. Hanya layar yang dimatikan. Status ini terikat pada thread
        pemanggil, jadi dipanggil sekali dari thread utama yang hidup selama program berjalan."""
        self.kernel32.SetThreadExecutionState(self.ES_CONTINUOUS | self.ES_SYSTEM_REQUIRED)

    def on(self) -> None:
        # SC_MONITORPOWER -1 tidak andal di Windows 10/11; gerakan mouse 1 piksel membangunkan layar.
        self.user32.mouse_event(self.MOUSEEVENTF_MOVE, 0, 1, 0, 0)
        self.user32.mouse_event(self.MOUSEEVENTF_MOVE, 0, -1, 0, 0)
        print("[layar] monitor NYALA", flush=True)

    def off(self) -> None:
        # Hanya layar yang standby; sistem tetap menyala (hold_system_awake).
        # PostMessage (bukan SendMessage) agar tidak menggantung jika ada jendela yang tidak merespons.
        self.user32.PostMessageW(self.HWND_BROADCAST, self.WM_SYSCOMMAND, self.SC_MONITORPOWER, 2)
        print("[layar] monitor MATI (standby)", flush=True)


def make_display_control(mode: str = "auto"):
    if mode == "off":
        return NoDisplayControl(" — display_control: off")
    if sys.platform == "win32":
        try:
            return WindowsDisplayControl()
        except Exception as e:  # noqa: BLE001
            return NoDisplayControl(f" — kontrol Windows gagal: {e}")
    return NoDisplayControl(" — bukan Windows")


class RobotPower:
    def __init__(self, cfg: PowerConfig, display, start: float):
        self.cfg = cfg
        self.display = display
        self.awake = False
        self.last_seen = start
        # Saat program baru mulai: robot tidur, tapi monitor baru dimatikan setelah idle_sleep_s
        # (beri waktu untuk menyiapkan robot / login).
        self.display_off_at = start + cfg.idle_sleep_s

    def state_event(self) -> dict:
        return {"type": "robot_state", "awake": self.awake}

    def update(self, present: bool, now: float) -> list:
        events = []
        if present:
            self.last_seen = now
            if not self.awake:
                self.awake = True
                self.display_off_at = None
                self.display.on()
                events.append({"type": "robot_wake", "greet": True, "ts": now})
                print("[robot] BANGUN: ada orang di depan robot", flush=True)
        elif self.awake and now - self.last_seen >= self.cfg.idle_sleep_s:
            self.awake = False
            self.display_off_at = now + self.cfg.display_off_delay_s
            events.append({"type": "robot_sleep", "ts": now})
            print(f"[robot] TIDUR: tidak ada orang selama {self.cfg.idle_sleep_s:.0f} detik", flush=True)
        if self.display_off_at is not None and not self.awake and now >= self.display_off_at:
            self.display_off_at = None
            self.display.off()
        return events
