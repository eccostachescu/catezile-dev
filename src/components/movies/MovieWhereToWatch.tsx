import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Platform {
  slug: string;
  name: string;
  available_from?: string;
  url?: string;
  available?: boolean;
}

interface MovieWhereToWatchProps {
  platforms: Platform[];
  streamingRo?: Record<string, string | null>;
  className?: string;
}

export function MovieWhereToWatch({ platforms, streamingRo, className = "" }: MovieWhereToWatchProps) {
  // Combine platforms data with streaming_ro data
  const allPlatforms: Platform[] = [...platforms];
  
  // Add platforms from streaming_ro that aren't already in platforms
  if (streamingRo) {
    Object.entries(streamingRo).forEach(([name, date]) => {
      if (!allPlatforms.find(p => p.name === name)) {
        allPlatforms.push({
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          available_from: date || undefined,
          available: true
        });
      }
    });
  }

  if (allPlatforms.length === 0) {
    return null;
  }

  const handlePlatformClick = (platform: Platform) => {
    if (platform.url) {
      // Track affiliate click
      window.open(platform.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAvailabilityText = (platform: Platform) => {
    if (platform.available_from) {
      const date = new Date(platform.available_from);
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return `Din ${date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}`;
      } else {
        return 'Disponibil acum';
      }
    }
    
    if (platform.available) {
      return 'Disponibil';
    }
    
    return 'Verifică disponibilitatea';
  };

  const getBadgeVariant = (platform: Platform) => {
    if (platform.available_from) {
      const date = new Date(platform.available_from);
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > 0 ? 'outline' : 'default';
    }
    
    return platform.available ? 'default' : 'secondary';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Unde să vezi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allPlatforms.map((platform) => (
          <div
            key={platform.slug}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="font-medium">{platform.name}</div>
              <Badge variant={getBadgeVariant(platform)} className="text-xs">
                {getAvailabilityText(platform)}
              </Badge>
            </div>
            
            {platform.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlatformClick(platform)}
                className="text-primary hover:text-primary-foreground hover:bg-primary"
              >
                Vezi acum
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p>
            Disponibilitatea poate varia. Verifică pe platformă pentru informații actualizate.
          </p>
          <p className="mt-1">
            Linkurile către platforme pot conține coduri de afiliere care ne ajută să menținem serviciul gratuit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}