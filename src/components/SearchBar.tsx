import { useState } from "react";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  return (
    <form role="search" className="w-full flex items-center gap-2" onSubmit={(e)=>e.preventDefault()}>
      <input
        aria-label="Caută evenimente"
        placeholder="Caută evenimente, filme, sport…"
        className="flex-1 h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
      />
      {!compact && (
        <button className="h-10 px-3 rounded-md border">Caută</button>
      )}
    </form>
  );
}
