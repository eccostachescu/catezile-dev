import React from "https://esm.sh/react@18.3.1";

export function BfTemplate({ year, merchant, subtitle }: { year: number; merchant: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', gap: 32, width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 90, lineHeight: 1 }}>Black Friday {year}</div>
      <div style={{ fontSize: 36, opacity: 0.95 }}>{merchant}</div>
      {subtitle && <div style={{ fontSize: 28, opacity: 0.85 }}>{subtitle}</div>}
    </div>
  );
}
