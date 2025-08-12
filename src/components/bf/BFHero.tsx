import { useMemo } from "react";

export default function BFHero({ bfDate, live = false }: { bfDate?: string | null; live?: boolean }) {
  const target = useMemo(()=> bfDate ? new Date(bfDate) : null, [bfDate]);
  const daysLeft = useMemo(()=> {
    if (!target) return null;
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (24*3600*1000)));
  }, [target]);

  return (
    <section className="py-6">
      <div className="rounded-xl border p-5 bg-gradient-to-br from-background to-muted">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Black Friday România {new Date().getFullYear()}</h1>
            {live ? (
              <div className="mt-1 text-sm"><span className="mr-2 inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" /> Live acum</div>
            ) : (
              daysLeft != null && <div className="mt-1 text-sm text-muted-foreground">În {daysLeft} zile</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
