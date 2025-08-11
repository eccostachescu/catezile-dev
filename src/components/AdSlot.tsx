import { cn } from "@/lib/utils";

export default function AdSlot({ consented = false, className }: { consented?: boolean; className?: string }) {
  if (!consented) {
    return (
      <div className={cn("rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground", className)}>
        Anunțuri dezactivate. <button className="underline underline-offset-4">Setări cookie</button>
      </div>
    );
  }
  return (
    <div className={cn("rounded-md border bg-card p-4 text-center text-sm", className)}>
      Publicitate • Slot 300×250
    </div>
  );
}
