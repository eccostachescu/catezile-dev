import { useState } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface MovieTrailerProps {
  trailerKey?: string;
  title: string;
  posterUrl?: string;
  className?: string;
}

export function MovieTrailer({ trailerKey, title, posterUrl, className = "" }: MovieTrailerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  if (!trailerKey) {
    return null;
  }

  const trailerUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`;

  const handleOpenTrailer = () => {
    // Check consent for YouTube cookies
    const consent = localStorage.getItem('cookie-consent-youtube');
    if (consent === 'true') {
      setHasConsent(true);
      setIsOpen(true);
    } else {
      // Show consent dialog first
      setIsOpen(true);
    }
  };

  const handleAcceptConsent = () => {
    localStorage.setItem('cookie-consent-youtube', 'true');
    setHasConsent(true);
  };

  return (
    <>
      <Card className={`group cursor-pointer overflow-hidden transition-all hover:shadow-md ${className}`}>
        <div 
          className="relative aspect-video bg-black/5"
          onClick={handleOpenTrailer}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${title} trailer`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Play className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/30">
            <div className="flex items-center justify-center rounded-full bg-white/90 p-4 transition-transform group-hover:scale-110">
              <Play className="h-8 w-8 text-black fill-black" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium">Vezi trailer</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {hasConsent ? (
              <div className="aspect-video">
                <iframe
                  src={trailerUrl}
                  title={`${title} trailer`}
                  className="h-full w-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-muted p-8">
                <div className="text-center space-y-4 max-w-md">
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt={title}
                      className="w-32 h-48 object-cover rounded-lg mx-auto mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold">Vezi trailer pe YouTube</h3>
                  <p className="text-muted-foreground">
                    Pentru a vizualiza acest trailer, YouTube va seta cookie-uri pentru a îmbunătăți experiența ta.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleAcceptConsent}>
                      Accept și vezi trailer
                    </Button>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Anulează
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Poți modifica preferințele pentru cookie-uri oricând din setări.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}