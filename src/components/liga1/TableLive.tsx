import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TableLive({ rows, loading }: { rows: Array<{ team_name: string; points: number; played: number; wins: number; draws: number; losses: number; gf: number; ga: number }>; loading?: boolean }) {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Se încarcă…</div>;
  }
  if (!rows?.length) {
    return <div className="text-sm text-muted-foreground">Clasamentul nu este disponibil încă.</div>;
  }
  return (
    <Table data-testid="liga1-table">
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Echipă</TableHead>
          <TableHead className="text-right">M</TableHead>
          <TableHead className="text-right">V</TableHead>
          <TableHead className="text-right">E</TableHead>
          <TableHead className="text-right">Î</TableHead>
          <TableHead className="text-right">Gol</TableHead>
          <TableHead className="text-right">Pct</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, idx) => (
          <TableRow key={r.team_name}>
            <TableCell className="w-10">{idx + 1}</TableCell>
            <TableCell className="font-medium">{r.team_name}</TableCell>
            <TableCell className="text-right">{r.played}</TableCell>
            <TableCell className="text-right">{r.wins}</TableCell>
            <TableCell className="text-right">{r.draws}</TableCell>
            <TableCell className="text-right">{r.losses}</TableCell>
            <TableCell className="text-right">{r.gf}-{r.ga}</TableCell>
            <TableCell className="text-right font-semibold">{r.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
