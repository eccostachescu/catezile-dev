import { useMemo } from "react";

export default function Filters({
  tabs,
  team,
  tv,
  onReset,
}: {
  tabs: { value: 'today'|'tomorrow'|'weekend'|'all'; onChange: (v: 'today'|'tomorrow'|'weekend'|'all') => void };
  team: { value: string | null; onChange: (v: string | null) => void; options: string[] };
  tv: { value: string[]; onChange: (v: string[]) => void; options: string[] };
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
        <select className="text-sm border rounded-md px-2 py-1 bg-background" value={team.value ?? ''} onChange={(e) => team.onChange(e.target.value || null)}>
          <option value="">Toate</option>
          {teamOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <label className="text-sm ml-4">TV:</label>
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
        <button onClick={onReset} className="ml-auto text-sm underline underline-offset-4">Resetează</button>
      </div>
    </div>
  );
}
