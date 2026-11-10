# AEROSENSE handoff

Snapshot taken on 10 November 2026. Use this as orientation and recheck the exact commit, settings, and device state before making changes.

## Source of truth

- GitHub repository `ilanpr/AEROSENSE-dashboard`, integration branch `feat/environment-insights`.
- Verified remote base `1739e4224400922f0fd40a7558de6c8fdf607855`. The handoff branch adds this document, `CLAUDE.md`, and the Raspberry Pi receiver draft. Those three gateway files were previously laptop-only.
- The main Windows checkout was at `224ee51`, 10 commits behind the remote, with 55 tracked or untracked changes. It includes overlapping work in web/API, WATERSENSE firmware, robot display and IR, SQL fixtures, and a generated Graphify graph. These are separate from the tested release. Review changes individually before porting them. Preserve the main checkout and avoid a bulk reset, upload, or merge of its dirty tree.
- Compiled ESP32 images and device packaging are laptop artifacts. Copy an explicitly requested artifact or rebuild from its matching source. Arduino board `esp32:esp32:esp32s3`, validated with Arduino ESP32 core 3.3.12. The AEROSENSE board-specific `config.h` and pairing keys are provisioned locally.
- Separate projects and workspaces include Raspberry Pi/GRU code owned by the team, Remotion presentation assets and render sources, and Figma/Google Docs/Slides materials. Treat them as separate inputs. Their local changes and app sessions are outside this GitHub checkout.

## Architecture and code map

| Area | Entry points | Contract |
|---|---|---|
| Web and design | `src/config/routes.tsx`, `src/pages/`, `src/components/live/`, `src/services/api.ts`, `public/assets/` | React, TypeScript, Vite, Tailwind. Public views cover air status, Hub Lingkungan, map, alerts, and AERO-BOT. Site staff get management and reports subject to API access. |
| Backend and data | `server/api/server.mjs`, `server/api/core.mjs`, `server/supabase/`, `docs/INTEGRATION.md` | Node.js backend, Supabase Auth and PostgreSQL. Telemetry is gateway-authenticated and checked against node ownership. Node registration and operator privileges are site-scoped. Keep telemetry, model outputs, external data, and job state distinct. |
| Hub Lingkungan | `src/pages/environment/`, `n8n/environment-planner.js`, `n8n/environment-normalizer.js`, `server/api/environment-events.mjs`, `docs/ENVIRONMENT_INSIGHTS.md` | Requests use node coordinates, or the configured locality code for BMKG weather. Main paths include Open-Meteo weather, air, soil and river data, FIRMS hotspots, and BMKG earthquake events. ANTARA and GDACS are separate national news/event sources. Preserve source, timestamp, spatial filters, and stale/no-data states. Verify enabled providers from current runtime. |
| Chat, voice, WhatsApp | `src/pages/aerobot/`, `n8n/chat-*.js`, `n8n/chat-*.txt`, `server/GOWA.md`, `docs/LAPTOP-VOICE.md` | Chat jobs combine site sensor and environmental context. Explain what the data means in Indonesian. Preserve source names and times. Web audio and WhatsApp use different delivery paths. Gemini and local Indonesian TTS have been explored. Verify the current engine and quota from runtime before making claims. |
| Physical AERO-BOT | `robot-display/`, `robot-display/screen/`, `src/pages/robot/RobotScreenPage.tsx`, `docs/ROBOT-INTERACTION-N8N.md` | Face display and body screen are separate. Browser/kiosk face is designed for phone or tablet, with audio-linked mouth motion and semantic expressions. Sleep/wake, IR, presence, tips, and local runtime changes span multiple revisions. Check which files and paths are deployed. |
| AEROSENSE sensor and Pi | `firmware/sensor-node/`, `gateway/`, `docs/SENSOR-NODE.md` | ESP32-S3 sends LoRa UART telemetry as CSV. The handoff receiver maps radio ID to backend ID, filters invalid readings, and posts to `/api/v1/telemetry` with gateway credentials. It does not replace the team's GRU pipeline. |
| WATERSENSE | `firmware/watersense-mqtt/`, `src/components/live/SprinklerControl.tsx`, `server/api/actuators.mjs`, `n8n/mist-manual-control.workflow.json`, migrations `012` and `014–016` | Admin registers an actuator against a node. Server separately provisions its MQTT account. Firmware uses the same ID in the configuration portal. Backend enqueues authorized commands, n8n dispatches, and MQTT returns status/ACK. |
| Deployment | `compose.yaml`, `server/compose.yaml`, `deploy/nginx.conf`, `deploy/mqtt/`, `server/scripts/deploy-update.sh`, `server/scripts/deploy-watersense-wss.sh` | Web and API run separately, with broker and n8n on a shared Docker network. Public URL is `https://aerosense.me`. Nginx proxies `/api` and the authenticated `/mqtt` WebSocket. The API checkout and production environment are separately managed. |

