"""Uji mode hub: monitor dada mengikuti robot_wake / robot_sleep dari start.mjs."""
import time

from aerobot_vision.hub_follower import HubFollower


class FakeDisplay:
    def __init__(self):
        self.calls = []

    def on(self):
        self.calls.append("on")

    def off(self):
        self.calls.append("off")


def test_startup_sleep_waits_grace_then_wake_and_sleep_follow_hub():
    d = FakeDisplay()
    f = HubFollower("http://127.0.0.1:1/presence/events", d, display_off_delay_s=0.1, startup_grace_s=0.3)
    f.handle("robot_state", {"awake": False})
    time.sleep(0.15)
    assert d.calls == []                      # masih masa tenggang awal
    time.sleep(0.25)
    assert d.calls == ["off"]
    f.handle("robot_wake", {"greet": True})
    f.handle("robot_wake", {"greet": True})   # duplikat diabaikan
    assert d.calls == ["off", "on"]
    f.handle("robot_sleep", {})
    time.sleep(0.2)
    assert d.calls == ["off", "on", "off"]


def test_wake_during_sleep_animation_cancels_display_off():
    d = FakeDisplay()
    f = HubFollower("http://127.0.0.1:1/presence/events", d, display_off_delay_s=0.2, startup_grace_s=0.2)
    f.handle("robot_state", {"awake": True})
    f.handle("robot_sleep", {})
    time.sleep(0.05)
    f.handle("robot_wake", {"greet": True})
    time.sleep(0.3)
    assert d.calls == ["on", "on"]            # tidak pernah dimatikan


def test_reads_server_sent_events():
    import io
    d = FakeDisplay()
    f = HubFollower("x", d, display_off_delay_s=5, startup_grace_s=5)
    stream = io.BytesIO(b'retry: 2000\nevent: robot_state\ndata: {"awake":true}\n\n'
                        b': keepalive\n\nevent: robot_sleep\ndata: {}\n\n')
    f._read(stream)
    assert d.calls == ["on"] and f.awake is False


def test_keep_on_display_never_turns_screens_off():
    from aerobot_vision.robot_power import KeepOnDisplay

    d = KeepOnDisplay(False)
    calls = []
    d.on = lambda: calls.append("on")
    d.off = lambda: calls.append("off")
    f = HubFollower("x", d, display_off_delay_s=0.05, startup_grace_s=0.05)
    f.handle("robot_state", {"awake": False})
    f.handle("robot_wake", {"greet": True})
    f.handle("robot_sleep", {})
    time.sleep(0.15)
    assert "off" not in calls and f.awake is False
