# AERO-BOT physical face

Open this folder in VS Code and press **F5**, or run `node start.mjs` in its terminal. Node 22+ and Chrome/Edge are required. No npm install is needed. A dedicated app window shows only the face.

The screen preserves the mascot's round silhouette. Press **C** to switch between proportional contain and proportional crop-to-fill. Neither stretches it. **Space** wakes/sleeps; **1–6** select neutral, happy, concerned, warning, danger, surprise; **T** thinks; **D** runs a greeting with device speech; **F** toggles fullscreen; **H** temporarily shows keyboard help. Warning recolors the whole mascot yellow; danger recolors it red.

In the VS Code terminal, enter `wake`, `sleep`, `danger`, `say Halo, saya AERO-BOT.`, or `play C:/path/voice.wav | Bahaya. Jauhi area paparan.`. Device speech uses an estimated mouth rhythm because browser speech synthesis does not expose PCM. An actual audio file, robot command, or web audio uses Web Audio RMS; its beak closes during silence. These are distinct modes, not an acoustic-emotion classifier.

## Real AEROSENSE robot connection

Copy `.env.example` to `.env.local` and set the registered robot ID and its device key from the backend operator. Credentials remain in the Node process and are never sent to the face renderer. Restart the program.

The adapter uses the existing `GET /v1/robot/commands`, `GET /v1/robot/audio/{commandId}`, and `POST /v1/robot/ack` contracts, under `https://aerosense.me/api`. It claims commands only while a display is connected. It acknowledges success only after audio finishes; missing audio and playback failures are acknowledged as failed. This first app controls the face and outgoing audio; it does not capture microphone questions. A listen command can show attentive eyes, but is acknowledged as failed rather than falsely claiming microphone capture. Running this adapter consumes commands for that robot: do not run a second consumer with the same device identity.

Expression is selected before audio starts from explicit severity / expression or an inspectable Indonesian/English text heuristic. Danger text overrides the legacy command field `face:happy`. This is response-intent recognition, not diagnosis of a person's feelings from sound. Real human-emotion recognition would require a separate validated model.

## Web companion

The web change adds `/robot-face` and a `Layar wajah` link on the AERO-BOT page. Keep both windows on the **same origin, browser profile, and logged-in session**. Manual and hands-free outgoing audio is mirrored into the face's analyzer silently; the chat retains the audible speaker, so there is no duplicated voice. This change requires publishing the web bundle; it is not present on the existing live site until deployed. A face running at localhost:4210 follows the device API instead, because browser BroadcastChannel cannot cross origins.

## Source

`../public/robot-display/expression.js`: facial intent rules, proportional SVG rig, separate hinged upper/lower beaks. `screen.js`: animation/audio; `start.mjs`: desktop launcher and device adapter. In the portable handoff these files are under `screen/`.

The supplied Illustrator file remains the design reference. `mascot-plate-v2.png` is a rigging plate edited from the supplied mascot head: eyes, brows and the old beak were removed while retaining the blue shell and visor. Its exact imagegen prompt is embedded in the PNG. Editable gradient-filled SVG upper/lower beaks share hinge `(688,918)` with up to `+1.5°` upper and `-12°` lower rotation; a curved cavity appears during speech. No copied raster beak or clipping strip remains. The head plate is raster, with editable SVG facial layers. The regenerated state SVGs use this rig. Static drawing review accepted closed, half-open and open poses with aligned contours and a cavity extending beneath the upper lip; continuous motion, audio and hardware playback require separate evidence.
