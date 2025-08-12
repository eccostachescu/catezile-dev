import React from "react";
import { tokens } from "./tokens";

export function Header({ logoUrl }: { logoUrl?: string }) {
  return (
    <div style={{ background: tokens.brand.bg, padding: '16px 0' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            <td align="center">
              <div style={{ width: tokens.container, maxWidth: '100%', padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="CateZile.ro" width="120" style={{ display: 'block' }} />
                  ) : (
                    <div style={{ color: '#fff', fontFamily: tokens.fontFamily, fontWeight: 700, fontSize: 18 }}>CateZile.ro</div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
