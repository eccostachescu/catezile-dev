import { Clock, Calendar, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MovieMetaProps {
  runtime?: number;
  genres?: string[];
  certification?: string;
  popularity?: number;
  releaseYear?: number;
  className?: string;
}

export function MovieMeta({ 
  runtime, 
  genres, 
  certification, 
  popularity, 
  releaseYear,
  className = "" 
}: MovieMetaProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground ${className}`}>
      {runtime && (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{runtime} min</span>
        </div>
      )}
      
      {releaseYear && (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{releaseYear}</span>
        </div>
      )}
      
      {popularity && popularity > 50 && (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span>Popular</span>
        </div>
      )}
      
      {certification && (
        <Badge variant="outline" className="text-xs">
          {certification}
        </Badge>
      )}
      
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 3).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
          {genres.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{genres.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}