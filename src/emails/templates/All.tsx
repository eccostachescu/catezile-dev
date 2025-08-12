import React from "react";
import { Layout } from "../_layout/Layout";
import { EmailButton, EmailBadge, TVChips } from "../_layout/parts/Button";

export function ReminderEventEmail({ title, whenRO, url, icsUrl }: { title: string; whenRO: string; url: string; icsUrl: string }) {
  return (
    <Layout preheader={`Îți reamintim: ${title} — ${whenRO}`}> 
      <h2 style={{ margin: '0 0 8px' }}>{title}</h2>
      <p style={{ margin: '0 0 12px' }}>{whenRO}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <EmailButton href={url}>Vezi detalii</EmailButton>
        <a href={icsUrl} style={{ color: '#2563eb', alignSelf: 'center' }}>Adaugă în calendar (ICS)</a>
      </div>
    </Layout>
  );
}

export function ReminderMatchEmail({ title, whenRO, tv, url, icsUrl }: { title: string; whenRO: string; tv?: string[]; url: string; icsUrl: string }) {
  return (
    <Layout preheader={`Meciul începe ${whenRO}`}> 
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <EmailBadge>Sport</EmailBadge>
      </div>
      <h2 style={{ margin: '8px 0' }}>{title}</h2>
      <p style={{ margin: '0 0 8px' }}>{whenRO}</p>
      <TVChips tv={tv} />
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <EmailButton href={url}>Vezi detalii</EmailButton>
        <a href={icsUrl} style={{ color: '#2563eb', alignSelf: 'center' }}>Adaugă în calendar (ICS)</a>
      </div>
    </Layout>
  );
}

export function ReminderMovieEmail({ title, label, url, icsUrl, posterUrl }: { title: string; label: string; url: string; icsUrl: string; posterUrl?: string }) {
  return (
    <Layout preheader={`${label}: ${title}`}> 
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <EmailBadge>{label}</EmailBadge>
      </div>
      <h2 style={{ margin: '8px 0' }}>{title}</h2>
      {posterUrl && <img src={posterUrl} alt={`Poster ${title}`} width={120} style={{ borderRadius: 8 }} />}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <EmailButton href={url}>Vezi detalii</EmailButton>
        <a href={icsUrl} style={{ color: '#2563eb', alignSelf: 'center' }}>Adaugă în calendar (ICS)</a>
      </div>
      <p style={{ marginTop: 16, color: '#6b7280', fontSize: 12 }}>Acest produs folosește API‑ul TMDB, fără a fi aprobat sau certificat de TMDB.</p>
    </Layout>
  );
}

export function DigestWeeklyEmail({ title, sections }: { title: string; sections: { name: string; items: { title: string; when: string; url: string }[] }[] }) {
  return (
    <Layout preheader="Săptămâna ta pe CateZile.ro" showUnsub>
      <h2 style={{ margin: '0 0 8px' }}>{title}</h2>
      {sections.map((s) => (
        <div key={s.name} style={{ marginBottom: 12 }}>
          <h3 style={{ margin: '8px 0' }}>{s.name}</h3>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {s.items.map((it) => (
              <li key={it.url} style={{ marginBottom: 6 }}>
                <a href={it.url} style={{ color: '#2563eb', textDecoration: 'none' }}>{it.title}</a>
                <span style={{ color: '#6b7280' }}> — {it.when}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <EmailButton href="https://catezile.ro">Vezi mai multe pe CateZile.ro</EmailButton>
      </div>
    </Layout>
  );
}

export function TransactionalGenericEmail({ title, body, cta }: { title: string; body: string; cta?: { label: string; href: string } }) {
  return (
    <Layout preheader={title}>
      <h2 style={{ margin: '0 0 8px' }}>{title}</h2>
      <p style={{ margin: '0 0 12px' }}>{body}</p>
      {cta && <EmailButton href={cta.href}>{cta.label}</EmailButton>}
    </Layout>
  );
}
