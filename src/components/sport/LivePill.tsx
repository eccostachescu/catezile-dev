export default function LivePill({ minute }: { minute?: number | string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 border-2 border-red-400 animate-pulse">
      <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" aria-hidden />
      <span className="inline-block w-2 h-2 rounded-full bg-white -ml-2" aria-hidden />
      LIVE{typeof minute !== 'undefined' && minute !== null ? ` ${String(minute)}'` : ''}
    </span>
  );
}
