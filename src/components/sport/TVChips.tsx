import { Badge } from "@/components/Badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export default function TVChips({ channels = [] as string[] }: { channels?: string[] }) {
  const list = (channels || []).slice(0, 3);
  const rest = (channels || []).slice(3);
  if (!channels?.length) return <span className="text-sm text-muted-foreground">Canalele nu sunt disponibile încă</span>;
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {list.map((c) => (
        <Badge key={c} variant="outline">{c}</Badge>
      ))}
      {rest.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground cursor-help" aria-label={`și încă ${rest.length} canale`}>+{rest.length}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{rest.join(', ')}</p>
          </TooltipContent>
        </Tooltip>
      )}

    </div>
  );
}
