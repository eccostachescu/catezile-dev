import { track } from "@/lib/analytics";

export default function OutLink({ href, children, id, merchant }: { href: string; children: React.ReactNode; id?: string; merchant?: string }) {
  return (
    <a
      href={href}
      rel="nofollow sponsored"
      onClick={()=> track('bf_offer_click', { id, merchant })}
      className="inline-flex items-center justify-center h-9 rounded-md border px-3 hover:bg-muted"
    >
      {children}
    </a>
  );
}
