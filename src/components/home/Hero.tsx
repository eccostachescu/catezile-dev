import Container from "@/components/Container";
import SearchBox from "@/components/search/SearchBox";

export default function Hero({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <section className="bg-hero">
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-xl border bg-card/90 backdrop-blur shadow-lg p-6 sm:p-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">CateZile.ro — Câte zile până…</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Află rapid în câte zile sunt evenimentele importante, ce meciuri sunt la TV și când apar filmele în România.
          </p>
          <div className="mt-6">
            <div className="hidden sm:block">
              <SearchBox />
            </div>
            <div className="sm:hidden">
              <button className="h-10 px-4 rounded-md border" onClick={onOpenSearch} aria-label="Deschide căutarea">
                Caută
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
