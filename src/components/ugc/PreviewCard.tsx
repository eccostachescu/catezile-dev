import CountdownTimer from "@/components/CountdownTimer";

interface PreviewCardProps {
  title: string;
  targetAt: Date | null;
  city?: string;
}

export default function PreviewCard({ title, targetAt, city }: PreviewCardProps) {
  if (!targetAt) return null;
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <h3 className="text-base font-medium">Previzualizare</h3>
        <p className="text-sm text-muted-foreground">Așa va arăta countdown-ul tău.</p>
      </div>
      <div>
        <div className="text-xl font-semibold">{title || 'Titlu eveniment'}</div>
        {city && <div className="text-sm text-muted-foreground">{city}</div>}
      </div>
      <CountdownTimer target={targetAt} />
      <div className="text-xs text-muted-foreground">
        Țintă: {targetAt.toLocaleString('ro-RO')}
      </div>
    </div>
  );
}
