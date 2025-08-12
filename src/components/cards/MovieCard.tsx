import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { Badge } from "@/components/Badge";
import ReminderButton from "@/components/ReminderButton";

export interface MovieCardProps {
  id?: string;
  title: string;
  posterUrl?: string;
  inCinemasAt?: Date | string | number;
  onNetflixAt?: Date | string | number;
  onPrimeAt?: Date | string | number;
}

export default function MovieCard({ id, title, posterUrl = "/placeholder.svg", inCinemasAt, onNetflixAt, onPrimeAt }: MovieCardProps) {
  const when = inCinemasAt || onNetflixAt || onPrimeAt;
  return (
    <Card className="hover-scale overflow-hidden">
      <div className="grid grid-cols-3 gap-0">
        <img src={posterUrl} alt={`Poster ${title}`} className="col-span-1 aspect-[2/3] object-cover" loading="lazy" />
        <div className="col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge>Film</Badge>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
            <CardDescription>
              {inCinemasAt && <>La cinema din {format(new Date(inCinemasAt), "PPP")} • </>}
              {onNetflixAt && <>Pe Netflix din {format(new Date(onNetflixAt), "PPP")} • </>}
              {onPrimeAt && <>Pe Prime din {format(new Date(onPrimeAt), "PPP")}</>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ține aproape pentru detalii și oferte.</p>
            {when && (
              <div className="pt-2">
                <ReminderButton when={new Date(when)} kind="movie" entityId={id} />
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
