/*
 * AERO-BOT Vision client: sambungkan web app ke kamera (aerobot_vision) di mini PC.
 *
 * Pemakaian di web app:
 *   <script src="aerobot-vision-client.js"></script>
 *   <script>
 *     AerobotVision.connect({
 *       url: "http://127.0.0.1:8765/events",
 *       greetingAudioUrl: "/audio/greeting.wav",     // opsional: audio Gemini TTS (suara Kore)
 *       greetingText: "Halo, saya AERO-BOT. Ada yang bisa saya bantu?",
 *       isBusy: () => robot.state !== "sleep",        // jangan menyapa saat robot sedang menjawab
 *       onFace: (expr) => face.setExpression(expr),   // "waking" | "happy" | ...
 *       onGreetDone: () => robot.startListening(),    // lanjut ke alur tanya-jawab yang sudah ada
 *       onEngaged: (ev) => mainScreen.showAirQuality(),
 *       onPresence: (ev) => console.log("orang terlihat:", ev.people_visible),
 *       onConnection: (ok) => console.log("kamera", ok ? "terhubung" : "terputus"),
 *     });
 *   </script>
 *
 * Catatan autoplay: browser memblokir suara sebelum ada interaksi pengguna.
 * Klien ini otomatis "membuka" audio pada klik/sentuhan pertama. Untuk mode kiosk,
 * jalankan Chrome dengan:  --autoplay-policy=no-user-gesture-required
 */
(function (global) {
  "use strict";

  let audioUnlocked = false;
  let speaking = false;
  let greetAudio = null;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      const ctx = new (global.AudioContext || global.webkitAudioContext)();
      ctx.resume().then(() => ctx.close());
    } catch (_) { /* abaikan */ }
    if (greetAudio) greetAudio.load();
    if (global.speechSynthesis) global.speechSynthesis.getVoices();
  }
  ["pointerdown", "keydown", "touchstart"].forEach((t) =>
    global.addEventListener(t, unlockAudio, { once: true, passive: true }));

  function speakWithBrowserTTS(text, lang) {
    return new Promise((resolve) => {
      if (!global.speechSynthesis) return resolve(false);
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const voice = global.speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith(lang.slice(0, 2)));
      if (voice) u.voice = voice;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      global.speechSynthesis.speak(u);
    });
  }

  function playAudio(audio) {
    return new Promise((resolve) => {
      audio.currentTime = 0;
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.play().catch(() => resolve(false));   // gagal jika autoplay masih diblokir
    });
  }

  async function greet(opts, ev) {
    if (speaking) return;
    if (opts.isBusy && opts.isBusy()) return;      // robot sedang bicara/menjawab
    speaking = true;
    try {
      opts.onFace && opts.onFace("waking", ev);
      await new Promise((r) => setTimeout(r, opts.wakeDelayMs));
      opts.onFace && opts.onFace("happy", ev);
      opts.onGreet && opts.onGreet(ev);
      let ok = false;
      if (greetAudio) ok = await playAudio(greetAudio);
      if (!ok) ok = await speakWithBrowserTTS(opts.greetingText, opts.lang);
      if (!ok) console.warn("[AerobotVision] suara tidak bisa diputar (klik halaman sekali untuk mengizinkan audio)");
      opts.onGreetDone && opts.onGreetDone(ev);
    } finally {
      speaking = false;
    }
  }

  function connect(userOpts) {
    const opts = Object.assign({
      url: "http://127.0.0.1:8765/events",
      greetingAudioUrl: "",
      greetingText: "Halo, saya AERO-BOT. Ada yang bisa saya bantu?",
      lang: "id-ID",
      wakeDelayMs: 800,
    }, userOpts || {});
    if (opts.greetingAudioUrl) {
      greetAudio = new Audio(opts.greetingAudioUrl);
      greetAudio.preload = "auto";
    }
    const es = new EventSource(opts.url);
    const parse = (e) => { try { return JSON.parse(e.data); } catch (_) { return {}; } };
    es.onopen = () => opts.onConnection && opts.onConnection(true);
    es.onerror = () => opts.onConnection && opts.onConnection(false);  // EventSource reconnect otomatis
    es.addEventListener("person_greet", (e) => greet(opts, parse(e)));
    es.addEventListener("person_engaged", (e) => opts.onEngaged && opts.onEngaged(parse(e)));
    es.addEventListener("presence", (e) => opts.onPresence && opts.onPresence(parse(e)));
    return { close: () => es.close(), greetNow: () => greet(opts, { type: "manual" }) };
  }

  global.AerobotVision = { connect, unlockAudio };
})(window);
