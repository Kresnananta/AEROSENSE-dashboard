import { Radio, CloudSun, Newspaper } from "lucide-react";

const sources = [
  { icon: Radio, title: "Sensor AEROSENSE" },
  { icon: CloudSun, title: "Kondisi wilayah" },
  { icon: Newspaper, title: "Berita bencana" },
];

export function ChatSide() {
  return (
    <section className="chat-source-panel">
      <h2 className="mb-4 text-sm font-semibold text-[#25405f]">Sumber jawaban</h2>
      <ul className="space-y-3">
        {sources.map(({ icon: Icon, title }) => (
          <li key={title} className="flex items-center gap-3 text-sm font-medium">
            <Icon size={18} className="shrink-0" aria-hidden="true" />
            {title}
          </li>
        ))}
      </ul>
    </section>
  );
}
