#!/usr/bin/env python3
"""Forward one AEROSENSE LoRa node to the gateway telemetry API."""

import argparse
import json
import logging
import math
import os
import time
import uuid
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


FIELDS = (
    ("temperature_c", -40, 80),
    ("eco2_ppm", 0, 60000),
    ("tvoc_ppb", 0, 60000),
    ("dust_ug_m3", 0, 10000),
    ("humidity_pct", 0, 100),
)


def parse_frame(raw, radio_node):
    try:
        node, counter, *values = raw.decode("ascii").strip().split(",")
        if node != radio_node or len(values) != len(FIELDS) or not counter.isdecimal():
            return None
        sequence = int(counter)
        if not 0 <= sequence <= 0xFFFFFFFF:
            return None
        metrics = {}
        for (name, minimum, maximum), field in zip(FIELDS, values):
            value = float(field)
            if math.isfinite(value) and minimum <= value <= maximum:
                metrics[name] = value
        return (sequence, metrics) if metrics else None
    except (ValueError, UnicodeDecodeError):
        return None


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def upload(api, gateway, key, payload):
    request = Request(
        api,
        data=json.dumps(payload, allow_nan=False).encode(),
        headers={
            "Content-Type": "application/json",
            "X-Device-Id": gateway,
            "X-Device-Key": key,
        },
        method="POST",
    )
    opener = build_opener(NoRedirect)
    for attempt in range(3):
        try:
            with opener.open(request, timeout=5) as response:
                return response.status == 200
        except HTTPError as error:
            logging.warning("API HTTP %s", error.code)
            if error.code != 429 and error.code < 500:
                return False
        except (URLError, TimeoutError) as error:
            logging.warning("API tidak terjangkau (%s)", type(error).__name__)
        if attempt < 2:
            time.sleep(attempt + 1)
    return False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", required=True)
    parser.add_argument("--baud", type=int, default=9600)
    parser.add_argument("--radio-node", default="NODE_01")
    parser.add_argument("--node-id", default="node-01")
    parser.add_argument("--gateway-id", default="gateway-01")
    parser.add_argument("--api", default="https://aerosense.me/api/v1/telemetry")
    parser.add_argument("--listen-only", action="store_true")
    args = parser.parse_args()
    key = os.environ.get("AEROSENSE_GATEWAY_KEY", "")
    if not args.listen_only and (not key or urlsplit(args.api).scheme != "https"):
        parser.error("Mode upload memerlukan AEROSENSE_GATEWAY_KEY dan URL HTTPS")

    import serial

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    with serial.Serial(args.port, args.baud, timeout=2, write_timeout=1, exclusive=True) as radio:
        logging.info("Mendengarkan %s @ %s, node %s", args.port, args.baud, args.radio_node)
        boot_id, previous, delivered = uuid.uuid4().hex, None, False
        while True:
            raw = radio.read_until(b"\n", size=128)
            if not raw.endswith(b"\n"):
                if len(raw) == 128:
                    radio.read_until(b"\n", size=128)
                continue
            frame = parse_frame(raw, args.radio_node)
            if frame is None:
                continue
            sequence, metrics = frame
            if sequence == previous and delivered:
                continue
            if previous is not None and sequence < previous:
                boot_id = uuid.uuid4().hex
            previous = sequence
            delivered = False
            logging.info("LoRa RX %s #%s %s", args.radio_node, sequence, metrics)
            if args.listen_only:
                delivered = True
                continue
            payload = {
                "node_id": args.node_id,
                "boot_id": boot_id,
                "sequence": sequence,
                "observed_at": datetime.now(timezone.utc).isoformat(),
                "metrics": metrics,
            }
            delivered = upload(args.api, args.gateway_id, key, payload)
            if delivered:
                logging.info("API menerima %s #%s", args.node_id, sequence)


if __name__ == "__main__":
    main()
