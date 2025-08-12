import React from "react";
import { tokens } from "../_layout/tokens";

type ButtonProps = { href: string; children: React.ReactNode };
export function EmailButton({ href, children }: ButtonProps) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        background: tokens.brand.primary,
        color: '#fff',
        textDecoration: 'none',
        padding: '12px 16px',
        borderRadius: tokens.radius,
        fontFamily: tokens.fontFamily,
        fontSize: 14,
      }}
    >
      {children}
    </a>
  );
}

export function EmailBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        border: '1px solid #e5e7eb',
        color: '#374151',
        padding: '2px 8px',
        borderRadius: 999,
        fontFamily: tokens.fontFamily,
        fontSize: 12,
      }}
    >
      {children}
    </span>
  );
}

export function TVChips({ tv }: { tv?: string[] | null }) {
  if (!tv || tv.length === 0) return null;
  return (
    <div style={{ fontFamily: tokens.fontFamily, fontSize: 13, color: '#374151' }}>
      Canale: {tv.join(', ')}
    </div>
  );
}
