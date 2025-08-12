import { Button } from "@/components/ui/button";
import { routes } from "@/app/routes";
import CopyEmbed from "@/components/countdown/CopyEmbed";
import { toast } from "@/components/ui/use-toast";

export default function SuccessPanel({ id, slug }: { id: string; slug?: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}${routes.countdown(id)}` : routes.countdown(id);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copiat' });
  };

  return (
    <section className="rounded-lg border p-4 space-y-4" aria-live="polite">
      <div>
        <h3 className="text-lg font-semibold">Gata! Countdown-ul e în așteptare.</h3>
        <p className="text-sm text-muted-foreground">Îl aprobăm în 1–24h. Între timp îl poți partaja sau încorpora.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={routes.countdown(id)} className="inline-flex"><Button>Vezi pagina</Button></a>
        <Button variant="outline" onClick={() => copy(url)}>Copiază link</Button>
      </div>
      <CopyEmbed id={id} />
    </section>
  );
}
