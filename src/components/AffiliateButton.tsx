import { Button } from "@/components/Button";
import { ExternalLink } from "lucide-react";

export default function AffiliateButton({ href, children = "Vezi oferta", className }: { href: string; children?: React.ReactNode; className?: string }) {
  const isInternal = href.startsWith("/");
  const rel = isInternal ? "sponsored" : "sponsored noopener noreferrer";
  const targetProps = isInternal ? {} : ({ target: "_blank" } as const);
  return (
    <Button asChild className={className}>
      <a href={href} {...targetProps} rel={rel} aria-label="Deschide oferta">
        {children}
        <ExternalLink className="ml-1" />
      </a>
    </Button>
  );
}
