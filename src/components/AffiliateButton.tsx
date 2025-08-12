import { Button } from "@/components/Button";
import { ExternalLink } from "lucide-react";

export default function AffiliateButton({ href, children = "Vezi oferta", className }: { href: string; children?: React.ReactNode; className?: string }) {
  const isInternal = href.startsWith("/");
  const targetProps = isInternal ? {} : ({ target: "_blank", rel: "noopener noreferrer" } as const);
  return (
    <Button asChild className={className}>
      <a href={href} {...targetProps} aria-label="Deschide oferta">
        {children}
        <ExternalLink className="ml-1" />
      </a>
    </Button>
  );
}