## Hardware routes and evidence

1. **Sensor telemetry**. AEROSENSE → LoRa → Raspberry Pi → HTTPS API → Supabase → web. The packaged profile uses `NODE_01` on radio, `node-01` in the API, 9600-baud LoRa UART, and 300-second packets. Confirm the actual port, E220 radio settings, gateway ID, and node assignment on the Pi. The draft receiver was tested on a synthetic CSV and mock HTTP endpoint. The existing Pi receiver and a new live end-to-end LoRa test remain unverified. There is no deployed web-to-WATERSENSE LoRa downlink.
2. **Local automatic actuation**. AEROSENSE → authenticated ESP-NOW → WATERSENSE. One provisioned peer per ESP32 in the current firmware. Registering an association on the web does not pair radios. Pair by MAC and shared key via USB, then load the local profile through the web/MQTT sync or USB. Three fresh dust readings at or above warning can start a configured session. Three at or above danger mark it as danger. Sensor-link expiry is 12 seconds. The physical pair and pump test are outstanding. Latest observed hardware log showed `unpaired`.
3. **Remote actuation**. Web → backend → DB queue → n8n → broker → WATERSENSE, with status and ACK returning. MQTT over WSS uses `aerosense.me:443/mqtt`. The public endpoint returned a WebSocket upgrade and rejected an unauthenticated MQTT CONNECT. The flashed `mist-01` logged `WATERSENSE MQTT terhubung (WSS)` and the old laptop tunnel no longer had an ESP32 session. This proves the broker link. Verify dashboard status, commands, and physical output separately. Earlier laptop relay was a temporary route only.
4. **Actuator safeguards**. WATERSENSE uses GPIO 4 active-HIGH for the pump, GPIO 1 for battery sensing, and GPIO 21 for the physical button. Sessions are 30, 45, or 60 minutes total, with 120-second bursts and 3-second pauses. The physical button starts a short 10-second run when permitted and stops an active run. Remote sessions stop on loss of Wi-Fi/MQTT. Local sessions depend on fresh ESP-NOW data. Logs on USB showed battery below the ready threshold. Preserve all interlocks.

## Changes already landed

- `8aa4b10` updated timed session bursts to two minutes. Migration `015` handles session duration.
- `c3553a0` added paired ESP-NOW readings, profiles, and suppression of duplicate cloud automatic dispatch. Migration `016` adds the profile fields. Verify migration state when testing a live instance.
- `5fbcb40` added Mosquitto’s Docker-only WebSocket listener and nginx routing. `0c32360` added certificate-verified WSS firmware, while retaining LAN MQTT and the no-jumper setup portal. New settings use port 443 with the domain only in the broker field.
- `4252106` improved startup checks, `940d2b9` fixed passing the broker initialization script into Docker, and `1739e42` added a retry for the web health check during startup.
- Adding a new sprinkler requires its web/DB record, a broker user with the same unique ID, then device provisioning. Do not reuse an active ID on another device. Do not rotate unrelated accounts when adding one.

## Local and cloud checks

```bash
corepack enable
pnpm install --frozen-lockfile
npm ci --prefix server
pnpm test
pnpm lint
pnpm build
```

For UI work, use `node server/tests/preview.mjs` and `API_PROXY_TARGET=http://127.0.0.1:8081 pnpm dev --host 127.0.0.1`. The fixture account is `preview@example.test` with `fixture-password`. It is local synthetic data. Use `pnpm demo:build` and `pnpm demo:serve` for the film fixture if needed. Never send synthetic readings to production.

For gateway onboarding, run the receiver with `--listen-only` first and wait for a real LoRa line. Use `gateway/gateway.env.example` with the Pi’s actual serial device and a locally provided gateway key. Verify that an accepted API reading appears at the same node and time in the dashboard before enabling a persistent service. Avoid running two serial readers on the same port.

For deployment, check revision and available disk first. A previous web image built successfully while Compose failed writing metadata due to a full disk. Check image/container state and health separately. Preserve broker data, existing credentials, and volumes. Production operations and hardware validation are local/operator tasks. A cloud test run can validate source and fixtures.

## Collaboration checkpoint

- Start a new branch from the current integration commit for each task. A sensible split is Claude for independent code review, test coverage, or scoped web/backend changes, and Codex for Windows USB, physical devices, local assets, or coordinated deployment.
- Before opening a PR, record base and head SHAs, scope, files, commands run, exact results, what remains unverified, and any local-only artifacts. Merge only after the user or assigned operator reviews it.
- Good first review targets include validating current MQTT/ESP-NOW arbitration and confirming the Pi draft’s CSV/API contract. A LoRa return path, multiple ESP-NOW peers, or changes to the GRU are distinct tasks. Do not treat them as completed.
