"""Uji bangun/tidur robot dan kontrol monitor tanpa kamera/Windows asli."""
from aerobot_vision.robot_power import PowerConfig, RobotPower, WindowsDisplayControl


class FakeDisplay:
    def __init__(self):
        self.calls = []

    def on(self):
        self.calls.append("on")

    def off(self):
        self.calls.append("off")

    def keep_awake(self, awake):
        pass


def types(evs):
    return [e["type"] for e in evs]


def test_wake_on_person_then_sleep_after_idle_and_display_off_after_animation():
    d = FakeDisplay()
    p = RobotPower(PowerConfig(idle_sleep_s=300, display_off_delay_s=6), d, start=0)
    assert p.state_event() == {"type": "robot_state", "awake": False}
    ev = p.update(True, 10)
    assert types(ev) == ["robot_wake"] and ev[0]["greet"] is True
    assert d.calls == ["on"]
    assert types(p.update(True, 11)) == []                 # bangun sekali saja
    assert types(p.update(False, 200)) == []
    assert types(p.update(False, 310)) == []               # baru 299 dtk sejak terakhir terlihat
    assert types(p.update(False, 311)) == ["robot_sleep"]
    assert d.calls == ["on"]                               # monitor menunggu animasi tidur
    p.update(False, 316)
    assert d.calls == ["on"]
    p.update(False, 317)
    assert d.calls == ["on", "off"]
    p.update(False, 400)
    assert d.calls == ["on", "off"]                        # tidak dimatikan berulang


def test_person_returning_during_sleep_animation_cancels_display_off():
    d = FakeDisplay()
    p = RobotPower(PowerConfig(idle_sleep_s=60, display_off_delay_s=6), d, start=0)
    p.update(True, 1)
    assert types(p.update(False, 61)) == ["robot_sleep"]
    assert types(p.update(True, 63)) == ["robot_wake"]     # kembali sebelum monitor mati
    p.update(True, 80)
    assert d.calls == ["on", "on"]


def test_person_seen_keeps_robot_awake():
    d = FakeDisplay()
    p = RobotPower(PowerConfig(idle_sleep_s=60), d, start=0)
    p.update(True, 0)
    for t in range(1, 600, 30):
        assert types(p.update(t % 60 == 31, t)) == []      # terlihat sesekali -> tetap bangun
    assert p.awake


def test_startup_turns_display_off_only_after_idle_window():
    d = FakeDisplay()
    p = RobotPower(PowerConfig(idle_sleep_s=300), d, start=0)
    p.update(False, 299)
    assert d.calls == []
    p.update(False, 300)
    assert d.calls == ["off"]


class _Recorder:
    def __init__(self, log, name):
        self.log, self.name = log, name

    def __getattr__(self, fn):
        return lambda *args: self.log.append((self.name, fn, args))


def test_windows_calls_monitor_standby_and_wake_nudge():
    log = []
    w = WindowsDisplayControl.__new__(WindowsDisplayControl)
    w.user32, w.kernel32 = _Recorder(log, "user32"), _Recorder(log, "kernel32")
    w.off()
    assert ("user32", "PostMessageW", (0xFFFF, 0x0112, 0xF170, 2)) in log
    assert ("kernel32", "SetThreadExecutionState", (0x80000000,)) in log
    log.clear()
    w.on()
    assert [c[1] for c in log] == ["mouse_event", "mouse_event", "SetThreadExecutionState"]
    assert log[2][2] == (0x80000000 | 0x2 | 0x1,)
