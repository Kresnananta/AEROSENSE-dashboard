// Spoken by the chest screen when the presence camera wakes the robot.
export const ROBOT_GREETING = "Halo halo! Aku AERO-BOT. Kalau kamu punya pertanyaan tentang lingkungan, tanya aku ya!";

export const voiceTemplates = new Set([
  ROBOT_GREETING,
  "Maaf, layanan sedang sibuk. Silakan ulangi pertanyaan Anda.",
  "Maaf, suara belum terdengar jelas. Silakan ulangi.",
  "Maaf, belum terdengar jelas. Silakan ulangi.",
  "Pertanyaan belum terkirim. Silakan coba lagi.",
  "Maaf, pertanyaan belum dapat dijawab. Silakan coba lagi.",
  "Jawaban masih diproses. Silakan tanyakan lagi sebentar lagi.",
]);
