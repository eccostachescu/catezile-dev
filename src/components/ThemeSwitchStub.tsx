import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitchStub() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cz-theme');
      return saved === 'dark';
    }
    return false; // Default to light mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem('cz-theme', 'dark');
    } else {
      root.classList.remove("dark");
      localStorage.setItem('cz-theme', 'light');
    }
  }, [dark]);

  return (
    <button
      aria-label={dark ? "Comută la modul luminos" : "Comută la modul întunecat"}
      className="h-9 w-9 rounded-md border border-[--cz-border] bg-[--cz-surface] hover:bg-[--cz-border] transition-colors flex items-center justify-center"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
