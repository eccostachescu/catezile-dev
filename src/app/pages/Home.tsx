import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import CountdownTimer from "@/components/CountdownTimer";
import { getInitialData } from "@/ssg/serialize";

export default function Home() {
  const target = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  // Consume initialData to avoid any client refetch pattern (reserved for future data)
  const _initial = getInitialData<{ kind: string }>();
  return (
    <>
      <SEO title="Câte zile până…" path="/" />
      <section className="bg-hero">
        <Container className="py-16">
          <div className="mx-auto max-w-3xl rounded-xl border bg-card/90 backdrop-blur shadow-lg p-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Câte zile până la următoarele evenimente?</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Descoperă countdown‑uri clare pentru sărbători, examene, sport și filme.</p>
            <div className="mt-8">
              <CountdownTimer target={target} ariaLabel="Exemplu countdown 30 de zile" />
            </div>
          </div>
        </Container>
      </section>
      <section className="py-12">
        <Container>
          <h2 className="sr-only">Secțiuni populare</h2>
        </Container>
      </section>
    </>
  );
}
