import React from "https://esm.sh/react@18.3.1";

export function MovieTemplate({ title, cinema, netflix, prime, posterDataURL }: { title: string; cinema?: string; netflix?: string; prime?: string; posterDataURL?: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 32, width: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 64, lineHeight: 1.1 }}>{title}</div>
        {cinema && <div style={{ marginTop: 10, fontSize: 26 }}>La cinema din: {cinema}</div>}
        {netflix && <div style={{ marginTop: 6, fontSize: 26 }}>Pe Netflix din: {netflix}</div>}
        {prime && <div style={{ marginTop: 6, fontSize: 26 }}>Pe Prime din: {prime}</div>}
      </div>
      <div style={{ width: 360, height: 520, borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {posterDataURL ? <img src={posterDataURL} width={360} height={520} /> : <div style={{ opacity: 0.7, fontSize: 48 }}>Poster</div>}
      </div>
    </div>
  );
}
