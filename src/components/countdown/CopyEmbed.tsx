import { Button } from "@/components/Button";
import { toast } from "@/components/ui/use-toast";

export default function CopyEmbed({ id }: { id: string }) {
  const code = `<iframe src="https://catezile.ro/embed/${id}?theme=T2&units=dhms" style="width:100%;max-width:420px;height:160px;border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Countdown"></iframe>\n<script async src="https://catezile.ro/embed-resizer.js"></script>`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: 'Cod embed copiat' });
    } catch {}
  };
  return (
    <div className="space-y-2">
      <Button onClick={copy}>Copiază Embed</Button>
      <pre className="rounded-md border bg-muted/30 p-3 text-xs overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
}
