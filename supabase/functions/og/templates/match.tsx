import React from "https://esm.sh/react@18.3.1";

export function MatchTemplate({ title, subtitle, derby, tv }: { title: string; subtitle?: string; derby?: boolean; tv?: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 32, width: '100%', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 72, lineHeight: 1.05 }}>{title}</div>
        {derby && <div style={{ marginTop: 12, display: 'inline-block', padding: '6px 10px', background: '#fca5a5', color: '#111', borderRadius: 6, fontWeight: 700 }}>Derby</div>}
        {subtitle && <div style={{ marginTop: 12, fontSize: 28, opacity: 0.9 }}>{subtitle}</div>}
        {!!(tv && tv.length) && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            {tv.slice(0,3).map((c) => (
              <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 22 }}>{c}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
