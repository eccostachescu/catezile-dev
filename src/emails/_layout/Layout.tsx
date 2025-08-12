import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { tokens } from "./tokens";

export function Layout({ children, preheader, showUnsub, unsubUrl }: { children: React.ReactNode; preheader?: string; showUnsub?: boolean; unsubUrl?: string }) {
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        {preheader && (
          <div style={{ display: 'none', overflow: 'hidden', lineHeight: 1, maxHeight: 0, maxWidth: 0, opacity: 0 }}>
            {preheader}
          </div>
        )}
      </head>
      <body style={{ margin: 0, padding: 0, background: '#f8fafc' }}>
        <Header />
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
          <tbody>
            <tr>
              <td align="center">
                <div style={{ width: tokens.container, maxWidth: '100%', background: '#fff', borderRadius: tokens.radius, margin: '16px', padding: 16 }}>
                  {children}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <Footer showUnsub={showUnsub} unsubUrl={unsubUrl} />
      </body>
    </html>
  );
}
