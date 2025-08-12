import { Button } from "@/components/Button";
import { ExternalLink } from "lucide-react";
import { track } from "@/lib/analytics";

export default function AffiliateButton({ href, children = "Vezi oferta", className, onClick }: { href: string; children?: React.ReactNode; className?: string; onClick?: () => void }) {
  const isInternal = href.startsWith("/");
  const rel = isInternal ? "sponsored" : "sponsored noopener noreferrer";
  const targetProps = isInternal ? {} : ({ target: "_blank" } as const);
  const handleClick = () => {
    try {
      const m = href.match(/^\/out\/(.+)$/);
      const id = m ? m[1] : undefined;
      track('affiliate_click', { affiliateLinkId: id, url: href });
    } catch {}
    try { onClick?.(); } catch {}
  };
  return (
    <Button asChild className={className}>
      <a href={href} {...targetProps} rel={rel} aria-label="Deschide oferta" onClick={handleClick}>
        {children}
        <ExternalLink className="ml-1" />
      </a>
    </Button>
  );
}
