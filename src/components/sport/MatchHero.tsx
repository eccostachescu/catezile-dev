export default function MatchHero({ title, derby }: { title: string; derby?: boolean }) {
  return (
    <header className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {derby && <span className="inline-flex items-center text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-800 border border-amber-500/40">Derby</span>}
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">{title}</h1>
    </header>
  );
}
