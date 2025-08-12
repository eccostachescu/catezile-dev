import React from "react";
import { tokens } from "./tokens";

export function Footer({ siteUrl = 'https://catezile.ro', showUnsub = false, unsubUrl }: { siteUrl?: string; showUnsub?: boolean; unsubUrl?: string }) {
  return (
    <div style={{ padding: '16px 0' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            <td align="center">
              <div style={{ width: tokens.container, maxWidth: '100%', padding: '0 16px' }}>
                <p style={{ margin: '0 0 8px', color: '#6b7280', fontFamily: tokens.fontFamily, fontSize: 12 }}>
                  Primești acest e‑mail deoarece ai setat remindere pe CateZile.ro.
                </p>
                <p style={{ margin: '0 0 8px', color: '#6b7280', fontFamily: tokens.fontFamily, fontSize: 12 }}>
                  <a href={`${siteUrl}/account#notifications`} style={{ color: '#6b7280' }}>Gestionează preferințele</a>
                  {showUnsub && unsubUrl ? (
                    <>
                      {' '}• <a href={unsubUrl} style={{ color: '#6b7280' }}>Dezabonează‑te</a>
                    </>
                  ) : null}
                </p>
                <p style={{ margin: '0', color: '#9ca3af', fontFamily: tokens.fontFamily, fontSize: 11 }}>
                  <a href={`${siteUrl}/legal/terms`} style={{ color: '#9ca3af' }}>Termeni</a> • <a href={`${siteUrl}/legal/privacy`} style={{ color: '#9ca3af' }}>Confidențialitate</a>
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
