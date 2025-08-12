import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

export default function AdSlot({ consented = false, className }: { consented?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!consented || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.some(e => e.isIntersecting);
      if (vis && !seen) {
        setSeen(true);
        track('ad_view', { slot: className || 'default', page: location.pathname });
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [consented, seen, className]);

  if (!consented) {
    return (
      <div className={cn("rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground", className)}>
        Anunțuri dezactivate. <button className="underline underline-offset-4">Setări cookie</button>
      </div>
    );
  }
  return (
    <div ref={ref} className={cn("rounded-md border bg-card p-4 text-center text-sm", className)}>
      Publicitate • Slot 300×250
    </div>
  );
}
