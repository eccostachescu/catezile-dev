export type AnswerKind = 'event'|'match'|'movie';

export function renderAnswer(kind: AnswerKind, data: any): string {
  const fmt = (d: Date | string | number) => new Date(d).toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
  switch (kind) {
    case 'event':
      return `${data.title} are loc pe ${fmt(data.startDate)}.`;
    case 'match':
      return `${data.homeTeam} – ${data.awayTeam} începe la ${fmt(data.startDate)}${data.channels ? ` pe ${data.channels.join(', ')}` : ''}.`;
    case 'movie':
      return `${data.title} intră în cinematografe din ${fmt(data.releaseDate)}.`;
    default:
      return '';
  }
}

export function truncateForMeta(text: string, max = 160): string {
  if (!text) return text;
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/[\s,;.:!?-]+$/,'').trim() + '…';
}
