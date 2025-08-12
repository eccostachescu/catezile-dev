import Container from "@/components/Container";
import { track } from "@/lib/analytics";

export default function BFTopOffers({ items = [] as Array<{ id: string; title: string; subtitle?: string | null; image_url?: string | null; discount_percent?: number | null; price?: number | null; price_old?: number | null; href: string; merchant?: { name: string; slug: string; logo_url?: string | null } | null }> }) {
  if (!items?.length) return null;
  return (
    <section className="py-6" aria-labelledby="bf-top-title">
      <Container>
        <div className="flex items-center justify-between mb-3">
          <h2 id="bf-top-title" className="text-xl font-semibold">Top Oferte Black Friday</h2>
          <a className="text-sm underline underline-offset-4" href="/black-friday">Vezi hub</a>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x">
          {items.slice(0,10).map((o) => (
            <a key={o.id} href={o.href} rel="nofollow sponsored" className="min-w-[240px] snap-start rounded-md border p-3 hover:bg-muted" onClick={()=>track('bf_offer_click',{id:o.id,merchant:o.merchant?.slug})}>
              <div className="flex items-center gap-2 mb-2">
                {o.merchant?.logo_url && (
                  <img src={o.merchant.logo_url} alt={`Logo ${o.merchant.name}`} width={24} height={24} loading="lazy" className="rounded-sm" />
                )}
                <div className="text-xs text-muted-foreground">{o.merchant?.name || 'Merchant'}</div>
                {typeof o.discount_percent === 'number' && (
                  <span className="ml-auto inline-flex items-center rounded-sm border px-2 py-0.5 text-xs">-{o.discount_percent}%</span>
                )}
              </div>
              {o.image_url && (
                <div className="mb-2 aspect-square overflow-hidden rounded-sm border bg-muted/30">
                  <img src={o.image_url} alt={o.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="font-medium leading-snug line-clamp-2">{o.title}</div>
              {o.subtitle && <div className="text-sm text-muted-foreground line-clamp-2">{o.subtitle}</div>}
              <div className="mt-2 text-sm">
                {o.price != null ? (
                  <>
                    <span className="font-semibold">{formatRON(o.price)}</span>{' '}
                    {o.price_old != null && (
                      <span className="text-muted-foreground line-through">{formatRON(o.price_old)}</span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">Vezi oferta</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

function formatRON(v: number) {
  try { return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(v); } catch { return `${v} lei`; }
}
