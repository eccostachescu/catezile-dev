import AdSlot from "@/components/AdSlot";

interface MovieAdRailProps {
  placement: 'movie-detail' | 'movie-list' | 'movie-hub';
  className?: string;
}

export function MovieAdRail({ placement, className = "" }: MovieAdRailProps) {
  const getAdKey = () => {
    switch (placement) {
      case 'movie-detail':
        return 'movie-detail-sidebar';
      case 'movie-list':
        return 'movie-list-rail';
      case 'movie-hub':
        return 'movie-hub-banner';
      default:
        return 'movie-default';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <AdSlot 
        id={getAdKey()}
        className="min-h-[250px]"
      />
      
      {placement === 'movie-detail' && (
        <>
          <AdSlot 
            id="movie-detail-sidebar-2"
            className="min-h-[250px] mt-8"
          />
          
          <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Îți place conținutul nostru?
            </p>
            <p className="text-xs text-muted-foreground">
              Publicitatea ne ajută să menținem serviciul gratuit pentru toți utilizatorii.
            </p>
          </div>
        </>
      )}
    </div>
  );
}