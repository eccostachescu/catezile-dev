import AffiliateButton from "@/components/AffiliateButton";
import { Button } from "@/components/Button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Offer = { id: string; partner: string; url: string };

export default function TicketCTA({ offers }: { offers?: Offer[] }) {
  if (!offers || offers.length === 0) return null;
  if (offers.length === 1) {
    const o = offers[0];
    return (
      <div className="space-y-1">
        <AffiliateButton href={`/out/${o.id}`}>Cumpără bilete</AffiliateButton>
        <p className="text-xs text-muted-foreground">Link afiliat — putem primi un comision.</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Cumpără bilete <ChevronDown className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Alege partenerul</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {offers.map((o) => (
            <DropdownMenuItem key={o.id} asChild>
              <a href={`/out/${o.id}`}>{o.partner}</a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-xs text-muted-foreground">Linkuri afiliate — putem primi un comision.</p>
    </div>
  );
}
