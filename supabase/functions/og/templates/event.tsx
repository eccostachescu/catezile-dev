import React from "https://esm.sh/react@18.3.1";

export function EventTemplate({ title, subtitle, badge, imageDataURL }: { title: string; subtitle?: string; badge?: string; imageDataURL?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 64, lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ marginTop: 12, fontSize: 28, opacity: 0.9 }}>{subtitle}</div>}
        {badge && <div style={{ marginTop: 16, fontSize: 22, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.12)' }}>{badge}</div>}
      </div>
      <div style={{ width: 360, height: 360, borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
        {imageDataURL && <img src={imageDataURL} width={360} height={360} />}
      </div>
    </div>
  );
}
