import { Badge } from "@/components/Badge";

export default function WatchBadges({ cinemaDate, netflixDate, primeDate, provider }: { cinemaDate?: string | null; netflixDate?: string | null; primeDate?: string | null; provider?: any }) {
  const today = new Date().toISOString().slice(0,10);
  const hasNetflixNow = provider?.netflix?.available && !netflixDate;
  const hasPrimeNow = provider?.prime?.available && !primeDate;
  return (
    <div className="flex flex-wrap gap-2">
      {cinemaDate && (
        <Badge>{new Date(cinemaDate) > new Date(today) ? `La cinema din ${new Date(cinemaDate).toLocaleDateString('ro-RO')}` : `În cinema`}</Badge>
      )}
      {netflixDate && <Badge>Pe Netflix din {new Date(netflixDate).toLocaleDateString('ro-RO')}</Badge>}
      {primeDate && <Badge>Pe Prime din {new Date(primeDate).toLocaleDateString('ro-RO')}</Badge>}
      {hasNetflixNow && <Badge>Disponibil acum pe Netflix</Badge>}
      {hasPrimeNow && <Badge>Disponibil acum pe Prime</Badge>}
      {!cinemaDate && !netflixDate && !primeDate && !hasNetflixNow && !hasPrimeNow && (
        <Badge variant="outline">Streaming TBA</Badge>
      )}
    </div>
  );
}
