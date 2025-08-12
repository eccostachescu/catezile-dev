import CountdownTimer from "@/components/CountdownTimer";

export default function CountdownHero({ title, target, city }: { title: string; target: Date; city?: string | null }) {
  return (
    <header className="text-center space-y-4">
      <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">{title}</h1>
      {city && <div className="text-sm text-muted-foreground">{city}</div>}
      <div className="mt-2">
        <CountdownTimer target={target} ariaLabel="Cronometru până la eveniment" />
      </div>
    </header>
  );
}
