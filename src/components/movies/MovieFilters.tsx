import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MovieFiltersProps {
  genres: string[];
  platforms: string[];
  years: number[];
  selectedGenres: string[];
  selectedPlatforms: string[];
  selectedYear?: number;
  onGenreChange: (genres: string[]) => void;
  onPlatformChange: (platforms: string[]) => void;
  onYearChange: (year?: number) => void;
  onClearAll: () => void;
  className?: string;
}

export function MovieFilters({
  genres,
  platforms,
  years,
  selectedGenres,
  selectedPlatforms,
  selectedYear,
  onGenreChange,
  onPlatformChange,
  onYearChange,
  onClearAll,
  className = ""
}: MovieFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onPlatformChange([...selectedPlatforms, platform]);
    }
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedPlatforms.length > 0 || selectedYear;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtrează
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {selectedGenres.length + selectedPlatforms.length + (selectedYear ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Șterge filtrele
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedGenres.map((genre) => (
            <Badge
              key={genre}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleGenre(genre)}
            >
              {genre}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {selectedPlatforms.map((platform) => (
            <Badge
              key={platform}
              variant="outline"
              className="cursor-pointer"
              onClick={() => togglePlatform(platform)}
            >
              {platform}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {selectedYear && (
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => onYearChange(undefined)}
            >
              {selectedYear}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {isOpen && (
        <Card className="p-4 space-y-6">
          {/* Year filter */}
          <div>
            <h3 className="font-medium mb-3">An</h3>
            <Select
              value={selectedYear?.toString()}
              onValueChange={(value) => onYearChange(value ? parseInt(value) : undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selectează anul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toate anii</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Genre filter */}
          <div>
            <h3 className="font-medium mb-3">Genuri</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Platform filter */}
          {platforms.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Platforme</h3>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <Badge
                    key={platform}
                    variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}