"""Uji logika sapaan tanpa kamera/model:  python -m pytest tests -q"""
from aerobot_vision.behavior import BehaviorConfig, Detection, GreetingBehavior

FW, FH = 1280, 720
NEAR = Detection(1, 540, 100, 740, 700)   # tinggi 600/720 = 0.83, di tengah
FAR = Detection(2, 600, 300, 650, 400)    # kecil / jauh


def types(evs):
    return [e["type"] for e in evs if e["type"] != "presence"]


def test_greet_after_dwell_then_engage():
    b = GreetingBehavior(BehaviorConfig())
    assert types(b.update([NEAR], FW, FH, 0.0)) == []
    assert types(b.update([NEAR], FW, FH, 1.0)) == ["person_greet"]
    assert types(b.update([NEAR], FW, FH, 2.0)) == []          # tidak disapa dua kali
    assert types(b.update([NEAR], FW, FH, 4.5)) == ["person_engaged"]


def test_far_person_not_greeted():
    b = GreetingBehavior(BehaviorConfig())
    for t in range(10):
        assert types(b.update([FAR], FW, FH, float(t))) == []


def test_global_cooldown_between_people():
    b = GreetingBehavior(BehaviorConfig(global_cooldown=15))
    b.update([NEAR], FW, FH, 0.0)
    assert types(b.update([NEAR], FW, FH, 1.0)) == ["person_greet"]
    other = Detection(3, 540, 100, 740, 700)
    b.update([other], FW, FH, 2.0)
    assert types(b.update([other], FW, FH, 5.0)) == []          # masih cooldown
    assert types(b.update([other], FW, FH, 16.5)) == ["person_greet"]


def test_person_returning_is_greeted_again():
    b = GreetingBehavior(BehaviorConfig(global_cooldown=0))
    b.update([NEAR], FW, FH, 0.0)
    assert types(b.update([NEAR], FW, FH, 1.0)) == ["person_greet"]
    b.update([], FW, FH, 5.0)                                    # pergi -> track dihapus
    b.update([NEAR], FW, FH, 6.0)
    assert types(b.update([NEAR], FW, FH, 7.0)) == ["person_greet"]


def test_simple_tracker_keeps_id():
    from aerobot_vision.simple_tracker import SimpleTracker
    t = SimpleTracker()
    a = t.update([(100, 100, 200, 400), (600, 100, 700, 400)])
    b = t.update([(110, 100, 210, 400), (590, 100, 690, 400)])   # bergeser sedikit
    assert [i for i, _ in a] == [i for i, _ in b] == [1, 2]
    c = t.update([(1000, 100, 1100, 400)])                        # orang baru
    assert c[0][0] == 3


def test_present_only_after_dwell_and_clears_when_gone():
    b = GreetingBehavior(BehaviorConfig(dwell_greet=0.8))
    b.update([NEAR], FW, FH, 0.0)
    assert b.present is False              # baru datang, belum cukup lama
    b.update([NEAR], FW, FH, 1.0)
    assert b.present is True
    b.update([FAR], FW, FH, 1.5)
    assert b.present is True               # masih ditahan (present_hold 1.5 dtk)
    b.update([FAR], FW, FH, 2.6)
    assert b.present is False              # orang jauh tidak dihitung
    b.update([], FW, FH, 3.0)
    assert b.present is False
