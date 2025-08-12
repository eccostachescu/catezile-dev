import { useMemo, useState } from "react";

export default function Filters({
  tabs,
  team,
  tv,
  search,
  onReset,
}: {
  tabs: { value: 'today'|'tomorrow'|'weekend'|'all'; onChange: (v: 'today'|'tomorrow'|'weekend'|'all') => void };
  team: { value: string | null; onChange: (v: string | null) => void; options: string[] };
  tv: { value: string[]; onChange: (v: string[]) => void; options: string[] };
  search: { value: string; onChange: (v: string) => void };
  onReset: () => void;
}) {
  const tabList = [
    { key: 'today', label: 'Astăzi' },
    { key: 'tomorrow', label: 'Mâine' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'all', label: 'Toate' },
  ] as const;

  const teamOptions = useMemo(() => team.options, [team.options]);
  const tvOptions = useMemo(() => tv.options, [tv.options]);
  const [open, setOpen] = useState(false);
  const [teamQuery, setTeamQuery] = useState("");

  return (
    <div className="mb-4 border-b pb-3">
      <nav aria-label="Filtre timp" className="flex gap-2">
        {tabList.map((t) => (
          <button key={t.key} onClick={() => tabs.onChange(t.key)} aria-pressed={tabs.value === t.key} className={`px-3 py-1.5 rounded-md text-sm border ${tabs.value===t.key? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-sm">Echipă:</label>
        {/* Combobox cu search */}
        <div className="relative">
          <button
            className="text-sm border rounded-md px-2 py-1 bg-background"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {team.value || 'Toate'}
          </button>
          {open && (
            <div role="listbox" className="absolute z-10 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md">
              <input
                value={teamQuery}
                onChange={(e) => setTeamQuery(e.target.value)}
                placeholder="Caută echipă..."
                className="mb-1 w-full rounded-md border bg-background px-2 py-1 text-xs"
                aria-label="Caută echipă"
              />
              <button
                className={`w-full text-left px-2 py-1 text-sm rounded ${team.value===null? 'bg-muted' : ''}`}
                onClick={() => { team.onChange(null); setOpen(false); setTeamQuery(''); }}
              >
                Toate
              </button>
              <div className="max-h-56 overflow-auto">
                {teamOptions.filter(o => !teamQuery || o.toLowerCase().includes(teamQuery.toLowerCase())).map((opt) => (
                  <button key={opt} className={`w-full text-left px-2 py-1 text-sm rounded ${team.value===opt? 'bg-muted' : ''}`} onClick={() => { team.onChange(opt); setOpen(false); }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <label className="text-sm ml-2">TV:</label>
        <div className="flex flex-wrap gap-1">
          {tvOptions.map((opt) => {
            const active = tv.value.includes(opt);
            return (
              <button key={opt} onClick={() => tv.onChange(active ? tv.value.filter(v=>v!==opt) : [...tv.value, opt])} className={`px-2 py-1 rounded-md text-xs border ${active? 'bg-primary text-primary-foreground' : 'bg-card'}`} aria-pressed={active}>
                {opt}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder="Căutare rapidă"
            aria-label="Căutare rapidă"
            className="text-sm border rounded-md px-2 py-1 bg-background"
          />
          <button onClick={onReset} className="text-sm underline underline-offset-4">Resetează</button>
        </div>
      </div>
    </div>
  );
}
