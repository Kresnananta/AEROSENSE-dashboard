#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

broker=aerosense-mqtt
config=/mosquitto/config/mosquitto.conf
baseline=$(git show c3553a0:deploy/mqtt/mosquitto.conf)
installed=$(docker exec "$broker" cat "$config")
if [[ "$installed" != "$baseline" && "$installed" != "$(cat deploy/mqtt/mosquitto.conf)" ]]; then
  echo "Konfigurasi broker berbeda dari versi AEROSENSE. Periksa perubahan lokal sebelum memasang WSS." >&2
  exit 1
fi

docker compose build web
backup=$(mktemp -d)
trap 'rm -f "$backup/mosquitto.conf"; rmdir "$backup"' EXIT
docker cp "$broker:$config" "$backup/mosquitto.conf"
docker cp deploy/mqtt/mosquitto.conf "$broker:/tmp/watersense-mosquitto.conf"
docker exec -u 0 "$broker" sh -se <<'SH'
cd /mosquitto/config
sed '/^n8n-aerosense:/d' passwd > device-passwd.new
test -s device-passwd.new
chown mosquitto:mosquitto device-passwd.new
chmod 0700 device-passwd.new
mv device-passwd.new device-passwd
cat /tmp/watersense-mosquitto.conf > mosquitto.conf
SH

started=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
if ! docker restart "$broker" || ! sleep 2 ||
   ! docker logs --since "$started" "$broker" 2>&1 | grep -F 'Opening websockets listen socket on port 9001'; then
  echo "Listener WSS gagal. Memulihkan konfigurasi MQTT sebelumnya." >&2
  docker cp "$backup/mosquitto.conf" "$broker:$config"
  docker restart "$broker"
  exit 1
fi

docker compose up -d --no-build web
curl --fail --retry 3 --retry-connrefused http://127.0.0.1:8082/api/health
