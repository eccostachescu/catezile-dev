export default function LivePill({ minute }: { minute?: number | string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-600 border border-red-500/30">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" aria-hidden />
      LIVE{typeof minute !== 'undefined' && minute !== null ? ` ${String(minute)}'` : ''}
    </span>
  );
}
