import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const theme = document.documentElement.dataset.theme;
      setDark(theme ? theme === "dark" : media.matches);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  function toggle() {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    setDark(!dark);
    try { localStorage.setItem("aerosense-theme", theme); } catch { /* Browser storage is optional. */ }
  }
  return (
    <button type="button" className="theme-toggle" aria-label="Mode gelap" aria-pressed={dark} onClick={toggle}>
      <Moon className="theme-icon-moon" size={18} aria-hidden="true" />
      <Sun className="theme-icon-sun" size={18} aria-hidden="true" />
    </button>
  );
}
