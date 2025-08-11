import { Button } from "@/components/Button";
import { ExternalLink } from "lucide-react";

export default function AffiliateButton({ href, children = "Vezi oferta", className }: { href: string; children?: React.ReactNode; className?: string }) {
  return (
    <Button asChild className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Deschide oferta în tab nou">
        {children}
        <ExternalLink className="ml-1" />
      </a>
    </Button>
  );
}
