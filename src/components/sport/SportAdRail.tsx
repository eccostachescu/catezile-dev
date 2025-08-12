import AdSlot from "@/components/AdSlot";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function SportAdRail({ position }: { position?: 'mid'|'end' }) {
  useEffect(() => { track('ad_view', { position: position || 'unknown' }); }, [position]);
  return (
    <div className="my-6" aria-label="slot publicitate">
      <AdSlot consented={false} className="h-[250px]" />
    </div>
  );
}
