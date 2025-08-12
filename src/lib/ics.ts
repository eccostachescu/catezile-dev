export function buildIcs({ title, start, end, url }: { title: string; start: Date; end?: Date | null; url?: string }) {
  const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
  const dtStart = dt(start);
  const dtEnd = dt(end ? end : new Date(start.getTime() + 60*60*1000));
  const uid = `${Date.now()}@catezile.ro`;
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CateZile.ro//EN\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dt(new Date())}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:${escapeText(title)}\n${url ? `URL:${escapeText(url)}\n` : ''}END:VEVENT\nEND:VCALENDAR`;
}

function escapeText(s: string) {
  return s.replace(/[,;\\]/g, (m) => ({ ',': '\\,', ';': '\\;', '\\': '\\\\' }[m]!));
}
