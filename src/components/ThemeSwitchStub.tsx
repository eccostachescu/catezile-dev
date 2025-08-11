import { useEffect, useState } from "react";

export default function ThemeSwitchStub() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <button
      aria-label="Theme switch"
      className="h-9 px-3 rounded-md border bg-background hover:bg-accent transition-colors"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
