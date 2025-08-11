import { format } from "date-fns";
import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import CountdownTimer from "@/components/CountdownTimer";

export interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  datetime: Date | string | number;
  tv?: string[];
  isDerby?: boolean;
}

export default function MatchCard({ homeTeam, awayTeam, datetime, tv = [], isDerby }: MatchCardProps) {
  const date = new Date(datetime);
  return (
    <Card className="hover-scale">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge>Sport</Badge>
          {isDerby && <Badge variant="secondary">Derby</Badge>}
        </div>
        <CardTitle className="text-2xl sm:text-3xl">{homeTeam} vs {awayTeam}</CardTitle>
        <CardDescription>
          {format(date, "PPP p")} • {tv.length ? `TV: ${tv.join(", ")}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CountdownTimer target={date} />
        {tv.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tv.map((c) => (
              <Badge key={c} variant="outline">{c}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
