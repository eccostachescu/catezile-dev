import React from "https://esm.sh/react@18.3.1";
import { Theme } from "../theme.ts";

export function buildBase({ theme, width, height }: { theme: Theme; width: number; height: number }) {
  return function Base({ children }: { children?: React.ReactNode }) {
    return (
      <div style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        background: theme.background,
        color: theme.fg,
        fontFamily: 'Inter',
        padding: '60px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>CateZile.ro</div>
          <div style={{ fontSize: 18, opacity: 0.8 }}>{theme.badge}</div>
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
          {children}
        </div>
        <div style={{ position: 'absolute', bottom: 24, right: 60, fontSize: 18, opacity: 0.8 }}>catezile.ro</div>
      </div>
    );
  };
}
