import OutLink from "./OutLink";

export default function OfferCard({ offer }: { offer: { id: string; title: string; subtitle?: string | null; image_url?: string | null; discount_percent?: number | null; price?: number | null; price_old?: number | null; href: string; merchant?: { name: string; slug: string; logo_url?: string | null } | null } }) {
  const o = offer;
  return (
    <div className="rounded-md border p-3 hover:bg-muted/50">
      {o.image_url && (
        <div className="mb-2 aspect-square overflow-hidden rounded-sm border bg-muted/30">
          <img src={o.image_url} alt={o.title} loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-2 mb-1">
        {o.merchant?.logo_url && <img src={o.merchant.logo_url} width={18} height={18} alt={`Logo ${o.merchant.name}`} className="rounded-sm" />}
        <div className="text-xs text-muted-foreground truncate">{o.merchant?.name || '—'}</div>
        {typeof o.discount_percent === 'number' && <span className="ml-auto inline-flex items-center rounded-sm border px-2 py-0.5 text-xs">-{o.discount_percent}%</span>}
      </div>
      <div className="font-medium leading-snug line-clamp-2">{o.title}</div>
      {o.subtitle && <div className="text-sm text-muted-foreground line-clamp-2">{o.subtitle}</div>}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm">
          {o.price != null ? (
            <>
              <span className="font-semibold">{formatRON(o.price)}</span>{' '}
              {o.price_old != null && (<span className="text-muted-foreground line-through">{formatRON(o.price_old)}</span>)}
            </>
          ) : <span className="text-muted-foreground">Vezi oferta</span>}
        </div>
        <OutLink href={o.href} id={o.id} merchant={o.merchant?.slug}>Vezi oferta</OutLink>
      </div>
    </div>
  );
}

function formatRON(v?: number | null) {
  if (v == null) return '';
  try { return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 }).format(v); } catch { return `${v} lei`; }
}
