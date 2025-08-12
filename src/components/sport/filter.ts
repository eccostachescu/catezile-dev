export type SportMatch = {
  id: string;
  home: string;
  away: string;
  kickoff_at: string | Date;
  tv_channels?: string[] | null;
  is_derby?: boolean | null;
  status?: string | null;
  score?: any;
};

export function filterMatch(m: SportMatch, team: string | null, tv: string[], q: string) {
  const teamOk = team ? (m.home === team || m.away === team) : true;
  const tvOk = tv.length ? (m.tv_channels || []).some((c) => tv.includes(c)) : true;
  const query = (q || '').trim().toLowerCase();
  const qOk = query ? (
    m.home.toLowerCase().includes(query) ||
    m.away.toLowerCase().includes(query) ||
    (m.tv_channels || []).some((c) => c.toLowerCase().includes(query))
  ) : true;
  return teamOk && tvOk && qOk;
}
