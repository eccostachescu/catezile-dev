import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { Badge } from "@/components/Badge";

export interface MovieCardProps {
  title: string;
  posterUrl?: string;
  inCinemasAt?: Date | string | number;
  onNetflixAt?: Date | string | number;
  onPrimeAt?: Date | string | number;
}

export default function MovieCard({ title, posterUrl = "/placeholder.svg", inCinemasAt, onNetflixAt, onPrimeAt }: MovieCardProps) {
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
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
